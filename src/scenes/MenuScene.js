import { Scene } from '../core/SceneManager.js';
import { ParticleSystem } from '../core/ParticleSystem.js';

/**
 * MenuScene - Pantalla del menú principal
 */
export class MenuScene extends Scene {
    constructor() {
        super();
        
        // Partículas de fondo
        this.particleSystem = null;
        
        // Botón de jugar
        this.playButton = {
            x: 0,
            y: 0,
            width: 280,
            height: 70,
            text: 'JUGAR',
            hovered: false,
            scale: 1.0,
            targetScale: 1.0
        };
        
        // Animaciones
        this.titlePulse = 0;
        this.particleSpawnTimer = 0;
        
        // Mouse tracking
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Listeners
        this.mouseMoveListener = null;
        this.mouseClickListener = null;
    }
    
    enter(data = {}) {
        console.log('🎮 Entrando al menú principal');
        
        // Control de transición
        this.transitioning = false;
        
        // Inicializar sistema de partículas
        this.particleSystem = new ParticleSystem({ maxParticles: 200, enabled: true });
        
        // Calcular posición del botón
        this.playButton.x = this.width / 2 - this.playButton.width / 2;
        this.playButton.y = this.height / 2 + 80;
        
        // Cachear canvas bounds
        this.canvasBounds = this.canvas.getBoundingClientRect();
        
        // Cachear gradientes
        this.cacheGradients();
        
        // Setup mouse listeners
        this.setupMouseListeners();
        
        // Spawn inicial de partículas (reducido)
        this.spawnBackgroundParticles(30);
    }
    
    exit() {
        // Cleanup listeners
        if (this.mouseMoveListener) {
            this.canvas.removeEventListener('mousemove', this.mouseMoveListener);
            this.mouseMoveListener = null;
        }
        if (this.mouseClickListener) {
            this.canvas.removeEventListener('click', this.mouseClickListener);
            this.mouseClickListener = null;
        }
        
        // Cleanup ParticleSystem
        if (this.particleSystem) {
            this.particleSystem.clear();
            this.particleSystem = null;
        }
        
        // Limpiar referencias
        this.canvasBounds = null;
        this.backgroundGradient = null;
        this.titleGradient = null;
        this.buttonGradientNormal = null;
        this.buttonGradientHover = null;
        
        console.log('👋 Saliendo del menú principal');
    }
    
    setupMouseListeners() {
        this.mouseMoveListener = (e) => {
            // Usar bounds cacheados
            this.mouseX = e.clientX - this.canvasBounds.left;
            this.mouseY = e.clientY - this.canvasBounds.top;
            
            // Check hover sobre el botón
            this.checkButtonHover();
        };
        
        this.mouseClickListener = (e) => {
            // Usar bounds cacheados
            const clickX = e.clientX - this.canvasBounds.left;
            const clickY = e.clientY - this.canvasBounds.top;
            
            // Check click en el botón
            if (this.isPointInButton(clickX, clickY)) {
                this.startGame();
            }
        };
        
        this.canvas.addEventListener('mousemove', this.mouseMoveListener);
        this.canvas.addEventListener('click', this.mouseClickListener);
    }
    
    checkButtonHover() {
        const wasHovered = this.playButton.hovered;
        this.playButton.hovered = this.isPointInButton(this.mouseX, this.mouseY);
        
        if (this.playButton.hovered !== wasHovered) {
            this.playButton.targetScale = this.playButton.hovered ? 1.1 : 1.0;
            
            // Efecto de partículas al hacer hover
            if (this.playButton.hovered) {
                this.particleSystem.createExplosion(
                    this.playButton.x + this.playButton.width / 2,
                    this.playButton.y + this.playButton.height / 2,
                    { count: 8, color: '#bd00ff', speed: 80, size: 3, lifetime: 0.6 }
                );
            }
        }
    }
    
    isPointInButton(x, y) {
        return x >= this.playButton.x && 
               x <= this.playButton.x + this.playButton.width &&
               y >= this.playButton.y && 
               y <= this.playButton.y + this.playButton.height;
    }
    
    startGame() {
        if (this.transitioning) return; // Prevenir múltiples clicks
        
        this.transitioning = true;
        console.log('🎯 Iniciando partida...');
        
        // Efecto visual al hacer click
        this.particleSystem.createExplosion(
            this.playButton.x + this.playButton.width / 2,
            this.playButton.y + this.playButton.height / 2,
            { count: 25, color: '#8b00ff', speed: 150, size: 5, lifetime: 0.8 }
        );
        
        // Pequeño delay para ver el efecto
        setTimeout(() => {
            this.sceneManager.switchTo('game');
        }, 200);
    }
    
