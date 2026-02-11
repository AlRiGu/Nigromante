import { Scene } from '../core/SceneManager.js';
import { ParticleSystem } from '../core/ParticleSystem.js';

/**
 * GameOverScene - Pantalla de Game Over
 */
export class GameOverScene extends Scene {
    constructor() {
        super();
        
        // Datos de la partida
        this.gameStats = {
            level: 0,
            kills: 0,
            armySize: 0,
            wave: 0,
            score: 0
        };
        
        // Partículas
        this.particleSystem = null;
        
        // Botones
        this.menuButton = {
            x: 0,
            y: 0,
            width: 280,
            height: 70,
            text: 'MENÚ PRINCIPAL',
            hovered: false,
            scale: 1.0,
            targetScale: 1.0
        };
        
        // Animaciones
        this.fadeIn = 0;
        this.titleShake = 0;
        
        // Mouse
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Listeners
        this.mouseMoveListener = null;
        this.mouseClickListener = null;
    }
    
    enter(data = {}) {
        console.log('💀 Game Over');
        
        // Control de transición
        this.transitioning = false;
        
        // Guardar estadísticas
        this.gameStats = {
            level: data.level || 0,
            kills: data.kills || 0,
            armySize: data.armySize || 0,
            wave: data.wave || 0,
            score: this.calculateScore(data)
        };
        
        // Inicializar partículas
        this.particleSystem = new ParticleSystem({ maxParticles: 300, enabled: true });
        
        // Calcular posición del botón
        this.menuButton.x = this.width / 2 - this.menuButton.width / 2;
        this.menuButton.y = this.height - 150;
        
        // Cachear bounds
        this.canvasBounds = this.canvas.getBoundingClientRect();
        
        // Cachear gradientes
        this.cacheGradients();
        
        // Reset animaciones
        this.fadeIn = 0;
        
        // Setup mouse listeners
        this.setupMouseListeners();
        
        // Efecto inicial de partículas (optimizado)
        this.spawnDeathExplosion();
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
    }
    
    calculateScore(data) {
        // Fórmula de puntuación: nivel * 100 + kills * 10 + armySize * 5 + wave * 50
        return (data.level || 0) * 100 + 
               (data.kills || 0) * 10 + 
               (data.armySize || 0) * 5 + 
               (data.wave || 0) * 50;
    }
    
    setupMouseListeners() {
        this.mouseMoveListener = (e) => {
            // Usar bounds cacheados
            this.mouseX = e.clientX - this.canvasBounds.left;
            this.mouseY = e.clientY - this.canvasBounds.top;
            
            this.checkButtonHover();
        };
        
        this.mouseClickListener = (e) => {
            // Usar bounds cacheados
            const clickX = e.clientX - this.canvasBounds.left;
            const clickY = e.clientY - this.canvasBounds.top;
            
            if (this.isPointInButton(clickX, clickY)) {
                this.returnToMenu();
            }
        };
        
        this.canvas.addEventListener('mousemove', this.mouseMoveListener);
        this.canvas.addEventListener('click', this.mouseClickListener);
    }
    
    checkButtonHover() {
        const wasHovered = this.menuButton.hovered;
        this.menuButton.hovered = this.isPointInButton(this.mouseX, this.mouseY);
        
        if (this.menuButton.hovered !== wasHovered) {
            this.menuButton.targetScale = this.menuButton.hovered ? 1.1 : 1.0;
            
            if (this.menuButton.hovered) {
                this.particleSystem.createExplosion(
                    this.menuButton.x + this.menuButton.width / 2,
                    this.menuButton.y + this.menuButton.height / 2,
                    { count: 8, color: '#ff6600', speed: 80, size: 3, lifetime: 0.6 }
                );
            }
        }
    }
    
    isPointInButton(x, y) {
        return x >= this.menuButton.x && 
               x <= this.menuButton.x + this.menuButton.width &&
               y >= this.menuButton.y && 
               y <= this.menuButton.y + this.menuButton.height;
    }
    
    returnToMenu() {
        if (this.transitioning) return; // Prevenir múltiples clicks
        
        this.transitioning = true;
        console.log('🔙 Volviendo al menú...');
        
        // Efecto de partículas
        this.particleSystem.createExplosion(
            this.menuButton.x + this.menuButton.width / 2,
            this.menuButton.y + this.menuButton.height / 2,
            { count: 20, color: '#ff6600', speed: 120, size: 4 }
        );
        
        // Delay para ver el efecto
        setTimeout(() => {
            this.sceneManager.switchTo('menu');
        }, 200);
    }
    
