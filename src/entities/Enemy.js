import { Entity } from './Entity.js';
import { SpriteRenderer } from '../graphics/SpriteRenderer.js';

/**
 * Enemy - Enemigo básico que persigue al jugador
 * Tipos disponibles: warrior, tank, shaman, assassin
 */
export class Enemy extends Entity {
    constructor(x, y, type = 'warrior') {
        // Obtener tamaño base según el tipo ANTES de llamar a super
        const sizeMultiplier = Enemy.getSizeMultiplier(type);
        const baseSize = 28;
        const actualSize = baseSize * sizeMultiplier;
        
        super(x, y, actualSize, actualSize);
        
        this.type = type;
        
        // Atributos según el tipo
        this.stats = this.getStatsForType(type);
        this.health = this.stats.health;
        this.maxHealth = this.stats.health;
        this.damage = this.stats.damage;
        this.speed = this.stats.speed;
        this.experienceReward = this.stats.experience;
        
        // IA
        this.target = null;
        this.detectionRange = 500;
        this.attackRange = this.stats.attackRange || 32;
        this.attackCooldown = this.stats.attackCooldown || 1.0;
        this.timeSinceLastAttack = 0;
        
        // Comportamiento especial del Chamán
        if (this.type === 'shaman') {
            this.minDistance = 150; // Mantener distancia del jugador
            this.projectileCooldown = 2.0; // Dispara cada 2 segundos
            this.timeSinceLastProjectile = this.projectileCooldown; // Disparar inmediatamente
            this.projectiles = []; // Array de proyectiles del chamán (se pasará desde Game)
        }
        
        // Visual
        this.color = this.stats.color;
        
        // Cache para performance de sprites
        this._spriteCache = {};
        this.hue = 0; // Para animación
    }
    
    /**
     * Obtiene el multiplicador de tamaño según el tipo
     * @param {string} type - Tipo de enemigo
     * @returns {number} - Multiplicador de tamaño
     */
    static getSizeMultiplier(type) {
        const multipliers = {
            warrior: 1.0,    // Tamaño estándar
            tank: 2.0,       // 2x más grande
            shaman: 0.9,     // Ligeramente más pequeño
            assassin: 0.8    // Más pequeño y ágil
        };
        return multipliers[type] || 1.0;
    }

    /**
     * Obtiene stats según el tipo de enemigo
     * @param {string} type - Tipo de enemigo
     * @returns {Object} - Stats del enemigo
     */
    getStatsForType(type) {
        const types = {
            // GUERRERO - El estándar (antes 'basic')
            warrior: {
                health: 30,
                damage: 5,
                speed: 80,
                experience: 10,
                color: '#4a7832', // Verde estándar
                attackRange: 32,
                attackCooldown: 1.0,
                description: 'Guerrero estándar'
            },
            // TANQUE - Grande, lento, resistente
            tank: {
                health: 90,        // 3x vida
                damage: 8,
                speed: 40,         // 0.5x velocidad
                experience: 30,
                color: '#2d4d1f', // Verde oscuro
                attackRange: 40,   // Mayor alcance por tamaño
                attackCooldown: 1.5,
                description: 'Tanque pesado'
            },
            // CHAMÁN - Ataque a distancia, mantiene alejado
            shaman: {
                health: 25,
                damage: 7,         // Daño de proyectiles
                speed: 60,
                experience: 25,
                color: '#6b4423', // Marrón (túnica)
                attackRange: 200,  // Rango de proyectiles
                attackCooldown: 2.0,
                projectileSpeed: 150,
                description: 'Chamán de proyectiles'
            },
            // ASESINO - Rápido, frágil, agresivo
            assassin: {
                health: 21,        // 0.7x vida
                damage: 6,
                speed: 120,        // 1.5x velocidad
                experience: 20,
                color: '#7a9b6c', // Verde pálido
                attackRange: 28,
                attackCooldown: 0.7, // Ataca más rápido
                description: 'Asesino veloz'
            }
        };
        
        return types[type] || types.warrior;
    }

