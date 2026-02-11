/**
 * Bounds - Sistema de límites y restricción espacial
 */
export class Bounds {
    constructor(width, height, padding = 0) {
        this.width = width;
        this.height = height;
        this.padding = padding;
    }

    /**
     * Restringe una entidad dentro de los límites
     * @param {Entity} entity - Entidad a limitar
     */
    clamp(entity) {
        const minX = this.padding;
        const minY = this.padding;
        const maxX = this.width - entity.width - this.padding;
        const maxY = this.height - entity.height - this.padding;
        
        entity.x = Math.max(minX, Math.min(maxX, entity.x));
        entity.y = Math.max(minY, Math.min(maxY, entity.y));
    }

    /**
     * Verifica si una entidad está dentro de los límites
     * @param {Entity} entity - Entidad a verificar
     * @returns {boolean}
     */
    contains(entity) {
        return entity.x >= this.padding &&
               entity.y >= this.padding &&
               entity.x + entity.width <= this.width - this.padding &&
               entity.y + entity.height <= this.height - this.padding;
    }

    /**
     * Verifica si una entidad está fuera de los límites
     * @param {Entity} entity - Entidad a verificar
     * @returns {boolean}
     */
    isOutOfBounds(entity) {
        return !this.contains(entity);
    }

    /**
     * Obtiene una posición aleatoria dentro de los límites
     * @param {number} entityWidth - Ancho de la entidad
     * @param {number} entityHeight - Alto de la entidad
     * @returns {{x: number, y: number}}
     */
    getRandomPosition(entityWidth = 0, entityHeight = 0) {
        return {
            x: this.padding + Math.random() * (this.width - entityWidth - this.padding * 2),
            y: this.padding + Math.random() * (this.height - entityHeight - this.padding * 2)
        };
    }
}
