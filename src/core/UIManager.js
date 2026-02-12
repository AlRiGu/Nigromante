/**
 * UIManager - Sistema de interfaz de usuario para el juego
 */
export class UIManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Estado de UI
        this.showCardSelection = false;
        this.selectedCard = null;
        this.availableCards = [];
        
        // Configuración visual
        this.cardWidth = 200;
        this.cardHeight = 280;
        this.cardSpacing = 30;
        this.cardRadius = 10;
        
        // Animaciones
        this.cardHoverIndex = -1;
        this.hoverScale = 1.0;
        this.hoverTargetScale = 1.0;
        
        // Colores
        this.colors = {
            cardBg: '#1a1a2e',
            cardBorder: '#bd00ff',
            cardHover: '#ff00ff',
            textPrimary: '#ffffff',
            textSecondary: '#aaaaaa',
            rarityCommon: '#7f8c8d',
            rarityRare: '#3498db',
            rarityEpic: '#9b59b6',
            rarityLegendary: '#f39c12'
        };
    }
    
    /**
     * Actualiza animaciones de UI
     */
    update(deltaTime) {
        // Animación suave de escala del hover
        const lerpSpeed = 10;
        this.hoverScale += (this.hoverTargetScale - this.hoverScale) * lerpSpeed * deltaTime;
    }
    
    /**
     * Renderiza la UI completa
     */
    render(ctx, gameState) {
        // HUD superior (stats del jugador)
        this.renderHUD(ctx, gameState.player, gameState.armyCount);
        
        // Selector de cartas (si está activo)
        if (this.showCardSelection) {
            this.renderCardSelection(ctx);
        }
    }
    
    /**
     * Renderiza el HUD superior con stats del jugador
     */
    renderHUD(ctx, player, armyCount) {
        // Detectar si está en móvil para escalar UI
        const isMobile = window.innerWidth < 768;
        const uiScale = isMobile ? 1.5 : 1; // 50% más grande en móvil
        
        const padding = 20 * uiScale;
        const barWidth = 200 * uiScale;
        const barHeight = 25 * uiScale;
        
        ctx.save();
        
        // Fondo semitransparente para el HUD
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.width, 80 * uiScale);
        
        // Nivel del jugador
        ctx.fillStyle = this.colors.textPrimary;
        ctx.font = `bold ${Math.floor(24 * uiScale)}px Arial`;
        ctx.fillText(`Nivel ${player.level}`, padding, 35 * uiScale);
        
        // Barra de experiencia
        const xpBarX = padding;
        const xpBarY = 45 * uiScale;
        const xpPercent = player.xp / player.xpToNextLevel;
        
        // Fondo de la barra
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.roundRect(ctx, xpBarX, xpBarY, barWidth, barHeight, 5, true, false);
        
        // Relleno de XP
        ctx.fillStyle = '#bd00ff';
        this.roundRect(ctx, xpBarX, xpBarY, barWidth * xpPercent, barHeight, 5, true, false);
        
        // Texto de XP
        ctx.fillStyle = this.colors.textPrimary;
        ctx.font = `${Math.floor(14 * uiScale)}px Arial`;
        ctx.fillText(`XP: ${Math.floor(player.xp)}/${player.xpToNextLevel}`, xpBarX + 5, xpBarY + 17 * uiScale);
        
        // Barra de vida
        const hpBarX = barWidth + padding * 2 + 20;
        const hpBarY = 45 * uiScale;
        const hpPercent = player.health / player.maxHealth;
        
        // Fondo de la barra de vida
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.roundRect(ctx, hpBarX, hpBarY, barWidth, barHeight, 5, true, false);
        
        // Relleno de vida
        const healthColor = hpPercent > 0.5 ? '#00ff00' : (hpPercent > 0.25 ? '#ffaa00' : '#ff0000');
        ctx.fillStyle = healthColor;
        this.roundRect(ctx, hpBarX, hpBarY, barWidth * hpPercent, barHeight, 5, true, false);
        
        // Texto de vida
        ctx.fillStyle = this.colors.textPrimary;
        ctx.font = `${Math.floor(14 * uiScale)}px Arial`;
        ctx.fillText(`HP: ${Math.floor(player.health)}/${player.maxHealth}`, hpBarX + 5, hpBarY + 17 * uiScale);
        
        // Contador de ejército (derecha)
        const armyTextX = this.width - padding;
        ctx.font = `bold ${Math.floor(24 * uiScale)}px Arial`;
        ctx.fillStyle = '#00ffff';
        ctx.textAlign = 'right';
        ctx.fillText(`👻 ${armyCount}/${player.maxArmy}`, armyTextX, 35 * uiScale);
        
        // Puntos acumulados
        ctx.font = `${Math.floor(16 * uiScale)}px Arial`;
        ctx.fillStyle = this.colors.textSecondary;
        ctx.fillText(`Puntos: ${Math.floor(player.points)}`, armyTextX, 60 * uiScale);
        
        ctx.textAlign = 'left';
        ctx.restore();
    }
    
    /**
     * Renderiza el selector de cartas cuando el jugador sube de nivel
     */
    renderCardSelection(ctx) {
        // Overlay oscuro
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Título
        ctx.fillStyle = this.colors.textPrimary;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡NIVEL SUBIDO!', this.width / 2, 120);
        
        ctx.font = '24px Arial';
        ctx.fillStyle = this.colors.textSecondary;
        ctx.fillText('Selecciona una mejora:', this.width / 2, 170);
        
        // Renderizar cartas
        const totalWidth = this.availableCards.length * (this.cardWidth + this.cardSpacing) - this.cardSpacing;
        const startX = (this.width - totalWidth) / 2;
        const startY = 220;
        
        for (let i = 0; i < this.availableCards.length; i++) {
            const card = this.availableCards[i];
            const x = startX + i * (this.cardWidth + this.cardSpacing);
            const y = startY;
            
            // Escala de hover
            const scale = (i === this.cardHoverIndex) ? this.hoverScale : 1.0;
            const offsetY = (i === this.cardHoverIndex) ? -20 : 0;
            
            this.renderCard(ctx, card, x, y + offsetY, scale, i === this.cardHoverIndex);
        }
        
        ctx.textAlign = 'left';
        ctx.restore();
    }
    
    /**
     * Renderiza una carta individual
     */
    renderCard(ctx, card, x, y, scale, isHovered) {
        ctx.save();
        
        // Transformar para escala
        const centerX = x + this.cardWidth / 2;
        const centerY = y + this.cardHeight / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
        
        // Sombra
        if (isHovered) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = this.colors.cardHover;
        }
        
        // Fondo de la carta
        ctx.fillStyle = this.colors.cardBg;
        this.roundRect(ctx, x, y, this.cardWidth, this.cardHeight, this.cardRadius, true, false);
        
        // Borde
        ctx.strokeStyle = isHovered ? this.colors.cardHover : this.colors.cardBorder;
        ctx.lineWidth = isHovered ? 4 : 2;
        this.roundRect(ctx, x, y, this.cardWidth, this.cardHeight, this.cardRadius, false, true);
        
        // Banda de rareza
        const rarityColor = this.colors[`rarity${card.rarity}`] || this.colors.rarityCommon;
        ctx.fillStyle = rarityColor;
        this.roundRect(ctx, x, y, this.cardWidth, 40, this.cardRadius, true, false);
        
        // Nombre de la carta
        ctx.fillStyle = this.colors.textPrimary;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(card.name, x + this.cardWidth / 2, y + 27);
        
        // Icono (simple emoji por ahora)
        ctx.font = '64px Arial';
        ctx.fillText(card.icon, x + this.cardWidth / 2, y + 120);
        
        // Descripción
        ctx.font = '14px Arial';
        ctx.fillStyle = this.colors.textSecondary;
        const lines = this.wrapText(card.description, this.cardWidth - 20);
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x + this.cardWidth / 2, y + 160 + i * 20);
        }
        
        // Valor del upgrade
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = card.valueColor || '#00ff00';
        ctx.fillText(card.value, x + this.cardWidth / 2, y + this.cardHeight - 30);
        
        ctx.textAlign = 'left';
        ctx.restore();
    }
    
    /**
     * Divide texto en líneas para que quepa en el ancho especificado
     */
    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            if (testLine.length * 8 > maxWidth) {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) lines.push(currentLine);
        return lines;
    }
    
    /**
     * Dibuja un rectángulo con bordes redondeados
     */
    roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }
    
    /**
     * Maneja clic en el selector de cartas
     */
    handleCardClick(mouseX, mouseY) {
        if (!this.showCardSelection) return null;
        
        const totalWidth = this.availableCards.length * (this.cardWidth + this.cardSpacing) - this.cardSpacing;
        const startX = (this.width - totalWidth) / 2;
        const startY = 220;
        
        for (let i = 0; i < this.availableCards.length; i++) {
            const x = startX + i * (this.cardWidth + this.cardSpacing);
            const y = startY + (i === this.cardHoverIndex ? -20 : 0);
            
            if (mouseX >= x && mouseX <= x + this.cardWidth &&
                mouseY >= y && mouseY <= y + this.cardHeight) {
                return this.availableCards[i];
            }
        }
        
        return null;
    }
    
    /**
     * Maneja movimiento del mouse sobre las cartas
     */
    handleCardHover(mouseX, mouseY) {
        if (!this.showCardSelection) {
            this.cardHoverIndex = -1;
            return;
        }
        
        const totalWidth = this.availableCards.length * (this.cardWidth + this.cardSpacing) - this.cardSpacing;
        const startX = (this.width - totalWidth) / 2;
        const startY = 220;
        
        let foundHover = false;
        for (let i = 0; i < this.availableCards.length; i++) {
            const x = startX + i * (this.cardWidth + this.cardSpacing);
            const y = startY;
            
            if (mouseX >= x && mouseX <= x + this.cardWidth &&
                mouseY >= y && mouseY <= y + this.cardHeight) {
                this.cardHoverIndex = i;
                this.hoverTargetScale = 1.1;
                foundHover = true;
                break;
            }
        }
        
        if (!foundHover) {
            this.cardHoverIndex = -1;
            this.hoverTargetScale = 1.0;
        }
    }
    
    /**
     * Muestra el selector de cartas con las opciones dadas
     */
    showCards(cards) {
        this.availableCards = cards;
        this.showCardSelection = true;
        this.cardHoverIndex = -1;
    }
    
    /**
     * Oculta el selector de cartas
     */
    hideCards() {
        this.showCardSelection = false;
        this.availableCards = [];
        this.cardHoverIndex = -1;
    }
}
