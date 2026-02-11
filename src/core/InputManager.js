/**
 * Sistema de manejo de entrada del teclado
 */
export class InputManager {
    constructor() {
        this.keys = new Set();
        
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
        
        if (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) y -= 1;
        if (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) y += 1;
        if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft')) x -= 1;
        if (this.isKeyPressed('d') || this.isKeyPressed('arrowright')) x += 1;
        
        return { x, y };
    }

    isAttackPressed() {
        return this.isKeyPressed(' ') || this.isKeyPressed('enter');
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
