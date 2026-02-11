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
}