    spawnBackgroundParticles(count) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            
            // Partículas flotantes lentas
            this.particleSystem.createTrail(x, y, 
                Math.random() > 0.5 ? '#8b00ff' : '#00ffff'
            );
        }
    }
    
    update(deltaTime) {
        // Actualizar animaciones
        this.titlePulse += deltaTime * 2;
        
        // Lerp de escala del botón
        const lerpSpeed = 8;
        this.playButton.scale += (this.playButton.targetScale - this.playButton.scale) * lerpSpeed * deltaTime;
        
        // Actualizar partículas
        this.particleSystem.update(deltaTime);
        
        // Spawn continuo de partículas de fondo (optimizado)
        this.particleSpawnTimer += deltaTime;
        if (this.particleSpawnTimer >= 1.0 && this.particleSystem.getCount() < 150) {
            this.spawnBackgroundParticles(1);
            this.particleSpawnTimer = 0;
        }
    }
    
    cacheGradients() {
        // Gradiente de fondo
        this.backgroundGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        this.backgroundGradient.addColorStop(0, '#0a0a0a');
        this.backgroundGradient.addColorStop(0.5, '#1a1a2e');
        this.backgroundGradient.addColorStop(1, '#0a0a0a');
        
        // Gradiente del título
        this.titleGradient = this.ctx.createLinearGradient(
            this.width / 2 - 300, 0, 
            this.width / 2 + 300, 0
        );
        this.titleGradient.addColorStop(0, '#bd00ff');
        this.titleGradient.addColorStop(0.5, '#8b00ff');
        this.titleGradient.addColorStop(1, '#bd00ff');
        
        // Gradientes del botón
        const btn = this.playButton;
        this.buttonGradientNormal = this.ctx.createLinearGradient(
            btn.x, btn.y, btn.x, btn.y + btn.height
        );
        this.buttonGradientNormal.addColorStop(0, '#8b00ff');
        this.buttonGradientNormal.addColorStop(1, '#6a00cc');
        
        this.buttonGradientHover = this.ctx.createLinearGradient(
            btn.x, btn.y, btn.x, btn.y + btn.height
        );
        this.buttonGradientHover.addColorStop(0, '#bd00ff');
        this.buttonGradientHover.addColorStop(1, '#8b00ff');
    }
    
    render() {
        // Fondo oscuro con gradiente (cacheado)
        this.ctx.fillStyle = this.backgroundGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Partículas de fondo
        this.particleSystem.render(this.ctx);
        
        // Título del juego
        this.renderTitle();
        
        // Subtítulo
        this.renderSubtitle();
        
        // Botón de jugar
        this.renderPlayButton();
        
        // Footer
        this.renderFooter();
    }
    
    renderTitle() {
        this.ctx.save();
        
        // Efecto de pulso
        const pulse = 1 + Math.sin(this.titlePulse) * 0.2;
        
        this.ctx.textAlign = 'center';
        
        // Sombra del título (optimizado - solo 2 capas)
        for (let i = 2; i > 0; i--) {
            this.ctx.fillStyle = `rgba(138, 0, 255, ${0.3 / i})`;
            this.ctx.font = `bold ${Math.floor(80 * pulse)}px serif`;
            this.ctx.fillText('NIGROMANTE', this.width / 2 + i * 3, this.height / 2 - 100 + i * 3);
        }
        
        // Título principal con gradiente cacheado
        this.ctx.fillStyle = this.titleGradient;
        this.ctx.font = `bold ${Math.floor(80 * pulse)}px serif`;
        this.ctx.fillText('NIGROMANTE', this.width / 2, this.height / 2 - 100);
        
        // Borde del título
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText('NIGROMANTE', this.width / 2, this.height / 2 - 100);
        
        this.ctx.restore();
    }
    
    renderSubtitle() {
        this.ctx.save();
        
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = '24px serif';
        this.ctx.fillText('El Invocador de las Sombras', this.width / 2, this.height / 2 - 30);
        
        this.ctx.restore();
    }
    
    renderPlayButton() {
        this.ctx.save();
        
        const btn = this.playButton;
        const centerX = btn.x + btn.width / 2;
        const centerY = btn.y + btn.height / 2;
        
        // Aplicar escala
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(btn.scale, btn.scale);
        this.ctx.translate(-centerX, -centerY);
        
        // Sombra del botón
        if (btn.hovered) {
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = '#bd00ff';
        }
        
        // Fondo del botón con gradiente cacheado
        const btnGradient = btn.hovered ? this.buttonGradientHover : this.buttonGradientNormal;
        
        // Dibujar rectángulo redondeado
        this.roundRect(btn.x, btn.y, btn.width, btn.height, 10, true, true);
        this.ctx.fillStyle = btnGradient;
        this.ctx.fill();
        
        // Borde
        this.ctx.strokeStyle = btn.hovered ? '#ff00ff' : '#bd00ff';
        this.ctx.lineWidth = btn.hovered ? 3 : 2;
        this.ctx.stroke();
        
        // Texto del botón
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(btn.text, centerX, centerY);
        
        this.ctx.restore();
    }
    
    renderFooter() {
        this.ctx.save();
        
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Controles: WASD - Movimiento | ESPACIO - Atacar', 
                         this.width / 2, this.height - 50);
        
        this.ctx.fillStyle = '#444444';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('© 2026 Nigromante Game - Desarrollado con Vite + Canvas', 
                         this.width / 2, this.height - 20);
        
        this.ctx.restore();
    }
    
    roundRect(x, y, width, height, radius, fill, stroke) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
}
