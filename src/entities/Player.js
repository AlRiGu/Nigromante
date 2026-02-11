import { Entity } from './Entity.js';
import { SpriteRenderer } from '../graphics/SpriteRenderer.js';

/**
 * El Nigromante - Personaje controlable por el jugador
 */
export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 32, 32);
        
        // Atributos del jugador
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damage = 8;  // REBALANCEO: Reducido de 10
        this.baseArmyCapacity = 1; // REBALANCEO: Empezar con 1 solo aliado
        this.armyCapacity = this.baseArmyCapacity;
        this.maxArmy = this.armyCapacity;
        this.points = 0;
        this.level = 1;
        this.xp = 0;
        this.experience = 0;
        this.xpToNextLevel = 100;
        this.experienceToNextLevel = 100;
        
        // Sistema de desbloqueos
        this.hasHealingUnlocked = false;  // FASE B: Aura deshabilitada al inicio
        this.healingAuraBonus = 0;  // Bonificación adicional al rango del aura
        
        // Atributos para upgrades de cartas
        this.healthRegen = 0; // Regeneración de vida por segundo
        this.pointsMultiplier = 1.0; // Multiplicador de puntos
        this.attackSpeed = 0.6; // REBALANCEO: Cooldown aumentado de 0.5
        
        // Movimiento
        this.speed = 120;  // REBALANCEO: Reducido de 200
        this.inputX = 0;
        this.inputY = 0;
        
        // Visual
        this.color = '#8b00ff'; // Púrpura nigromante
        this.glowColor = '#bd00ff';
        
        // Cache para performance de sprites
        this._spriteCache = {};
        this._lastGradientX = -1;
        this._lastGradientY = -1;
        
        // EventBus (se inyectará desde Game)
        this.eventBus = null;
    }

    /**
     * Actualiza el límite de ejército según la fórmula
     * C_e = C_base + floor(puntos × 1.5)
     */
    updateArmyCapacity() {
        this.armyCapacity = this.baseArmyCapacity + Math.floor(this.points * 1.5);
        this.maxArmy = this.armyCapacity; // Actualizar alias
    }

    setInput(x, y) {
        this.inputX = x;
        this.inputY = y;
    }

    update(deltaTime) {
        // Regeneración de vida
        if (this.healthRegen > 0) {
            this.health = Math.min(this.maxHealth, this.health + this.healthRegen * deltaTime);
        }
        
        // FASE B: Aura de Sanación (radio escalado por vida propia + bonificaciones)
        this.healingAuraRadius = 80 + (this.maxHealth * 0.5) + (this.healingAuraBonus || 0); // Radio base + vida escalada + bonificación
        this.healingPower = 5 + (this.maxHealth * 0.1); // Curación/seg escalada
        
        // Normalizar el vector de movimiento
        const magnitude = Math.sqrt(this.inputX * this.inputX + this.inputY * this.inputY);
        
        if (magnitude > 0) {
            const normalizedX = this.inputX / magnitude;
            const normalizedY = this.inputY / magnitude;
            
            this.vx = normalizedX * this.speed;
            this.vy = normalizedY * this.speed;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
        
        // Actualizar posición
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }

    render(ctx, gameTime = null) {
        const time = gameTime !== null ? gameTime : (performance.now() / 1000);
        
        // FASE B: Renderizar aura de sanación ANTES del sprite
        this.renderHealingAura(ctx, time);
        
        // Usar el sprite detallado del Nigromante
        SpriteRenderer.renderNigromante(ctx, this.x, this.y, this.width, this.height, time, this._spriteCache);
        
        // Barra de vida
        this.renderHealthBar(ctx);
    }

    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x;
        const barY = this.y - 10;
        
        // Fondo
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Vida actual - prevenir división por cero
        const healthPercent = this.maxHealth > 0 ? this.health / this.maxHealth : 0;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffaa00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }    
    /**
     * FASE B: Renderiza el aura de sanación visual
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas 
     * @param {number} time - Tiempo de juego para animaciones
     */
    renderHealingAura(ctx, time) {
        if (!this.healingAuraRadius) return;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.save();
        
        // Efecto de pulso para el aura
        const pulseIntensity = 0.7 + Math.sin(time * 3) * 0.3; // Pulso entre 0.4 y 1.0
        const currentRadius = this.healingAuraRadius * pulseIntensity;
        
        // Gradiente radial para el aura (verde/púrpura)
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, currentRadius
        );
        gradient.addColorStop(0, 'rgba(138, 43, 226, 0.4)');
        gradient.addColorStop(0.7, 'rgba(75, 0, 130, 0.2)');
        gradient.addColorStop(1, 'rgba(75, 0, 130, 0.05)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Círculo exterior sutil
        ctx.strokeStyle = `rgba(138, 43, 226, ${0.3 * pulseIntensity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * FASE B: Aplica curación a aliados en el aura
     * @param {Array} allies - Array de aliados  
     * @param {number} deltaTime - Tiempo transcurrido
     */
    applyHealingAura(allies, deltaTime) {
        // Solo aplicar si está desbloqueada
        if (!this.hasHealingUnlocked) return;
        if (!this.healingAuraRadius || !this.healingPower) return;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const radiusSq = this.healingAuraRadius * this.healingAuraRadius;
        
        for (const ally of allies) {
            if (!ally.active || ally.health >= ally.maxHealth) continue;
            
            const allyCenterX = ally.x + ally.width / 2;
            const allyCenterY = ally.y + ally.height / 2;
            const distanceSq = (allyCenterX - centerX) ** 2 + (allyCenterY - centerY) ** 2;
            
            // Si está dentro del aura, curar
            if (distanceSq <= radiusSq) {
                const healAmount = this.healingPower * deltaTime;
                ally.heal(healAmount);
            }
        }
    }
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.active = false;
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    addExperience(amount) {
        // Aplicar multiplicador de puntos si existe
        const adjustedAmount = amount * (this.pointsMultiplier || 1.0);
        
        this.experience += adjustedAmount;
        this.xp = this.experience; // Sincronizar alias
        
        while (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.experience = Math.max(0, this.experience - this.experienceToNextLevel);
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
        
        // Sincronizar alias
        this.xp = this.experience;
        this.xpToNextLevel = this.experienceToNextLevel;
        
        // Prevenir división por cero
        if (this.experienceToNextLevel === 0) {
            this.experienceToNextLevel = 100;
            this.xpToNextLevel = 100;
        }
        
        // Emitir evento de level up
        if (this.eventBus) {
            this.eventBus.emit('player_level_up', {
                level: this.level,
                player: this
            });
        }
        
        console.log(`¡Nivel ${this.level} alcanzado!`);
    }
}
