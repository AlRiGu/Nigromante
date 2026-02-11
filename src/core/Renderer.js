/**
 * Renderer - Sistema de renderizado modular
 * Separa la lógica de renderizado del Game loop
 */
export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        
        // Grid pre-renderizado para performance
        this.gridCanvas = null;
        this.showGrid = false;
        this.gridSize = 40;
    }

    /**
     * Pre-renderiza el grid en un canvas offscreen
     */
    initGrid() {
        this.gridCanvas = document.createElement('canvas');
        this.gridCanvas.width = this.width;
        this.gridCanvas.height = this.height;
        
        const ctx = this.gridCanvas.getContext('2d');
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        
        // Usar un solo path para todas las líneas (optimización)
        ctx.beginPath();
        
        // Líneas verticales
        for (let x = 0; x < this.width; x += this.gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
        }
        
        // Líneas horizontales
        for (let y = 0; y < this.height; y += this.gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
        }
        
        ctx.stroke();
    }

    /**
     * Limpia el canvas
     * @param {string} backgroundColor - Color de fondo
     */
    clear(backgroundColor = '#0a0a0a') {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Renderiza el grid de fondo (optimizado)
     */
    renderGrid() {
        if (!this.showGrid) return;
        
        if (!this.gridCanvas) {
            this.initGrid();
        }
        
        // Dibuja el grid pre-renderizado en una sola operación
        this.ctx.drawImage(this.gridCanvas, 0, 0);
    }

    /**
     * Renderiza la UI del juego
     * @param {Object} uiData - Datos para la UI
     */
    renderUI(uiData) {
        const { player } = uiData;
        const padding = 20;
        const lineHeight = 25;
        let y = padding;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        
        // Stats del jugador
        this.ctx.fillText(`Nivel: ${player.level}`, padding, y);
        y += lineHeight;
        
        this.ctx.fillText(`Vida: ${Math.ceil(player.health)}/${player.maxHealth}`, padding, y);
        y += lineHeight;
        
        this.ctx.fillText(`Ejército: ${uiData.armyCount}/${player.armyCapacity}`, padding, y);
        y += lineHeight;
        
        this.ctx.fillText(`Daño: ${player.damage}`, padding, y);
        y += lineHeight;
        
        // Barra de experiencia
        this.renderExperienceBar(player, padding, y);
    }

    /**
     * Renderiza la barra de experiencia
     * @param {Player} player - Jugador
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    renderExperienceBar(player, x, y) {
        const expBarWidth = 200;
        const expBarHeight = 20;
        
        // Fondo
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, expBarWidth, expBarHeight);
        
        // Progreso
        const expPercent = player.experienceToNextLevel > 0 
            ? player.experience / player.experienceToNextLevel 
            : 0;
        this.ctx.fillStyle = '#00aaff';
        this.ctx.fillRect(x, y, expBarWidth * expPercent, expBarHeight);
        
        // Borde
        this.ctx.strokeStyle = '#555';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, expBarWidth, expBarHeight);
        
        // Texto
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `XP: ${Math.floor(player.experience)}/${player.experienceToNextLevel}`,
            x + expBarWidth / 2,
            y + 14
        );
        this.ctx.textAlign = 'left';
    }

    /**
     * Renderiza información de debug
     * @param {Object} debugData - Datos de debug
     */
    renderDebug(debugData) {
        const padding = 20;
        const y = this.height - padding;
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '14px monospace';
        
        let x = padding;
        this.ctx.fillText(`FPS: ${debugData.fps}`, x, y);
        x += 100;
        
        this.ctx.fillText(`Enemigos: ${debugData.enemyCount}`, x, y);
        x += 140;
        
        this.ctx.fillText(`Proyectiles: ${debugData.projectileCount}`, x, y);
        x += 160;
        
        this.ctx.fillText(`Ejército: ${debugData.armyCount}`, x, y);
        x += 120;
        
        if (debugData.particleCount !== undefined) {
            this.ctx.fillText(`Partículas: ${debugData.particleCount}`, x, y);
        }
    }

    /**
     * Renderiza una entidad individual
     * @param {Entity} entity - Entidad a renderizar
     */
    renderEntity(entity) {
        entity.render(this.ctx);
    }

    /**
     * Renderiza un array de entidades
     * @param {Array} entities - Array de entidades
     */
    renderEntities(entities) {
        entities.forEach(entity => this.renderEntity(entity));
    }
}
