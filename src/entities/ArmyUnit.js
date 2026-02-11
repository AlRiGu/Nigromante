import { Entity } from './Entity.js';
import { SpriteRenderer } from '../graphics/SpriteRenderer.js';

/**
 * ArmyUnit - Unidad del ejército del nigromante
 * Versión fantasmagórica del enemigo original con comportamiento de legión
 */
export class ArmyUnit extends Entity {
    constructor(x, y, sourceEnemy, particleSystem = null, armyArray = null) {
        super(x, y, sourceEnemy.width, sourceEnemy.height);
        
        // Copiar stats del enemigo original (reducidos)
        this.originalType = sourceEnemy.type;
        this.damage = Math.floor(sourceEnemy.damage * 0.7); // 70% del daño original
        this.speed = sourceEnemy.speed;
        this.health = sourceEnemy.maxHealth;
        this.maxHealth = sourceEnemy.maxHealth;
        
        // IA
        this.owner = null; // El jugador
        this.target = null; // Enemigo a atacar
        this.followDistance = 80; // Distancia a mantener del dueño
        this.detectionRange = 400;
        this.attackRange = 32;
        this.attackCooldown = 1.2;
        this.timeSinceLastAttack = 0;
        
        // Estado
        this.mode = 'follow'; // 'follow' o 'attack'
        
        // Visual fantasmagórico
        this.baseColor = sourceEnemy.color;
        this.ghostOpacity = 0.6;
        this.flickerSpeed = 3; // Hz
        this.flickerPhase = Math.random() * Math.PI * 2;
        this.hue = 0;
        
        // Cache para performance de sprites
        this._spriteCache = {};
        
        // === NUEVAS PROPIEDADES PARA COMPORTAMIENTO MEJORADO ===
        
        // Sistema de partículas para rastro de ectoplasma
        this.particleSystem = particleSystem;
        this.particleTimer = 0;
        this.particleInterval = 0.05; // Segundos entre partículas
        
        // Separación (anticlumping)
        this.armyArray = armyArray; // Referencia al array de aliados
        this.separationRadius = 40; // Radio de separación
        this.separationForce = 80; // Fuerza de repulsión
        
        // Seguimiento con retraso individual (efecto serpiente/nube)
        this.targetX = x;
        this.targetY = y;
        this.followDelay = 0.1 + Math.random() * 0.15; // Delay individual aleatorio (0.1-0.25s)
        this.smoothing = 0.08; // Factor de suavizado (menor = más lento)
        
        // Cache para reducir GC pressure
        this._separationCache = { x: 0, y: 0 };
    }

    /**
     * Establece el dueño (jugador)
     * @param {Player} owner - El jugador
     */
    setOwner(owner) {
        this.owner = owner;
    }

    /**
     * Actualiza la unidad
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        this.timeSinceLastAttack += deltaTime;
        this.hue += deltaTime * 50;
        if (this.hue > 360) this.hue = 0;
        
        // Actualizar timer de partículas
        this.particleTimer += deltaTime;
        
        if (this.owner) {
            // Si tiene un target enemigo, atacarlo
            if (this.target && this.target.active) {
                this.mode = 'attack';
                this.attackTarget(deltaTime);
            } else {
                // Si no, seguir al dueño con separación
                this.mode = 'follow';
                this.target = null;
                this.followOwnerWithSeparation(deltaTime);
            }
            
            // Generar rastro de partículas ectoplasma al moverse
            this.spawnEctoplasmTrail();
        }
    }

    /**
     * Sigue al dueño con separación (anticlumping) y retraso individual
     * @param {number} deltaTime - Delta time
     */
    followOwnerWithSeparation(deltaTime) {
        const ownerCenterX = this.owner.x + this.owner.width / 2;
        const ownerCenterY = this.owner.y + this.owner.height / 2;
        
        // Actualizar posición objetivo con retraso (efecto serpiente/nube)
        const targetDiffX = ownerCenterX - this.targetX;
        const targetDiffY = ownerCenterY - this.targetY;
        this.targetX += targetDiffX * this.smoothing;
        this.targetY += targetDiffY * this.smoothing;
        
        const myCenterX = this.x + this.width / 2;
        const myCenterY = this.y + this.height / 2;
        
        const dx = this.targetX - myCenterX;
        const dy = this.targetY - myCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calcular fuerza de separación de otros aliados
        const separation = this.calculateSeparation();
        
        // Solo moverse si está lejos del dueño
        if (distance > this.followDistance) {
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            // Combinar dirección de seguimiento + separación
            this.vx = dirX * this.speed + separation.x;
            this.vy = dirY * this.speed + separation.y;
            
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        } else {
            // Aplicar solo separación si está cerca del owner
            this.vx = separation.x;
            this.vy = separation.y;
            
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        }
    }
    
