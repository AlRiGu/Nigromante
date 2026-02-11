/**
 * EntityManager - Gestión centralizada de entidades
 * Elimina código duplicado en la actualización de arrays
 */
export class EntityManager {
    constructor() {
        this.entities = new Map();
    }

    /**
     * Registra un grupo de entidades
     * @param {string} group - Nombre del grupo
     * @param {Array} entities - Array de entidades
     */
    register(group, entities) {
        this.entities.set(group, entities);
    }

    /**
     * Obtiene un grupo de entidades
     * @param {string} group - Nombre del grupo
     * @returns {Array}
     */
    get(group) {
        return this.entities.get(group) || [];
    }

    /**
     * Actualiza todas las entidades de un grupo
     * Elimina las entidades inactivas automáticamente
     * @param {string} group - Nombre del grupo
     * @param {number} deltaTime - Delta time
     * @param  {...any} args - Argumentos adicionales para update()
     */
    update(group, deltaTime, ...args) {
        const entities = this.get(group);
        
        for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];
            entity.update(deltaTime, ...args);
            
            if (!entity.active) {
                entities.splice(i, 1);
            }
        }
    }

    /**
     * Actualiza todos los grupos registrados
     * @param {number} deltaTime - Delta time
     * @param  {...any} args - Argumentos adicionales
     */
    updateAll(deltaTime, ...args) {
        for (const [group, entities] of this.entities) {
            this.update(group, deltaTime, ...args);
        }
    }

    /**
     * Renderiza todas las entidades de un grupo
     * @param {string} group - Nombre del grupo
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} gameTime - Tiempo de juego para animaciones
     */
    render(group, ctx, gameTime = 0) {
        const entities = this.get(group);
        entities.forEach(entity => entity.render(ctx, gameTime));
    }

    /**
     * Renderiza todos los grupos en orden
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Array<string>} order - Orden de renderizado de los grupos
     * @param {number} gameTime - Tiempo de juego para animaciones
     */
    renderAll(ctx, order = [], gameTime = 0) {
        if (order.length === 0) {
            // Si no se especifica orden, usar el orden de inserción
            for (const [group, entities] of this.entities) {
                this.render(group, ctx, gameTime);
            }
        } else {
            // Renderizar en el orden especificado
            order.forEach(group => this.render(group, ctx, gameTime));
        }
    }

    /**
     * Limpia un grupo de entidades
     * @param {string} group - Nombre del grupo
     */
    clear(group) {
        const entities = this.get(group);
        entities.length = 0;
    }

    /**
     * Limpia todos los grupos
     */
    clearAll() {
        for (const [group, entities] of this.entities) {
            entities.length = 0;
        }
    }

    /**
     * Cuenta las entidades activas en un grupo
     * @param {string} group - Nombre del grupo
     * @returns {number}
     */
    count(group) {
        return this.get(group).length;
    }

    /**
     * Obtiene todas las entidades de todos los grupos
     * @returns {Array}
     */
    getAllEntities() {
        const all = [];
        for (const [group, entities] of this.entities) {
            all.push(...entities);
        }
        return all;
    }
}