    spawnDeathExplosion() {
        // Explosión central (optimizado - solo 30 partículas iniciales)
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const speed = 100 + Math.random() * 150;
            const x = this.width / 2;
            const y = this.height / 2 - 100;
            
            const particle = this.particleSystem.getParticle();
            if (particle) {
                particle.init(
                    x, y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    3 + Math.random() * 4,
                    Math.random() > 0.5 ? '#ff0000' : '#ff6600',
                    1.5,
                    150
                );
                this.particleSystem.particles.push(particle);
            }
        }
    }
    
    update(deltaTime) {
        // Fade in
        this.fadeIn = Math.min(1, this.fadeIn + deltaTime * 2);
        
        // Shake del título al inicio
        if (this.fadeIn < 0.5) {
            this.titleShake = (Math.random() - 0.5) * 10 * (1 - this.fadeIn * 2);
        } else {
            this.titleShake = 0;
        }
        
        // Lerp de escala del botón
        const lerpSpeed = 8;
        this.menuButton.scale += (this.menuButton.targetScale - this.menuButton.scale) * lerpSpeed * deltaTime;
        
        // Actualizar partículas
        this.particleSystem.update(deltaTime);
    }
    
    cacheGradients() {
        // Gradiente de fondo radial
        this.backgroundGradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width
        );
        this.backgroundGradient.addColorStop(0, '#2a0a0a');
        this.backgroundGradient.addColorStop(0.5, '#1a0a0a');
        this.backgroundGradient.addColorStop(1, '#0a0a0a');
        
        // Gradiente del título
        this.titleGradient = this.ctx.createLinearGradient(
            this.width / 2 - 300, 0, 
            this.width / 2 + 300, 0
        );
        this.titleGradient.addColorStop(0, '#ff6600');
        this.titleGradient.addColorStop(0.5, '#ff0000');
        this.titleGradient.addColorStop(1, '#ff6600');
        
        // Gradientes del botón
        const btn = this.menuButton;
        this.buttonGradientNormal = this.ctx.createLinearGradient(
            btn.x, btn.y, btn.x, btn.y + btn.height
        );
        this.buttonGradientNormal.addColorStop(0, '#cc5200');
        this.buttonGradientNormal.addColorStop(1, '#993d00');
        
        this.buttonGradientHover = this.ctx.createLinearGradient(
            btn.x, btn.y, btn.x, btn.y + btn.height
        );
        this.buttonGradientHover.addColorStop(0, '#ff6600');
        this.buttonGradientHover.addColorStop(1, '#cc5200');
    }
    
    render() {
        // Fondo oscuro rojo (cacheado)
        this.ctx.fillStyle = this.backgroundGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Partículas
        this.particleSystem.render(this.ctx);
        
        // Overlay de fade in
        this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.fadeIn})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Título "GAME OVER"
        this.renderGameOverTitle();
        
        // Estadísticas
        this.renderStats();
        
        // Botón al menú
        this.renderMenuButton();
    }
    
    renderGameOverTitle() {
        this.ctx.save();
        
        this.ctx.textAlign = 'center';
        
        // Sombra roja dramática (optimizado - solo 3 capas)
        for (let i = 3; i > 0; i--) {
            this.ctx.fillStyle = `rgba(255, 0, 0, ${0.3 / i})`;
            this.ctx.font = `bold ${100}px serif`;
            this.ctx.fillText('GAME OVER', 
                this.width / 2 + this.titleShake + i * 4, 
                150 + i * 4);
        }
        
        // Título principal con gradiente cacheado
        this.ctx.fillStyle = this.titleGradient;
        this.ctx.font = 'bold 100px serif';
        this.ctx.fillText('GAME OVER', this.width / 2 + this.titleShake, 150);
        
        this.ctx.restore();
    }
    
    renderStats() {
        this.ctx.save();
        
        this.ctx.textAlign = 'center';
        
        const startY = 280;
        const lineHeight = 50;
        
        // Título de estadísticas
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText('ESTADÍSTICAS FINALES', this.width / 2, startY);
        
        // Stats individuales
        const stats = [
            { label: 'Nivel Alcanzado', value: this.gameStats.level, color: '#bd00ff' },
            { label: 'Oleada', value: this.gameStats.wave, color: '#ff6600' },
            { label: 'Tamaño del Ejército', value: this.gameStats.armySize, color: '#00ffff' },
            { label: 'PUNTUACIÓN TOTAL', value: this.gameStats.score, color: '#ffd700', bold: true }
        ];
        
        stats.forEach((stat, index) => {
            const y = startY + 60 + index * lineHeight;
            
            // Etiqueta
            this.ctx.fillStyle = '#888888';
            this.ctx.font = stat.bold ? 'bold 28px Arial' : '24px Arial';
            this.ctx.fillText(stat.label, this.width / 2 - 150, y);
            
            // Valor
            this.ctx.fillStyle = stat.color;
            this.ctx.font = stat.bold ? 'bold 32px Arial' : 'bold 28px Arial';
            this.ctx.fillText(stat.value.toString(), this.width / 2 + 150, y);
        });
        
        this.ctx.restore();
    }
    
    renderMenuButton() {
        this.ctx.save();
        
        const btn = this.menuButton;
        const centerX = btn.x + btn.width / 2;
        const centerY = btn.y + btn.height / 2;
        
        // Aplicar escala
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(btn.scale, btn.scale);
        this.ctx.translate(-centerX, -centerY);
        
        // Sombra
        if (btn.hovered) {
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = '#ff6600';
        }
        
        // Fondo del botón con gradiente cacheado
        const btnGradient = btn.hovered ? this.buttonGradientHover : this.buttonGradientNormal;
        
        // Dibujar rectángulo redondeado
        this.roundRect(btn.x, btn.y, btn.width, btn.height, 10);
        this.ctx.fillStyle = btnGradient;
        this.ctx.fill();
        
        // Borde
        this.ctx.strokeStyle = btn.hovered ? '#ffaa00' : '#ff6600';
        this.ctx.lineWidth = btn.hovered ? 3 : 2;
        this.ctx.stroke();
        
        // Texto
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(btn.text, centerX, centerY);
        
        this.ctx.restore();
    }
    
    roundRect(x, y, width, height, radius) {
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
