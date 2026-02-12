/**
 * VirtualJoystick - Joystick táctil para móviles
 * Renderiza un joystick en la esquina inferior izquierda del canvas
 */
export class VirtualJoystick {
    constructor(canvas) {
        this.canvas = canvas;
        this.isMobile = this.checkMobile();
        
        // Posición y tamaño del joystick (50% más grande en móvil)
        const sizeScale = this.isMobile ? 1.5 : 1;
        this.baseRadius = 50 * sizeScale;
        this.stickRadius = 30 * sizeScale;
        this.baseX = this.baseRadius + 20; // Margen izquierdo
        this.baseY = canvas.height - this.baseRadius - 20; // Margen inferior
        
        // Estado del joystick
        this.isPressed = false;
        this.touchX = this.baseX;
        this.touchY = this.baseY;
        
        // Input direction normalizado (-1 a 1)
        this.directionX = 0;
        this.directionY = 0;
        
        // Event listeners
        this.setupEventListeners();
    }
    
    /**
     * Detecta si está en dispositivo móvil
     */
    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    /**
     * Configura event listeners para touch
     */
    setupEventListeners() {
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    /**
     * Maneja el inicio del toque
     */
    handleTouchStart(e) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Verificar si el toque está dentro del área del joystick
        const dx = x - this.baseX;
        const dy = y - this.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.baseRadius * 1.5) {
            this.isPressed = true;
            this.updateJoystickPosition(x, y);
        }
    }
    
    /**
     * Maneja el movimiento del toque
     */
    handleTouchMove(e) {
        if (!this.isPressed) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.updateJoystickPosition(x, y);
    }
    
    /**
     * Maneja el fin del toque
     */
    handleTouchEnd(e) {
        this.isPressed = false;
        this.touchX = this.baseX;
        this.touchY = this.baseY;
        this.directionX = 0;
        this.directionY = 0;
    }
    
    /**
     * Actualiza la posición del stick
     */
    updateJoystickPosition(x, y) {
        const dx = x - this.baseX;
        const dy = y - this.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > this.baseRadius) {
            // Limitar al radio de la base
            const angle = Math.atan2(dy, dx);
            this.touchX = this.baseX + Math.cos(angle) * this.baseRadius;
            this.touchY = this.baseY + Math.sin(angle) * this.baseRadius;
            
            this.directionX = Math.cos(angle);
            this.directionY = Math.sin(angle);
        } else {
            this.touchX = x;
            this.touchY = y;
            
            if (dist > 0) {
                this.directionX = dx / dist;
                this.directionY = dy / dist;
            } else {
                this.directionX = 0;
                this.directionY = 0;
            }
        }
    }
    
    /**
     * Renderiza el joystick en el canvas
     */
    render(ctx) {
        if (!this.isMobile) return; // Solo mostrar en móviles
        
        // Base del joystick (círculo fijo)
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.beginPath();
        ctx.arc(this.baseX, this.baseY, this.baseRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde de la base
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Stick (círculo movible)
        ctx.fillStyle = this.isPressed ? 'rgba(0, 150, 255, 0.6)' : 'rgba(100, 150, 200, 0.5)';
        ctx.beginPath();
        ctx.arc(this.touchX, this.touchY, this.stickRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde del stick
        ctx.strokeStyle = this.isPressed ? 'rgba(0, 200, 255, 0.8)' : 'rgba(150, 200, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Línea directriz (opcional)
        if (this.isPressed && (this.directionX !== 0 || this.directionY !== 0)) {
            ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.baseX, this.baseY);
            ctx.lineTo(
                this.baseX + this.directionX * this.baseRadius,
                this.baseY + this.directionY * this.baseRadius
            );
            ctx.stroke();
        }
    }
    
    /**
     * Obtiene la dirección normalizada actual
     */
    getDirection() {
        return {
            x: this.directionX,
            y: this.directionY
        };
    }
    
    /**
     * Verifica si el joystick está activo
     */
    isActive() {
        return this.isPressed && (this.directionX !== 0 || this.directionY !== 0);
    }
}
