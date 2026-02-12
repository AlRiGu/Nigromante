import { Entity } from './Entity.js';

/**
 * Proyectil - Ataque del nigromante
 */
export class Projectile extends Entity {
    constructor(x, y, vx, vy, damage, owner = 'player') {
        super(x, y, 8, 8);
        
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.owner = owner; // 'player', 'enemy' o 'ally'
        this.speed = 400; // pixels por segundo
        this.lifetime = 3; // segundos
        this.age = 0;

        // Visual: soporte explícito para proyectiles aliados
        if (owner === 'player') {
            this.color = '#bd00ff';
            this.glowColor = '#8b00ff';
        } else if (owner === 'enemy') {
            this.color = '#ff0000';
            this.glowColor = '#ff6600';
        } else if (owner === 'ally') {
            // Aliados usan tonos cian/teal espectrales
            this.color = '#00ffff';
            this.glowColor = '#00ffcc';
        } else {
            this.color = '#ffffff';
            this.glowColor = '#ffffff';
        }

        this.fromAlly = (owner === 'ally');
        this.trailPositions = [];
        this.maxTrailLength = 6;
    }

    update(deltaTime) {
        // Actualizar posición
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Actualizar edad
        this.age += deltaTime;
        
        // Guardar posición para el trail
        this.trailPositions.push({ x: this.x, y: this.y });
        if (this.trailPositions.length > this.maxTrailLength) {
            this.trailPositions.shift();
        }
        
        // Desactivar si excede el tiempo de vida
        if (this.age >= this.lifetime) {
            this.active = false;
        }
    }

    render(ctx) {
        // Renderizar trail
        for (let i = 0; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const alpha = (i + 1) / this.trailPositions.length * 0.5;
            const hexAlpha = Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = this.glowColor + hexAlpha;
            const size = this.width * ((i + 1) / this.trailPositions.length);
            ctx.fillRect(
                pos.x - size / 2 + this.width / 2,
                pos.y - size / 2 + this.height / 2,
                size,
                size
            );
        }
        // Aura del proyectil (pulsante si es aliado)
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const baseRadius = this.width * 2;
        const pulse = this.fromAlly ? 1 + Math.sin(this.age * 12) * 0.15 : 1;

        const gradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            baseRadius * pulse
        );
        gradient.addColorStop(0, this.glowColor + 'AA');
        gradient.addColorStop(1, 'transparent');

        // Si es aliado, usar blending para un glow más intenso
        const prevComposite = ctx.globalCompositeOperation;
        if (this.fromAlly) ctx.globalCompositeOperation = 'lighter';

        ctx.fillStyle = gradient;
        ctx.fillRect(
            this.x - this.width,
            this.y - this.height,
            this.width * 3,
            this.height * 3
        );

        if (this.fromAlly) ctx.globalCompositeOperation = prevComposite;
        
        // Núcleo del proyectil
        if (this.fromAlly) {
            // Núcleo con ligero gradiente central para aliados
            const coreGrad = ctx.createRadialGradient(
                centerX,
                centerY,
                0,
                centerX,
                centerY,
                this.width
            );
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.2, this.color);
            coreGrad.addColorStop(1, this.color + '00');
            ctx.fillStyle = coreGrad;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    /**
     * Verifica si el proyectil está fuera de los bounds
     * @param {Bounds} bounds - Sistema de límites
     * @returns {boolean}
     */
    isOutOfBounds(bounds) {
        return bounds.isOutOfBounds(this);
    }
}
