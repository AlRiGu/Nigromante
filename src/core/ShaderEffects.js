/**
 * ShaderEffects - Sistema de efectos visuales desacoplado
 * Todos los métodos aceptan el contexto como parámetro para flexibilidad y reutilización
 */
export class ShaderEffects {
    constructor(config = {}) {
        this.enabled = config.enabled !== false;
        this.quality = config.quality || 'high'; // 'low', 'medium', 'high'
        
        // Configuración de calidad visual
        this.qualitySettings = {
            low: { 
                vignetteRadius: 0.6, 
                glowSamples: 2, 
                lightningSegments: 3,
                vignetteStrength: 0.2
            },
            medium: { 
                vignetteRadius: 0.5, 
                glowSamples: 4, 
                lightningSegments: 5,
                vignetteStrength: 0.3
            },
            high: { 
                vignetteRadius: 0.4, 
                glowSamples: 6, 
                lightningSegments: 8,
                vignetteStrength: 0.3
            }
        };
        
        this.chromaticAberration = 0;
        this.glowEnabled = true;
    }
    
    /**
     * Aplica efecto de viñeta al contexto dado
     */
    applyVignette(ctx, width, height) {
        if (!this.enabled) return;
        
        const settings = this.qualitySettings[this.quality];
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.3,
            width / 2, height / 2, width * 0.7
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, `rgba(0, 0, 0, ${settings.vignetteStrength})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
    
    /**
     * Dibuja un resplandor alrededor de un punto
     */
    drawGlow(ctx, x, y, radius, color, intensity = 0.5) {
        if (!this.enabled || !this.glowEnabled) return;
        
        const settings = this.qualitySettings[this.quality];
        const samples = settings.glowSamples;
        
        // Extraer componentes RGB del color hex
        const hexColor = color.replace('#', '');
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);
        
        ctx.save();
        for (let i = 0; i < samples; i++) {
            const currentRadius = radius * (1 + i * 0.3);
            const alpha = intensity * (1 - i / samples);
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - currentRadius, y - currentRadius, currentRadius * 2, currentRadius * 2);
        }
        ctx.restore();
    }
    
    /**
     * Aplica efecto de distorsión temporal
     */
    drawDistortion(ctx, x, y, radius, strength, canvasWidth, canvasHeight) {
        if (!this.enabled) return;
        
        const imageData = ctx.getImageData(
            Math.max(0, x - radius),
            Math.max(0, y - radius),
            Math.min(radius * 2, canvasWidth),
            Math.min(radius * 2, canvasHeight)
        );
        
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.putImageData(imageData, x - radius + strength * 2, y - radius);
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
    
    /**
     * Dibuja un rayo de energía entre dos puntos
     */
    drawLightning(ctx, x1, y1, x2, y2, color, thickness) {
        if (!this.enabled) return;
        
        const settings = this.qualitySettings[this.quality];
        const segments = settings.lightningSegments;
        const displacement = 15;
        
        ctx.save();
        
        // Rayo externo
        ctx.strokeStyle = color || '#00ffff';
        ctx.lineWidth = thickness || 2;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        const points = [{x: x1, y: y1}];
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const x = x1 + dx * t + (Math.random() - 0.5) * displacement;
            const y = y1 + dy * t + (Math.random() - 0.5) * displacement;
            points.push({x, y});
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Núcleo brillante
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = (thickness || 2) * 0.3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        for (const point of points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Aplica efecto de pantalla sacudida
     */
    getScreenShake(intensity) {
        if (!this.enabled) return {x: 0, y: 0};
        
        const intensityValue = intensity || 1;
        return {
            x: (Math.random() - 0.5) * intensityValue * 4,
            y: (Math.random() - 0.5) * intensityValue * 4
        };
    }
    
    /**
     * Dibuja un círculo de energía expandiéndose
     */
    drawEnergyRing(ctx, x, y, radius, maxRadius, color) {
        if (!this.enabled) return;
        
        const progress = radius / maxRadius;
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.strokeStyle = (color || '#8b00ff') + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Aplica un filtro de color fantasmagórico
     */
    applyGhostFilter(ctx, width, height) {
        if (!this.enabled) return;
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(0, 200, 255, 0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    }
    
    /**
     * Cambia la configuración de calidad
     */
    setQuality(quality) {
        if (this.qualitySettings[quality]) {
            this.quality = quality;
        }
    }
    
    /**
     * Habilita/deshabilita el sistema de efectos
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    /**
     * Habilita/deshabilita el efecto de resplandor
     */
    setGlowEnabled(enabled) {
        this.glowEnabled = enabled;
    }
}