    /**
     * Actualiza el enemigo
     * @param {number} deltaTime - Delta time
     * @param {number} mapWidth - Ancho del mapa (opcional, por defecto 1280)
     * @param {number} mapHeight - Alto del mapa (opcional, por defecto 720)
     */
    update(deltaTime, mapWidth = 1280, mapHeight = 720) {
        // Actualizar cooldown de ataque
        this.timeSinceLastAttack += deltaTime;
        
        // Actualizar cooldown de proyectiles (Chamán)
        if (this.type === 'shaman') {
            this.timeSinceLastProjectile += deltaTime;
        }
        
        // Actualizar animación
        this.hue += deltaTime * 100;
        if (this.hue > 360) this.hue = 0;
        
        // Si tiene un target, perseguirlo o mantener distancia (Chamán)
        if (this.target) {
            if (this.type === 'shaman') {
                this.keepDistance(deltaTime, mapWidth, mapHeight);
            } else {
                this.chaseTarget(deltaTime, mapWidth, mapHeight);
            }
        }
    }

    /**
     * Persigue al target
     * @param {number} deltaTime - Delta time
     * @param {number} mapWidth - Ancho del mapa (para constraining)
     * @param {number} mapHeight - Alto del mapa (para constraining)
     */
    chaseTarget(deltaTime, mapWidth = 1280, mapHeight = 720) {
        // FASE A: IA Anti-Bloqueo - Si el target murió, resetear para buscar nuevo objetivo
        if (!this.target || !this.target.active || this.target.health <= 0) {
            this.target = null;  // Resetear para que findClosestTarget asigne nuevo objetivo
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
        
        // Solo moverse si está fuera del rango de ataque
        if (distanceSq > attackRangeSq) {
            const distance = Math.sqrt(distanceSq); // Solo calcular cuando sea necesario
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            this.vx = dirX * this.speed;
            this.vy = dirY * this.speed;
            
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
        
        // FASE 1: Confinar dentro del mapa (prevenir huida)
        this.constrainToBounds(mapWidth, mapHeight);
    }

    /**
     * Establece el target a perseguir
     * @param {Entity} target - Entidad a perseguir
     */
    setTarget(target) {
        this.target = target;
    }
    
    /**
     * Busca y establece el objetivo más cercano (jugador o aliados)
     * FASE 8: AGRO - Los enemigos atacan al objetivo más cercano
     * @param {Player} player - El jugador
     * @param {Array} allies - Array de aliados
     */
    findClosestTarget(player, allies) {
        let closestTarget = null;
        let minDistanceSq = Infinity;
        
        const myCenterX = this.x + this.width / 2;
        const myCenterY = this.y + this.height / 2;
        
        // Considerar al jugador como objetivo potencial
        if (player && player.active) {
            const playerCenterX = player.x + player.width / 2;
            const playerCenterY = player.y + player.height / 2;
            const dx = playerCenterX - myCenterX;
            const dy = playerCenterY - myCenterY;
            const distanceSq = dx * dx + dy * dy;
            
            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                closestTarget = player;
            }
        }
        
        // Considerar aliados como objetivos potenciales
        if (allies && allies.length > 0) {
            for (const ally of allies) {
                if (!ally.active) continue;
                
                const allyCenterX = ally.x + ally.width / 2;
                const allyCenterY = ally.y + ally.height / 2;
                const dx = allyCenterX - myCenterX;
                const dy = allyCenterY - myCenterY;
                const distanceSq = dx * dx + dy * dy;
                
                if (distanceSq < minDistanceSq) {
                    minDistanceSq = distanceSq;
                    closestTarget = ally;
                }
            }
        }
        
        // Establecer el objetivo más cercano encontrado
        if (closestTarget) {
            this.setTarget(closestTarget);
        }
    }
    
    /**
     * Mantiene distancia del target (comportamiento del Chamán)
     * @param {number} deltaTime - Delta time
     * @param {number} mapWidth - Ancho del mapa (para constraining)
     * @param {number} mapHeight - Alto del mapa (para constraining)
     */
    keepDistance(deltaTime, mapWidth = 1280, mapHeight = 720) {
        // FASE A: IA Anti-Bloqueo - Si el target murió, resetear para buscar nuevo objetivo
        if (!this.target || !this.target.active || this.target.health <= 0) {
            this.target = null;  // Resetear para que findClosestTarget asigne nuevo objetivo
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
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si está demasiado cerca, alejarse
        if (distance < this.minDistance) {
            const dirX = -dx / distance; // Dirección opuesta
            const dirY = -dy / distance;
            
            this.vx = dirX * this.speed;
            this.vy = dirY * this.speed;
            
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        } 
        // Si está demasiado lejos, acercarse un poco
        else if (distance > this.attackRange) {
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            this.vx = dirX * this.speed * 0.5; // Moverse más lento al acercarse
            this.vy = dirY * this.speed * 0.5;
            
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        } 
        // Está en la distancia óptima, quedarse quieto
        else {
            this.vx = 0;
            this.vy = 0;
        }
        
        // FASE 1: Confinar dentro del mapa (prevenir huida)
        this.constrainToBounds(mapWidth, mapHeight);
    }
    
    /**
     * Dispara un proyectil hacia el target (Chamán)
     * @param {Array} projectilesArray - Array donde agregar el proyectil
     * @returns {boolean} - true si disparó
     */
    shootProjectile(projectilesArray) {
        if (this.type !== 'shaman') return false;
        // FASE A: Validar target válido (anti-bloqueo)
        if (!this.target || !this.target.active || this.target.health <= 0) {
            this.target = null;
            return false;
        }
        if (this.timeSinceLastProjectile < this.projectileCooldown) return false;
        
        this.timeSinceLastProjectile = 0;
        
        // Calcular dirección hacia el target
        const targetCenterX = this.target.x + this.target.width / 2;
        const targetCenterY = this.target.y + this.target.height / 2;
        const myCenterX = this.x + this.width / 2;
        const myCenterY = this.y + this.height / 2;
        
        const dx = targetCenterX - myCenterX;
        const dy = targetCenterY - myCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return false;
        
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Crear proyectil enemigo (lo importaremos después)
        const projectile = {
            x: myCenterX,
            y: myCenterY,
            width: 8,
            height: 8,
            vx: dirX * this.stats.projectileSpeed,
            vy: dirY * this.stats.projectileSpeed,
            damage: this.damage,
            active: true,
            fromEnemy: true, // Marca para identificar proyectiles enemigos
            owner: this,
            
            update(deltaTime) {
                this.x += this.vx * deltaTime;
                this.y += this.vy * deltaTime;
            },
            
            render(ctx) {
                // Proyectil rojo oscuro del chamán
                ctx.fillStyle = '#ff4444';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Glow
                ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
                ctx.fill();
            }
        };
        
        projectilesArray.push(projectile);
        return true;
    }

    /**
     * Recibe daño
     * @param {number} amount - Cantidad de daño
     * @returns {boolean} - true si murió
     */
    takeDamage(amount) {
        this.health -= amount;
        
        if (this.health <= 0) {
            this.health = 0;
            this.active = false;
            return true;
        }
        
        return false;
    }

    /**
     * Verifica si puede atacar
     * @returns {boolean}
     */
    canAttack() {
        if (!this.target) return false;
        
        const targetCenterX = this.target.x + this.target.width / 2;
        const targetCenterY = this.target.y + this.target.height / 2;
        const myCenterX = this.x + this.width / 2;
        const myCenterY = this.y + this.height / 2;
        
        const dx = targetCenterX - myCenterX;
        const dy = targetCenterY - myCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= this.attackRange && this.timeSinceLastAttack >= this.attackCooldown;
    }

    /**
     * Ejecuta un ataque
     */
    attack() {
        if (this.canAttack()) {
            this.timeSinceLastAttack = 0;
            return true;
        }
        return false;
    }

    /**
     * Renderiza el enemigo
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} gameTime - Tiempo de juego para animaciones
     */
    render(ctx, gameTime = null) {
        // Usar el sprite detallado del Orco con el tipo específico
        const time = gameTime !== null ? gameTime : (performance.now() / 1000);
        SpriteRenderer.renderOrc(
            ctx, 
            this.x, 
            this.y, 
            this.width, 
            this.height, 
            time, 
            false, // no es fantasma
            this._spriteCache,
            this.type // NUEVO: pasar el tipo para renderizado específico
        );
        
        // Barra de vida
        this.renderHealthBar(ctx);
    }

    /**
     * Renderiza la barra de vida
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 3;
        const barX = this.x;
        const barY = this.y - 8;
        
        // Fondo
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Vida actual
        const healthPercent = this.maxHealth > 0 ? this.health / this.maxHealth : 0;
        ctx.fillStyle = healthPercent > 0.5 ? '#ff0000' : '#ff6600';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
}
