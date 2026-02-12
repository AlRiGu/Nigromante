import { VirtualJoystick } from '../input/VirtualJoystick.js';

/**
 * Sistema de manejo de entrada del teclado y joystick móvil
 */
export class InputManager {
    constructor(canvas = null) {
        this.keys = new Set();
        this.canvas = canvas;
        this.virtualJoystick = canvas ? new VirtualJoystick(canvas) : null;
        
        // Guardar referencias a los handlers para poder removerlos
        this.handleKeyDown = (e) => {
            if (e.key) {
                this.keys.add(e.key.toLowerCase());
            }
        };
        
        this.handleKeyUp = (e) => {
            if (e.key) {
                this.keys.delete(e.key.toLowerCase());
            }
        };
        
        // Registrar listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    isKeyPressed(key) {
        return this.keys.has(key.toLowerCase());
    }

    getMovementInput() {
        let x = 0;
        let y = 0;
        
        // Entrada por teclado
        if (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) y -= 1;
        if (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) y += 1;
        if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft')) x -= 1;
        if (this.isKeyPressed('d') || this.isKeyPressed('arrowright')) x += 1;
        
        // Entrada por joystick móvil
        if (this.virtualJoystick) {
            const joystickDir = this.virtualJoystick.getDirection();
            x += joystickDir.x;
            y += joystickDir.y;
        }
        
        // Normalizar si hay entrada diagonal
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude > 1) {
            x /= magnitude;
            y /= magnitude;
        }
        
        return { x, y };
    }

    isAttackPressed() {
        return this.isKeyPressed(' ') || this.isKeyPressed('enter');
    }
    
    /**
     * Obtiene el joystick virtual (para renderizado)
     */
    getVirtualJoystick() {
        return this.virtualJoystick;
    }
    
    /**
     * Limpia los event listeners del teclado
     */
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.keys.clear();
    }
}
