/**
 * EventBus - Sistema de eventos desacoplado
 * Permite comunicación entre módulos sin acoplamiento directo
 */
export class EventBus {
    constructor() {
        this.events = new Map();
    }

    /**
     * Suscribirse a un evento
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función a ejecutar cuando se emita el evento
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    /**
     * Desuscribirse de un evento
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función a remover
     */
    off(event, callback) {
        if (!this.events.has(event)) return;
        
        const callbacks = this.events.get(event);
        const index = callbacks.indexOf(callback);
        
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emitir un evento
     * @param {string} event - Nombre del evento
     * @param {*} data - Datos a pasar a los callbacks
     */
    emit(event, data) {
        if (!this.events.has(event)) return;
        
        const callbacks = this.events.get(event);
        callbacks.forEach(callback => callback(data));
    }

    /**
     * Limpiar todos los eventos
     */
    clear() {
        this.events.clear();
    }
}

/**
 * Eventos estándar del juego
 */
export const GameEvents = {
    ENEMY_DEFEATED: 'enemy_defeated',
    PLAYER_LEVEL_UP: 'player_level_up',
    PLAYER_DAMAGED: 'player_damaged',
    PROJECTILE_HIT: 'projectile_hit',
    ARMY_UNIT_ADDED: 'army_unit_added',
    GAME_OVER: 'game_over',
    WAVE_COMPLETED: 'wave_completed'
};
