import { Projectile } from '../entities/Projectile.js';

/**
 * AttackController - Manejo de ataques del jugador
 */
export class AttackController {
    constructor(player, projectiles, eventBus) {
        this.player = player;
        this.projectiles = projectiles;
        this.eventBus = eventBus;
        
        this.attackCooldown = 0.3; // segundos entre disparos
        this.timeSinceLastAttack = this.attackCooldown; // Puede disparar inmediatamente
        this.autoAim = true;
    }

    /**
     * Actualiza el controlador de ataque
     * @param {number} deltaTime - Delta time
     * @param {boolean} attackPressed - Si el botón de ataque está presionado
     * @param {Array} enemies - Array de enemigos para auto-aim
     */
    update(deltaTime, attackPressed, enemies = []) {
        this.timeSinceLastAttack += deltaTime;
        
        if (attackPressed && this.timeSinceLastAttack >= this.attackCooldown) {
            this.attack(enemies);
            this.timeSinceLastAttack = 0;
        }
    }

    /**
     * Ejecuta un ataque
     * @param {Array} enemies - Array de enemigos para auto-aim
     */
    attack(enemies) {
        let targetX, targetY;
        
        if (this.autoAim && enemies.length > 0) {
            // Auto-aim al enemigo más cercano
            const nearest = this.findNearestEnemy(enemies);
            if (nearest) {
                targetX = nearest.x + nearest.width / 2;
                targetY = nearest.y + nearest.height / 2;
            }
        }
        
        // Si no hay auto-aim o no hay enemigos, disparar hacia la derecha
        if (targetX === undefined) {
            targetX = this.player.x + 100;
            targetY = this.player.y;
        }
        
        // Calcular dirección
        const dx = targetX - (this.player.x + this.player.width / 2);
        const dy = targetY - (this.player.y + this.player.height / 2);
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        
        if (magnitude > 0) {
            const dirX = dx / magnitude;
            const dirY = dy / magnitude;
            
            const projectileSpeed = 400;
            const projectile = new Projectile(
                this.player.x + this.player.width / 2 - 4,
                this.player.y + this.player.height / 2 - 4,
                dirX * projectileSpeed,
                dirY * projectileSpeed,
                this.player.damage,
                'player'
            );
            
            this.projectiles.push(projectile);
            
            // Emitir evento
            if (this.eventBus) {
                this.eventBus.emit('player_attack', {
                    projectile,
                    player: this.player
                });
            }
        }
    }

    /**
     * Encuentra el enemigo más cercano
     * @param {Array} enemies - Array de enemigos
     * @returns {Entity|null}
     */
    findNearestEnemy(enemies) {
        let nearest = null;
        let minDistanceSq = Infinity; // Usar distancia al cuadrado
        
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        
        for (const enemy of enemies) {
            if (!enemy.active) continue; // Validar enemigos activos
            
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;
            
            const dx = enemyCenterX - playerCenterX;
            const dy = enemyCenterY - playerCenterY;
            const distanceSq = dx * dx + dy * dy; // Sin Math.sqrt
            
            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                nearest = enemy;
            }
        }
        
        return nearest;
    }
}