    /**
     * Calcula la fuerza de separación de otros aliados (anticlumping)
     * @returns {{x: number, y: number}} Vector de separación (cached, no allocate)
     */
    calculateSeparation() {
        // Resetear cache
        this._separationCache.x = 0;
        this._separationCache.y = 0;
        
        if (!this.armyArray || this.armyArray.length <= 1) {
            return this._separationCache;
        }
        
        let separationX = 0;
        let separationY = 0;
        let neighborCount = 0;
        
        const myCenterX = this.x + this.width / 2;
        const myCenterY = this.y + this.height / 2;
        
        // Buscar aliados cercanos y calcular repulsión
        for (const ally of this.armyArray) {
            if (ally === this || !ally.active) continue;
            
            const allyCenterX = ally.x + ally.width / 2;
            const allyCenterY = ally.y + ally.height / 2;
            
            const dx = myCenterX - allyCenterX;
            const dy = myCenterY - allyCenterY;
            const distanceSq = dx * dx + dy * dy;
            const separationRadiusSq = this.separationRadius * this.separationRadius;
            
            // Si está dentro del radio de separación, aplicar repulsión
            if (distanceSq > 0 && distanceSq < separationRadiusSq) {
                const distance = Math.sqrt(distanceSq);
                // Fuerza inversamente proporcional a la distancia
                const force = this.separationForce * (1 - distance / this.separationRadius);
                
                separationX += (dx / distance) * force;
                separationY += (dy / distance) * force;
                neighborCount++;
            }
        }
        
        // Promediar si hay múltiples vecinos
        if (neighborCount > 0) {
            separationX /= neighborCount;
            separationY /= neighborCount;
        }
        
        this._separationCache.x = separationX;
        this._separationCache.y = separationY;
        return this._separationCache;
    }
    
    /**
     * Genera rastro de partículas de ectoplasma al moverse
     */
    spawnEctoplasmTrail() {
        // Validación robusta con optional chaining
        if (!this.particleSystem?.createTrail) return;
        
        // Solo generar partículas si se está moviendo
        const isMoving = Math.abs(this.vx) > 10 || Math.abs(this.vy) > 10;
        if (!isMoving) return;
        
        // Generar partículas a intervalos regulares
        if (this.particleTimer >= this.particleInterval) {
            this.particleTimer = 0;
            
            // Crear partícula de ectoplasma en la posición actual
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            
            // Pequeña dispersión aleatoria
            const offsetX = (Math.random() - 0.5) * this.width;
            const offsetY = (Math.random() - 0.5) * this.height;
            
            // FIX: createTrail acepta (x, y, color) no un objeto config
            this.particleSystem.createTrail(
                centerX + offsetX,
                centerY + offsetY,
                '#00ffff'  // Cian espectral
            );
        }
    }

    /**
     * Ataca al target
     * @param {number} deltaTime - Delta time
     */
    attackTarget(deltaTime) {
        // Validación defensiva del target
        if (!this.target || !this.target.active) {
            this.target = null;
            this.vx = 0;
            this.vy = 0;
            return;
        }
        
        const targetCenterX = this.target.x + this.target.width / 2;
        const targetCenterY = this.target.y + this.target.height / 2;
        const myCenterX = this.x + this.width / 2;
        const myCenterY = this.y + this.height / 2;
        
        const dx = targetCenterX - myCenterX;
        const dy = targetCenterY - myCenterY;
        const distanceSq = dx * dx + dy * dy; // Distancia al cuadrado
        const attackRangeSq = this.attackRange * this.attackRange;
        
        // Acercarse si está fuera del rango de ataque
        if (distanceSq > attackRangeSq) {
            const distance = Math.sqrt(distanceSq); // Solo cuando sea necesario
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            this.vx = dirX * this.speed;
            this.vy = dirY * this.speed;
            
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        } else {
            this.vx = 0;
            this.vy = 0;
            
            // Atacar si está en cooldown
            if (this.timeSinceLastAttack >= this.attackCooldown) {
                const died = this.target.takeDamage(this.damage);
                this.timeSinceLastAttack = 0;
                
                if (died) {
                    this.target = null;
                }
            }
        }
    }

