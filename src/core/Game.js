import { Player } from '../entities/Player.js';
import { InputManager } from './InputManager.js';
import { EntityManager } from './EntityManager.js';
import { Renderer } from './Renderer.js';
import { EventBus, GameEvents } from './EventBus.js';
import { Bounds } from './Bounds.js';
import { AttackController } from './AttackController.js';
import { CollisionSystem } from './CollisionSystem.js';
import { WaveManager } from './WaveManager.js';
import { ArmyUnit } from '../entities/ArmyUnit.js';
import { ParticleSystem } from './ParticleSystem.js';
import { ShaderEffects } from './ShaderEffects.js';
import { UIManager } from './UIManager.js';
import { CardSystem } from './CardSystem.js';

/**
 * Motor principal del juego
 * Maneja el loop principal, renderizado y actualización
 */
export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        if (!this.ctx) {
            throw new Error('No se pudo obtener el contexto 2D del canvas');
        }
        
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Sistemas core
        this.inputManager = new InputManager();
        this.entityManager = new EntityManager();
        this.renderer = new Renderer(this.ctx, this.width, this.height);
        this.eventBus = new EventBus();
        this.bounds = new Bounds(this.width, this.height);
        this.particleSystem = new ParticleSystem({ maxParticles: 800, enabled: true });
        this.shaderEffects = new ShaderEffects({ quality: 'high', enabled: true });
        this.uiManager = new UIManager(this.width, this.height);
        this.cardSystem = new CardSystem(this.eventBus);
        
        // Entidades
        this.player = new Player(this.width / 2, this.height / 2);
        this.player.eventBus = this.eventBus; // Inyectar eventBus
        this.enemies = [];
        this.army = [];
        this.projectiles = [];
        this.enemyProjectiles = []; // Proyectiles de enemigos (chamanes)
        
        // Controladores
        this.attackController = new AttackController(this.player, this.projectiles, this.eventBus);
        this.collisionSystem = new CollisionSystem(this.eventBus);
        this.waveManager = new WaveManager(this.bounds, this.eventBus);
        
        // Spawn rate
        this.enemySpawnCooldown = 0.5; // segundos entre spawns
        this.timeSinceLastSpawn = 0;
        
        // Registrar grupos de entidades
        this.entityManager.register('enemies', this.enemies);
        this.entityManager.register('army', this.army);
        this.entityManager.register('projectiles', this.projectiles);
        this.entityManager.register('enemyProjectiles', this.enemyProjectiles);
        
        // Estado del juego
        this.running = false;
        this.paused = false; // Nueva propiedad para pausas
        this.lastTime = 0;
        this.gameTime = 0; // Tiempo de juego controlado (se pausa con el juego)
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // Mouse tracking
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Configuración
        this.showDebug = true;
        
        // Configurar listeners de eventos
        this.setupEventListeners();
        this.setupMouseListeners();
    }
    
    setupEventListeners() {
        this.eventBus.on(GameEvents.PLAYER_LEVEL_UP, (data) => {
            console.log(`¡Nivel ${data.level} alcanzado!`);
            
            // Efecto visual de level up
            this.particleSystem.createExplosion(
                data.player.x + data.player.width / 2,
                data.player.y + data.player.height / 2,
                { count: 30, color: '#8b00ff', speed: 150, size: 6 }
            );
            
            // Pausar juego y mostrar cartas
            this.pauseForCards(data.level);
        });
        
        this.eventBus.on(GameEvents.ENEMY_DEFEATED, (data) => {
            this.player.addExperience(data.experience || 10);
            
            // Efecto de muerte
            this.particleSystem.createExplosion(
                data.enemy.x + data.enemy.width / 2,
                data.enemy.y + data.enemy.height / 2,
                { count: 12, color: data.enemy.color, speed: 120, size: 4 }
            );
            
            // Convertir enemigo en aliado si hay capacidad
            if (this.army.length < this.player.armyCapacity) {
                this.convertEnemyToAlly(data.enemy);
            }
        });
        
        this.eventBus.on(GameEvents.PROJECTILE_HIT, (data) => {
            // Efecto de impacto
            this.particleSystem.createImpact(
                data.target.x + data.target.width / 2,
                data.target.y + data.target.height / 2,
                data.projectile.vx,
                data.projectile.vy
            );
        });
        
        this.eventBus.on(GameEvents.GAME_OVER, (data) => {
            console.log('❌ Game Over');
            this.stop();
        });
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    stop() {
        this.running = false;
    }

    loop(currentTime) {
        if (!this.running) return;
        
        // Calcular deltaTime en segundos
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Actualizar FPS
        this.updateFPS(currentTime);
        
        // Actualizar y renderizar
        this.update(deltaTime);
        this.render();
        
        // Continuar el loop
        requestAnimationFrame((time) => this.loop(time));
    }

    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }

    update(deltaTime) {
        // Si está pausado, solo actualizar UI
        if (this.paused) {
            this.uiManager.update(deltaTime);
            return;
        }
        
        // Incrementar tiempo de juego (solo cuando no está pausado)
        this.gameTime += deltaTime;
        
        // Limitar deltaTime para evitar saltos grandes
        deltaTime = Math.min(deltaTime, 0.1);
        
        // Actualizar wave manager
        this.waveManager.update(deltaTime, this.enemies);
        
        // Spawn de enemigos
        this.timeSinceLastSpawn += deltaTime;
        if (this.timeSinceLastSpawn >= this.enemySpawnCooldown) {
            if (this.waveManager.spawnEnemy(this.enemies, this.player)) {
                this.timeSinceLastSpawn = 0;
            }
        }
        
        // Actualizar input del jugador
        const movement = this.inputManager.getMovementInput();
        this.player.setInput(movement.x, movement.y);
        
        // Actualizar ataque
        const attackPressed = this.inputManager.isAttackPressed();
        this.attackController.update(deltaTime, attackPressed, this.enemies);
        
        // Actualizar jugador
        this.player.update(deltaTime);
        this.bounds.clamp(this.player);
        
        // Actualizar enemigos y establecer targets (FASE 8: AGRO)
        this.enemies.forEach(enemy => {
            // Encontrar el objetivo más cercano (jugador o aliados)
            enemy.findClosestTarget(this.player, this.army);
            
            // Chamanes disparan proyectiles
            if (enemy.type === 'shaman' && enemy.active) {
                enemy.shootProjectile(this.enemyProjectiles);
            }
        });
        
        // Actualizar aliados y hacerles buscar enemigos
        this.army.forEach(ally => {
            if (ally.mode === 'follow' && this.enemies.length > 0) {
                ally.findNearestEnemy(this.enemies);
            }
        });
        
        // Actualizar todas las entidades usando EntityManager
        this.entityManager.update('army', deltaTime);
        this.entityManager.update('enemies', deltaTime);
        this.entityManager.update('projectiles', deltaTime);
        this.entityManager.update('enemyProjectiles', deltaTime); // Proyectiles enemigos
        
        // Limpiar proyectiles fuera de bounds
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            if (this.bounds.isOutOfBounds(this.projectiles[i])) {
                this.projectiles[i].active = false;
            }
        }
        
        // Limpiar proyectiles enemigos fuera de bounds
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            if (this.bounds.isOutOfBounds(this.enemyProjectiles[i])) {
                this.enemyProjectiles[i].active = false;
            }
        }
        
        // Aplicar bounds a entidades que lo necesiten
        this.army.forEach(unit => this.bounds.clamp(unit));
        
        // Colisiones
        this.collisionSystem.resolveProjectileEnemyCollisions(this.projectiles, this.enemies);
        this.collisionSystem.resolveEnemyPlayerCollisions(this.enemies, this.player, deltaTime);
        this.collisionSystem.resolveEnemyAllyCollisions(this.enemies, this.army, deltaTime); // FASE 8
        this.collisionSystem.resolveEnemyProjectileCollisions(this.enemyProjectiles, this.player, this.army);
        
        // Actualizar partículas
        this.particleSystem.update(deltaTime);
        
        // FASE A: Garbage Collection automático cada frame (Fuente de Verdad Única)
        // Eliminar aliados muertos IN-PLACE para no romper la referencia del EntityManager
        this.frameCount++;
        let removedCount = 0;
        for (let i = this.army.length - 1; i >= 0; i--) {
            if (!this.army[i].active || this.army[i].health <= 0) {
                this.army.splice(i, 1);
                removedCount++;
            }
        }
        
        if (removedCount > 0 && this.frameCount % 30 === 0) {
            console.log(`🧹 GC: ${removedCount} aliado(s) eliminado(s) - Contador real: ${this.army.length}/${this.player.armyCapacity}`);
        }
        
        // Actualizar UI
        this.uiManager.update(deltaTime);
        
        // FASE B: Aplicar aura de sanación del jugador a aliados
        this.player.applyHealingAura(this.army, deltaTime);
        
        // Crear trail de partículas para el jugador
        if (this.player.vx !== 0 || this.player.vy !== 0) {
            this.particleSystem.createTrail(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                '#bd00ff'
            );
        }
    }
    
    /**
     * Convierte un enemigo derrotado en aliado fantasmagórico
     * @param {Enemy} enemy - Enemigo a convertir
     */
    convertEnemyToAlly(enemy) {
        const ally = new ArmyUnit(enemy.x, enemy.y, enemy, this.particleSystem, this.army);
        ally.setOwner(this.player);
        this.army.push(ally);
        
        // Efecto visual de conversión
        this.particleSystem.createGhostConversion(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2
        );
        
        // Actualizar capacidad de ejército
        this.player.updateArmyCapacity();
        
        // Emitir evento
        this.eventBus.emit(GameEvents.ARMY_UNIT_ADDED, {
            ally,
            armySize: this.army.length
        });
        
        console.log(`👻 Aliado invocado (${this.army.length}/${this.player.armyCapacity})`);
    }

    render() {
        // Limpiar canvas
        this.renderer.clear();
        
        // Renderizar grid de fondo
        this.renderer.showGrid = this.showDebug;
        this.renderer.renderGrid();
        
        // Renderizar partículas de fondo
        this.particleSystem.render(this.ctx);
        
        // Renderizar entidades en orden (fondo a frente)
        const renderOrder = ['projectiles', 'enemyProjectiles', 'army', 'enemies'];
        this.entityManager.renderAll(this.ctx, renderOrder, this.gameTime);
        

        
        this.player.render(this.ctx, this.gameTime);
        
        // Aplicar efectos de shader
        this.shaderEffects.applyVignette(this.ctx, this.width, this.height);
        
        // Renderizar UI (stats, nivel, ejército)
        this.uiManager.render(this.ctx, {
            player: this.player,
            armyCount: this.army.length
        });
        
        // Debug
        if (this.showDebug) {
            this.renderer.renderDebug({
                fps: this.fps,
                enemyCount: this.enemies.length,
                projectileCount: this.projectiles.length,
                enemyProjectileCount: this.enemyProjectiles.length,
                armyCount: this.army.length,
                particleCount: this.particleSystem.getCount()
            });
        }
    }
    
    /**
     * Configura listeners de mouse
     */
    setupMouseListeners() {
        // Guardar referencias para poder removerlos después
        this.mouseMoveListener = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            
            // Solo procesar hover si hay cartas visibles
            if (this.uiManager.showCardSelection) {
                this.uiManager.handleCardHover(this.mouseX, this.mouseY);
            }
        };
        
        this.mouseClickListener = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Manejar clic en cartas
            this.handleCardClick(clickX, clickY);
        };
        
        this.canvas.addEventListener('mousemove', this.mouseMoveListener);
        this.canvas.addEventListener('click', this.mouseClickListener);
    }
    
    /**
     * Pausa el juego y muestra selector de cartas
     */
    pauseForCards(level) {
        this.paused = true;
        
        // Generar 3 cartas aleatorias
        const cards = this.cardSystem.generateCards(3, level);
        this.uiManager.showCards(cards);
        
        console.log('🎴 Selector de cartas activado');
    }
    
    /**
     * Maneja clic en el selector de cartas
     */
    handleCardClick(x, y) {
        if (!this.paused) return;
        
        const selectedCard = this.uiManager.handleCardClick(x, y);
        
        if (selectedCard) {
            console.log(`✅ Carta seleccionada: ${selectedCard.name}`);
            
            // Aplicar efecto de la carta
            this.cardSystem.applyCard(selectedCard, this.player);
            
            // Efecto visual
            this.particleSystem.createExplosion(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                { count: 25, color: '#bd00ff', speed: 140, size: 5 }
            );
            
            // Cerrar selector y reanudar
            this.uiManager.hideCards();
            this.paused = false;
        } else {
            // Click fuera de cartas - permitir cerrar presionando ESC o cualquier click fuera
            console.log('⚠️ Click fuera de cartas - presiona dentro de una carta para seleccionarla');
        }
    }
    
    /**
     * Limpia event listeners al destruir el juego
     */
    destroy() {
        this.stop();
        
        // Remover listeners de mouse
        const oldMouseMove = this.mouseMoveListener;
        const oldMouseClick = this.mouseClickListener;
        
        if (oldMouseMove) {
            this.canvas.removeEventListener('mousemove', oldMouseMove);
        }
        if (oldMouseClick) {
            this.canvas.removeEventListener('click', oldMouseClick);
        }
        
        // Limpiar EventBus y InputManager
        if (this.eventBus) {
            this.eventBus.clear();
        }
        if (this.inputManager) {
            this.inputManager.destroy();
        }
        
        console.log('🧹 Game destruido y listeners limpiados');
    }
}
