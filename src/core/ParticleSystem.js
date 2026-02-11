/**
 * ParticleSystem - Sistema de partículas con object pooling
 */
export class ParticleSystem {
    constructor(config = {}) {
        this.particles = [];
        this.pool = [];
        this.maxParticles = config.maxParticles || 500;
        this.enabled = config.enabled !== false;
        
        // Pre-crear pool de partículas para evitar garbage collection
        for (let i = 0; i < this.maxParticles; i++) {
            this.pool.push(new Particle());
        }
    }
    
    /**
     * Obtiene una partícula del pool
     * @returns {Particle|null}
     */
    getParticle() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return null; // Pool agotado
    }
    
    /**
     * Devuelve una partícula al pool para reutilización
     * @param {Particle} particle - Partícula a devolver
     */
    releaseParticle(particle) {
        particle.reset();
        this.pool.push(particle);
    }

    /**
     * Crea una explosión de partículas
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {Object} config - Configuración de las partículas
     */
    createExplosion(x, y, config = {}) {
        if (!this.enabled) return;
        
        const defaults = {
            count: 15,
            color: '#ff6600',
            size: 4,
            speed: 100,
            lifetime: 0.8,
            gravity: 200
        };
        
        const settings = { ...defaults, ...config };
        
        for (let i = 0; i < settings.count; i++) {
            const particle = this.getParticle();
            if (!particle) break; // Pool agotado
            
            const angle = (Math.PI * 2 * i) / settings.count + (Math.random() - 0.5) * 0.5;
            const speed = settings.speed * (0.7 + Math.random() * 0.6);
            
            particle.init(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                settings.size,
                settings.color,
                settings.lifetime,
                settings.gravity
            );
            
            this.particles.push(particle);
        }
    }

    /**
     * Crea partículas de conversión a fantasma
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    createGhostConversion(x, y) {
        if (!this.enabled) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            
            particle.init(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                3 + Math.random() * 3,
                i % 2 === 0 ? '#00ffff' : '#00aaff',
                1.2,
                -50 // Gravedad negativa (flotan hacia arriba)
            );
            
            this.particles.push(particle);
        }
    }

    /**
     * Crea un trail de partículas
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {string} color - Color de las partículas
     */
    createTrail(x, y, color = '#bd00ff') {
        if (!this.enabled || this.particles.length >= this.maxParticles) return;
        
        const particle = this.getParticle();
        if (!particle) return;
        
        particle.init(
            x + (Math.random() - 0.5) * 8,
            y + (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            2 + Math.random() * 2,
            color,
            0.4,
            0
        );
        
        this.particles.push(particle);
    }

    /**
     * Crea partículas de impacto
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} vx - Velocidad X del proyectil
     * @param {number} vy - Velocidad Y del proyectil
     */
    createImpact(x, y, vx, vy) {
        if (!this.enabled) return;
        
        const angle = Math.atan2(vy, vx);
        const baseColor = '#ff6600';
        
        for (let i = 0; i < 8; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            const spreadAngle = angle + Math.PI + (Math.random() - 0.5) * Math.PI;
            const speed = 50 + Math.random() * 100;
            
            particle.init(
                x,
                y,
                Math.cos(spreadAngle) * speed,
                Math.sin(spreadAngle) * speed,
                2 + Math.random() * 3,
                baseColor,
                0.5,
                100
            );
            
            this.particles.push(particle);
        }
    }

    /**
     * Actualiza todas las partículas
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        if (!this.enabled) return;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (!particle.active) {
                this.particles.splice(i, 1);
                this.releaseParticle(particle); // Devolver al pool
            }
        }
    }

    /**
     * Renderiza todas las partículas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        for (const particle of this.particles) {
            particle.render(ctx);
        }
    }

    /**
     * Limpia todas las partículas
     */
    clear() {
        // Devolver todas las partículas al pool
        for (const particle of this.particles) {
            this.releaseParticle(particle);
        }
        this.particles.length = 0;
    }
    
    /**
     * Obtiene el conteo de partículas activas
     */
    getCount() {
        return this.particles.length;
    }
}

/**
 * Particle - Partícula individual reutilizable
 */
class Particle {
    constructor() {
        this.reset();
    }
    
    /**
     * Inicializa la partícula con nuevos valores
     */
    init(x, y, vx, vy, size, color, lifetime, gravity = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.lifetime = lifetime;
        this.age = 0;
        this.active = true;
        this.gravity = gravity;
        this.initialSize = size;
    }
    
    /**
     * Resetea la partícula para reutilización
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 0;
        this.color = '#ffffff';
        this.lifetime = 0;
        this.age = 0;
        this.active = false;
        this.gravity = 0;
        this.initialSize = 0;
    }

    /**
     * Actualiza la partícula
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        this.age += deltaTime;
        
        if (this.age >= this.lifetime) {
            this.active = false;
            return;
        }
        
        // Actualizar posición
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Aplicar gravedad
        this.vy += this.gravity * deltaTime;
        
        // Reducir tamaño con el tiempo
        const lifePercent = this.age / this.lifetime;
        this.size = this.initialSize * (1 - lifePercent);
    }

    /**
     * Renderiza la partícula
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        const lifePercent = this.age / this.lifetime;
        const alpha = 1 - lifePercent;
        
        // Extraer componentes RGB del color
        const hexColor = this.color.replace('#', '');
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
    }
}