    /**
     * Busca el enemigo más cercano
     * @param {Array} enemies - Array de enemigos
     */
    findNearestEnemy(enemies) {
        let nearest = null;
        let minDistance = Infinity;
        
        const myCenterX = this.x + this.width / 2;
        const myCenterY = this.y + this.height / 2;
        
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;
            
            const dx = enemyCenterX - myCenterX;
            const dy = enemyCenterY - myCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance && distance < this.detectionRange) {
                minDistance = distance;
                nearest = enemy;
            }
        }
        
        this.target = nearest;
    }

    /**
     * FASE B: Método de curação para aliados
     * @param {number} amount - Cantidad de vida a curar
     */
    heal(amount) {
        if (!this.active) return;
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    /**
     * Reduce la vida de la unidad y la marca como inactiva si la vida llega a 0.
     * @param {number} amount - La cantidad de daño a recibir.
     * @returns {boolean} - true si murió
     */
    takeDamage(amount) {
        if (!this.active) return false;

        this.health -= amount;
        
        if (this.health <= 0) {
            this.health = 0;
            this.die(); // Muerte espectral
            return true;
        }
        
        return false;
    }
    
    /**
     * Muerte espectral del aliado
     * Desaparece con efecto de partículas azules/cian
     */
    die() {
        this.active = false;
        
        // Efecto de partículas de muerte espectral
        if (this.particleSystem) {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            
            // Partículas azules/cian dispersándose
            this.particleSystem.createExplosion(
                centerX,
                centerY,
                {
                    count: 20,
                    color: '#00ffff', // Cian espectral
                    speed: 100,
                    size: 3
                }
            );
            
            // Partículas adicionales en espiral
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const offsetX = Math.cos(angle) * 15;
                const offsetY = Math.sin(angle) * 15;
                
                this.particleSystem.createTrail(
                    centerX + offsetX,
                    centerY + offsetY,
                    '#0099ff' // Azul
                );
            }
        }
    }
    
    /**
     * Renderiza la unidad fantasmagórica
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} gameTime - Tiempo de juego para animaciones
     */
    render(ctx, gameTime = null) {
        // DEBUG: Verificar que render se llama
        console.log(`👻 ArmyUnit.render() llamado en (${Math.round(this.x)}, ${Math.round(this.y)}), active=${this.active}`);
        
        // Usar el sprite del Orco en modo fantasma con persistencia visual del tipo original
        const time = gameTime !== null ? gameTime : (performance.now() / 1000);
        SpriteRenderer.renderOrc(
            ctx, 
            this.x, 
            this.y, 
            this.width, 
            this.height, 
            time, 
            true, // isGhost = true
            this._spriteCache,
            this.originalType // Mantener tipo original (warrior, tank, shaman, assassin)
        );
        
        // Barra de vida sutil
        this.renderHealthBar(ctx);
    }
    
    /**
     * Renderiza barra de vida sutil para el aliado
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderHealthBar(ctx) {
        // Solo mostrar si está dañado
        if (this.health >= this.maxHealth) return;
        
        const barWidth = this.width;
        const barHeight = 2; // Más delgada que la de enemigos
        const barX = this.x;
        const barY = this.y - 6;
        
        // Fondo oscuro transparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Vida actual (color cian/azul espectral)
        const healthPercent = this.maxHealth > 0 ? this.health / this.maxHealth : 0;
        
        // Gradiente de color según vida restante
        let healthColor;
        if (healthPercent > 0.6) {
            healthColor = '#00ffff'; // Cian completo
        } else if (healthPercent > 0.3) {
            healthColor = '#0099ff'; // Azul
        } else {
            healthColor = '#6600ff'; // Púrpura (crítico)
        }
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Brillo sutil
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * healthPercent})`;
        ctx.fillRect(barX, barY, barWidth * healthPercent * 0.5, barHeight * 0.5);
    }
}

