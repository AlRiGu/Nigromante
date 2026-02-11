/**
 * Clase base para todas las entidades del juego
 * Proporciona propiedades y métodos comunes
 */
export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.active = true;
    }

    update(deltaTime) {
        // Override en clases hijas
    }

    render(ctx) {
        // Override en clases hijas
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    collidesWith(other) {
        if (!other || !other.getBounds) {
            return false;
        }
        
        const a = this.getBounds();
        const b = other.getBounds();
        
        return !(a.right < b.left || 
                 a.left > b.right || 
                 a.bottom < b.top || 
                 a.top > b.bottom);
    }

    /**
     * Confina la entidad dentro de los límites del mapa
     * FASE 1: Blindaje anti-huida para enemigos
     * @param {number} mapWidth - Ancho del mapa
     * @param {number} mapHeight - Alto del mapa
     */
    constrainToBounds(mapWidth, mapHeight) {
        const margin = 5; // Pequeño margen para evitar glitches visuales
        
        if (this.x < margin) {
            this.x = margin;
            this.vx = Math.max(0, this.vx); // Solo permitir movimiento hacia afuera
        }
        
        if (this.x + this.width > mapWidth - margin) {
            this.x = mapWidth - this.width - margin;
            this.vx = Math.min(0, this.vx); // Solo permitir movimiento hacia afuera
        }
        
        if (this.y < margin) {
            this.y = margin;
            this.vy = Math.max(0, this.vy);
        }
        
        if (this.y + this.height > mapHeight - margin) {
            this.y = mapHeight - this.height - margin;
            this.vy = Math.min(0, this.vy);
        }
    }
}
