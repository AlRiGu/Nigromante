/**
 * InputManager - Gestor unificado de entrada (teclado + touchscreen)
 */
export class InputManager {
    constructor(canvas, joystick = null) {
        this.keys = {};
        this.joystick = joystick;
        this.canvas = canvas;
        
        // Setup keyboard listeners
        this.setupKeyboardListeners();
    }
    
    /**
     * Configura listeners para teclado
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    /**
     * Obtiene dirección de movimiento (W/A/S/D o Joystick)
     */
    getMovementDirection() {
        let dirX = 0;
        let dirY = 0;
        
        // Entrada por teclado
        if (this.keys['w'] || this.keys['arrowup']) dirY -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dirY += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dirX -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dirX += 1;
        
        // Entrada por joystick móvil
        if (this.joystick) {
            const joystickDir = this.joystick.getDirection();
            dirX += joystickDir.x;
            dirY += joystickDir.y;
        }
        
        // Normalizar si hay entrada diagonal
        const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
        if (magnitude > 1) {
            dirX /= magnitude;
            dirY /= magnitude;
        }
        
        return { x: dirX, y: dirY };
    }
    
    /**
     * Verifica si está presionado el botón de ataque (ESPACIO o click móvil)
     */
    isAttackPressed() {
        return this.keys[' '] || this.keys['space'];
    }
    
    /**
     * Limpiar estado de teclas presionadas (útil para ciertos eventos)
     */
    clearAttack() {
        this.keys[' '] = false;
        this.keys['space'] = false;
    }
}
