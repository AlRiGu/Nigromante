/**
 * CollisionSystem - Sistema de detección y resolución de colisiones
 */
export class CollisionSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }

    /**
     * Verifica colisiones entre proyectiles y enemigos
     * @param {Array} projectiles - Array de proyectiles
     * @param {Array} enemies - Array de enemigos
     * @returns {Array} - Array de colisiones { projectile, enemy }
     */
    checkProjectileEnemyCollisions(projectiles, enemies) {
        const collisions = [];
        
        for (const projectile of projectiles) {
            if (!projectile.active || projectile.owner !== 'player') continue;
            
            for (const enemy of enemies) {
                if (!enemy.active) continue;
                
                if (projectile.collidesWith(enemy)) {
                    collisions.push({ projectile, enemy });
                }
            }
        }
        
        return collisions;
    }

    /**
     * Verifica colisiones entre enemigos y el jugador
     * @param {Array} enemies - Array de enemigos
     * @param {Player} player - El jugador
     * @returns {Array} - Array de enemigos que colisionan
     */
    checkEnemyPlayerCollisions(enemies, player) {
        const collisions = [];
        
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            
            if (enemy.collidesWith(player)) {
                collisions.push(enemy);
            }
        }
        
        return collisions;
    }

    /**
     * Resuelve colisiones entre proyectiles y enemigos
     * @param {Array} projectiles - Array de proyectiles
     * @param {Array} enemies - Array de enemigos
     * @returns {Array} - Array de enemigos derrotados
     */
    resolveProjectileEnemyCollisions(projectiles, enemies) {
        const collisions = this.checkProjectileEnemyCollisions(projectiles, enemies);
        const defeatedEnemies = [];
        
        for (const { projectile, enemy } of collisions) {
            // Validar que ambos sigan activos (evita colisiones dobles)
            if (!projectile.active || !enemy.active) continue;
            
            // Desactivar proyectil
            projectile.active = false;
            
            // Aplicar daño al enemigo
            const died = enemy.takeDamage(projectile.damage);
            
            if (died) {
                defeatedEnemies.push(enemy);
                
                // Emitir evento
                if (this.eventBus) {
                    this.eventBus.emit('enemy_defeated', {
                        enemy,
                        experience: enemy.experienceReward
                    });
                }
            }
            
            // Emitir evento de hit
            if (this.eventBus) {
                this.eventBus.emit('projectile_hit', {
                    projectile,
                    target: enemy,
                    damage: projectile.damage
                });
            }
        }
        
        return defeatedEnemies;
    }

    /**
     * Resuelve colisiones entre proyectiles aliados y enemigos
     * @param {Array} allyProjectiles - Array de proyectiles aliados
     * @param {Array} enemies - Array de enemigos
     */
    resolveAllyProjectileEnemyCollisions(allyProjectiles, enemies) {
        if (!Array.isArray(allyProjectiles) || !Array.isArray(enemies)) return [];

        for (const projectile of allyProjectiles) {
            if (!projectile.active || !projectile.fromAlly) continue;

            for (const enemy of enemies) {
                if (!enemy.active) continue;

                // Usar bounding-box collidesWith si está disponible
                if (typeof projectile.collidesWith === 'function') {
                    if (!projectile.collidesWith(enemy)) continue;
                } else {
                    // Fallback: comprobar bounds manualmente
                    const a = { left: projectile.x, right: projectile.x + (projectile.width || 0), top: projectile.y, bottom: projectile.y + (projectile.height || 0) };
                    const b = enemy.getBounds ? enemy.getBounds() : { left: enemy.x, right: enemy.x + enemy.width, top: enemy.y, bottom: enemy.y + enemy.height };
                    if (a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom) continue;
                }

                // Aplicar daño y desactivar proyectil
                projectile.active = false;
                const died = enemy.takeDamage(projectile.damage);

                if (died) {
                    if (this.eventBus) {
                        this.eventBus.emit('enemy_defeated', { enemy, experience: enemy.experienceReward });
                    }
                }

                if (this.eventBus) {
                    this.eventBus.emit('projectile_hit', { projectile, target: enemy, damage: projectile.damage });
                }

                // Proyectil impactó, pasar al siguiente proyectil
                break;
            }
        }
    }

    /**
     * Resuelve colisiones entre enemigos y el jugador
     * @param {Array} enemies - Array de enemigos
     * @param {Player} player - El jugador
     * @param {number} deltaTime - Delta time
     */
    resolveEnemyPlayerCollisions(enemies, player, deltaTime) {
        const collisions = this.checkEnemyPlayerCollisions(enemies, player);
        
        for (const enemy of collisions) {
            // Verificar si el enemigo puede atacar
            if (enemy.attack()) {
                player.takeDamage(enemy.damage);
                
                // Emitir evento
                if (this.eventBus) {
                    this.eventBus.emit('player_damaged', {
                        enemy,
                        damage: enemy.damage,
                        playerHealth: player.health
                    });
                }
                
                // Verificar si el jugador murió
                if (!player.active) {
                    if (this.eventBus) {
                        this.eventBus.emit('game_over', {
                            player,
                            reason: 'defeated'
                        });
                    }
                }
            }
        }
    }
    
    /**
     * Resuelve colisiones entre enemigos y aliados (FASE 8)
     * Los enemigos pueden atacar a los aliados fantasma
     * @param {Array} enemies - Array de enemigos
     * @param {Array} allies - Array de aliados
     * @param {number} deltaTime - Delta time
     */
    resolveEnemyAllyCollisions(enemies, allies, deltaTime) {
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            
            for (const ally of allies) {
                if (!ally.active) continue;
                
                // Verificar colisión
                if (enemy.collidesWith(ally)) {
                    // Verificar si el enemigo puede atacar
                    if (enemy.attack()) {
                        const died = ally.takeDamage(enemy.damage);
                        
                        // Emitir evento
                        if (this.eventBus) {
                            this.eventBus.emit('ally_damaged', {
                                enemy,
                                ally,
                                damage: enemy.damage,
                                died
                            });
                        }
                        
                        // Si el aliado murió, el enemigo buscará nuevo target
                        if (died && enemy.target === ally) {
                            enemy.target = null;
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Resuelve colisiones de proyectiles enemigos con jugador y aliados
     * IMPORTANTE: Los proyectiles enemigos NO deben dañar a otros enemigos
     * @param {Array} enemyProjectiles - Array de proyectiles enemigos
     * @param {Player} player - El jugador
     * @param {Array} allies - Array de aliados
     */
    resolveEnemyProjectileCollisions(enemyProjectiles, player, allies) {
        for (const projectile of enemyProjectiles) {
            if (!projectile.active || !projectile.fromEnemy) continue;
            
            // Verificar colisión con el jugador
            if (player.active && this.checkCircleRectCollision(
                projectile.x, projectile.y, projectile.width / 2,
                player.x, player.y, player.width, player.height
            )) {
                projectile.active = false;
                player.takeDamage(projectile.damage);
                
                // Emitir evento
                if (this.eventBus) {
                    this.eventBus.emit('player_damaged', {
                        damage: projectile.damage,
                        playerHealth: player.health,
                        source: 'shaman_projectile'
                    });
                }
                
                // Verificar si el jugador murió
                if (!player.active && this.eventBus) {
                    this.eventBus.emit('game_over', {
                        player,
                        reason: 'defeated_by_projectile'
                    });
                }
                
                continue; // Proyectil ya impactó, pasar al siguiente
            }
            
            // Verificar colisión con aliados (FASE 8)
            for (const ally of allies) {
                if (!ally.active) continue;
                
                if (this.checkCircleRectCollision(
                    projectile.x, projectile.y, projectile.width / 2,
                    ally.x, ally.y, ally.width, ally.height
                )) {
                    projectile.active = false;
                    
                    // FASE 8: Los aliados reciben daño
                    const died = ally.takeDamage(projectile.damage);
                    
                    if (this.eventBus) {
                        this.eventBus.emit('ally_hit', {
                            ally,
                            damage: projectile.damage,
                            died,
                            source: 'shaman_projectile'
                        });
                    }
                    
                    break; // Proyectil ya impactó, pasar al siguiente
                }
            }
        }
    }
    
    /**
     * Verifica colisión entre un círculo y un rectángulo
     * @param {number} cx - Centro X del círculo
     * @param {number} cy - Centro Y del círculo
     * @param {number} radius - Radio del círculo
     * @param {number} rx - X del rectángulo
     * @param {number} ry - Y del rectángulo
     * @param {number} rw - Ancho del rectángulo
     * @param {number} rh - Alto del rectángulo
     * @returns {boolean}
     */
    checkCircleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
        // Encontrar el punto más cercano del rectángulo al círculo
        const closestX = Math.max(rx, Math.min(cx, rx + rw));
        const closestY = Math.max(ry, Math.min(cy, ry + rh));
        
        // Calcular distancia del círculo a este punto
        const distanceX = cx - closestX;
        const distanceY = cy - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        
        return distanceSquared < (radius * radius);
    }
}
