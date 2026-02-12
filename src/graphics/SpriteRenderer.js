/**
 * SpriteRenderer - Sistema de renderizado de sprites complejos
 * Genera gráficos detallados usando Canvas API
 */
export class SpriteRenderer {
    /**
     * Renderiza el sprite del Nigromante (jugador)
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} width - Ancho
     * @param {number} height - Alto
     * @param {number} time - Tiempo para animaciones (opcional)
     * @param {Object} cache - Cache para gradientes (reservado para optimización futura)
     */
    static renderNigromante(ctx, x, y, width, height, time = 0, cache = null) {
        // Validaciones críticas
        if (!ctx || width <= 0 || height <= 0) return;
        time = Number(time) || 0;
        
        // TODO: Implementar gradient caching completo requiere refactoring a coordenadas relativas
        // Ver Issue #PERFORMANCE-1: Gradient Caching (+25% FPS potential)
        
        ctx.save();
        
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // === AURA MÁGICA OSCURA ===
        const auraRadius = width * 1.5;
        const auraGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, auraRadius
        );
        auraGradient.addColorStop(0, 'rgba(138, 0, 255, 0.3)'); // Púrpura oscuro
        auraGradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.2)'); // Índigo
        auraGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // === PARTÍCULAS DE ENERGÍA FLOTANTES ===
        const pulseOffset = Math.sin(time * 2) * 3;
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI / 2) + time * 0.5;
            const particleX = centerX + Math.cos(angle) * (width * 0.7);
            const particleY = centerY + Math.sin(angle) * (width * 0.7) + pulseOffset;
            const particleSize = 2 + Math.sin(time * 3 + i) * 1;
            
            ctx.fillStyle = 'rgba(138, 0, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // === SOMBRA BAJO EL PERSONAJE ===
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(centerX, y + height, width * 0.4, height * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // === TÚNICA (CAPA OSCURA) ===
        const capeGradient = ctx.createLinearGradient(x, y, x, y + height);
        capeGradient.addColorStop(0, '#1a0033'); // Púrpura muy oscuro
        capeGradient.addColorStop(0.5, '#0d001a'); // Negro púrpura
        capeGradient.addColorStop(1, '#000000'); // Negro
        
        ctx.fillStyle = capeGradient;
        ctx.beginPath();
        // Forma de túnica (trapecio redondeado)
        ctx.moveTo(x + width * 0.3, y);
        ctx.lineTo(x + width * 0.7, y);
        ctx.quadraticCurveTo(x + width, y + height * 0.3, x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.quadraticCurveTo(x, y + height * 0.3, x + width * 0.3, y);
        ctx.fill();
        
        // Borde de la túnica (detalle)
        ctx.strokeStyle = '#4a0080';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // === CAPUCHA ===
        ctx.fillStyle = '#0a0014';
        ctx.beginPath();
        ctx.ellipse(centerX, y + height * 0.25, width * 0.35, height * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Sombra interior de la capucha
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(centerX, y + height * 0.27, width * 0.25, height * 0.18, 0, 0, Math.PI);
        ctx.fill();
        
        // === OJOS BRILLANTES (CIAN MÁGICO) ===
        const eyeY = y + height * 0.25;
        const eyeGlow = 4 + Math.sin(time * 4) * 1;
        
        // Resplandor de ojos
        ctx.shadowBlur = eyeGlow;
        ctx.shadowColor = '#00ffff';
        
        // Ojo izquierdo
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(centerX - width * 0.15, eyeY, width * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Ojo derecho
        ctx.beginPath();
        ctx.arc(centerX + width * 0.15, eyeY, width * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // === BÁCULO MÁGICO ===
        const staffX = x + width * 0.9;
        const staffTopY = y + height * 0.1;
        const staffBottomY = y + height * 0.95;
        
        // Palo del báculo
        ctx.strokeStyle = '#3d2814'; // Marrón oscuro
        ctx.lineWidth = width * 0.08;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(staffX, staffTopY + height * 0.15);
        ctx.lineTo(staffX, staffBottomY);
        ctx.stroke();
        
        // Orbe mágico en la punta (pulsante)
        const orbSize = width * 0.15;
        const orbPulse = 1 + Math.sin(time * 3) * 0.2;
        
        // Resplandor del orbe
        const orbGradient = ctx.createRadialGradient(
            staffX, staffTopY, 0,
            staffX, staffTopY, orbSize * orbPulse * 2
        );
        orbGradient.addColorStop(0, 'rgba(138, 0, 255, 0.8)');
        orbGradient.addColorStop(0.5, 'rgba(138, 0, 255, 0.4)');
        orbGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(staffX, staffTopY, orbSize * orbPulse * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Orbe sólido
        ctx.fillStyle = '#8a00ff';
        ctx.beginPath();
        ctx.arc(staffX, staffTopY, orbSize * orbPulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Brillo interno del orbe
        ctx.fillStyle = '#bd00ff';
        ctx.beginPath();
        ctx.arc(staffX - orbSize * 0.3, staffTopY - orbSize * 0.3, orbSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Renderiza el sprite de un Orco (enemigo)
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} width - Ancho
     * @param {number} height - Alto
     * @param {number} time - Tiempo para animaciones (opcional)
     * @param {boolean} isGhost - Si es un fantasma (aplicar filtros)
     * @param {Object} cache - Cache para gradientes (reservado para optimización futura)
     */
    static renderOrc(ctx, x, y, width, height, time = 0, isGhost = false, cache = null, type = 'warrior') {
        // Validaciones críticas
        if (!ctx || width <= 0 || height <= 0) return;
        time = Number(time) || 0;
        isGhost = Boolean(isGhost);
        
        // TODO: Implementar gradient caching completo requiere refactoring a coordenadas relativas
        // Ver Issue #PERFORMANCE-1: Gradient Caching (+25% FPS potential)
        
        ctx.save();
        
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // === CONFIGURACIÓN DE FANTASMA ===
        if (isGhost) {
            // Transparencia para efecto fantasmal (visible pero espectral)
            ctx.globalAlpha = 0.85;
            
            // Efecto de parpadeo muy sutil
            const flicker = 0.90 + Math.sin(time * 4) * 0.05;
            ctx.globalAlpha *= flicker;
        }
        
        // === SOMBRA ===
        if (!isGhost) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(centerX, y + height, width * 0.35, height * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // === CUERPO (TORSO MUSCULOSO) ===
        // FASE C: Colores según el tipo (Ref: imágenes de referencia)
        let skinColor, skinDark, skinLight;
        
        if (isGhost) {
            skinColor = '#00ffff';
            skinDark = '#00ccff';
            skinLight = '#6600ff';
        } else {
            switch(type) {
                case 'tank':
                    // Ref image_b887fa.jpg: Orco masivo verde oscuro con armadura pesada
                    skinColor = '#1a3d0f';  // Verde muy oscuro, casi negro
                    skinDark = '#0f2a08';
                    skinLight = '#254d18';
                    break;
                case 'shaman':
                    // Ref image_b88bf9.jpg: Orco con túnica, piel verdosa normal
                    skinColor = '#4a6b35';  // Verde parduzco natural
                    skinDark = '#3a5b25';
                    skinLight = '#5a7b45';
                    break;
                case 'assassin':
                    // Ref image_b8de8d.jpg: Orco encorvado, piel pálida gris-verde
                    skinColor = '#6b7a5c';  // Verde pálido grisáceo
                    skinDark = '#5b6a4c';
                    skinLight = '#7b8a6c';
                    break;
                default: // warrior
                    skinColor = '#4a7832';  // Verde estándar
                    skinDark = '#3d6629';
                    skinLight = '#568a3d';
            }
        }
        
        const skinGradient = ctx.createLinearGradient(x, y, x + width, y);
        
        if (isGhost) {
            skinGradient.addColorStop(0, '#00ccff');
            skinGradient.addColorStop(0.5, '#0099ff');
            skinGradient.addColorStop(1, '#6600ff');
        } else {
            skinGradient.addColorStop(0, skinDark);
            skinGradient.addColorStop(0.5, skinColor);
            skinGradient.addColorStop(1, skinLight);
        }
        
        ctx.fillStyle = skinGradient;
        ctx.fillRect(x + width * 0.15, y + height * 0.35, width * 0.7, height * 0.55);
        
        // Músculos (detalles)
        ctx.strokeStyle = isGhost ? 'rgba(0, 200, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, y + height * 0.4);
        ctx.lineTo(centerX, y + height * 0.8);
        ctx.stroke();
        
        // === CABEZA ===
        const headGradient = ctx.createRadialGradient(
            centerX, y + height * 0.2, 0,
            centerX, y + height * 0.2, width * 0.35
        );
        
        if (isGhost) {
            headGradient.addColorStop(0, '#33ddff');
            headGradient.addColorStop(1, '#0088ff');
        } else {
            headGradient.addColorStop(0, '#527a3a');
            headGradient.addColorStop(1, '#3d6629');
        }
        
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, y + height * 0.22, width * 0.35, height * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Mandíbula prominente
        ctx.fillStyle = isGhost ? '#0099ff' : '#3d6629';
        ctx.beginPath();
        ctx.moveTo(centerX - width * 0.25, y + height * 0.3);
        ctx.quadraticCurveTo(centerX, y + height * 0.4, centerX + width * 0.25, y + height * 0.3);
        ctx.quadraticCurveTo(centerX + width * 0.15, y + height * 0.35, centerX, y + height * 0.37);
        ctx.quadraticCurveTo(centerX - width * 0.15, y + height * 0.35, centerX - width * 0.25, y + height * 0.3);
        ctx.fill();
        
        // === COLMILLOS ===
        ctx.fillStyle = isGhost ? '#aaffff' : '#ffffff';
        // Colmillo izquierdo
        ctx.beginPath();
        ctx.moveTo(centerX - width * 0.1, y + height * 0.32);
        ctx.lineTo(centerX - width * 0.08, y + height * 0.38);
        ctx.lineTo(centerX - width * 0.12, y + height * 0.38);
        ctx.fill();
        // Colmillo derecho
        ctx.beginPath();
        ctx.moveTo(centerX + width * 0.1, y + height * 0.32);
        ctx.lineTo(centerX + width * 0.08, y + height * 0.38);
        ctx.lineTo(centerX + width * 0.12, y + height * 0.38);
        ctx.fill();
        
        // === OJOS ===
        const eyeColor = isGhost ? '#ffffff' : '#ffff00';
        
        // OPTIMIZACIÓN: Reemplazar shadowBlur con gradiente (shadowBlur es muy costoso)
        if (isGhost) {
            // Efecto de glow usando gradiente en lugar de shadowBlur
            const glowIntensity = 0.7 + Math.sin(time * 5) * 0.3;
            
            // Glow ojo izquierdo
            const glowLeft = ctx.createRadialGradient(
                centerX - width * 0.125, y + height * 0.21, 0,
                centerX - width * 0.125, y + height * 0.21, width * 0.2
            );
            glowLeft.addColorStop(0, `rgba(0, 255, 255, ${glowIntensity})`);
            glowLeft.addColorStop(0.5, `rgba(0, 255, 255, ${glowIntensity * 0.5})`);
            glowLeft.addColorStop(1, 'transparent');
            
            ctx.fillStyle = glowLeft;
            ctx.beginPath();
            ctx.arc(centerX - width * 0.125, y + height * 0.21, width * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Glow ojo derecho
            const glowRight = ctx.createRadialGradient(
                centerX + width * 0.125, y + height * 0.21, 0,
                centerX + width * 0.125, y + height * 0.21, width * 0.2
            );
            glowRight.addColorStop(0, `rgba(0, 255, 255, ${glowIntensity})`);
            glowRight.addColorStop(0.5, `rgba(0, 255, 255, ${glowIntensity * 0.5})`);
            glowRight.addColorStop(1, 'transparent');
            
            ctx.fillStyle = glowRight;
            ctx.beginPath();
            ctx.arc(centerX + width * 0.125, y + height * 0.21, width * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = eyeColor;
        // Ojo izquierdo
        ctx.fillRect(centerX - width * 0.2, y + height * 0.15, width * 0.15, height * 0.12);
        // Ojo derecho
        ctx.fillRect(centerX + width * 0.05, y + height * 0.15, width * 0.15, height * 0.12);
        
        // Pupilas rojas
        ctx.fillStyle = isGhost ? '#ff00ff' : '#ff0000';
        ctx.fillRect(centerX - width * 0.15, y + height * 0.17, width * 0.08, height * 0.08);
        ctx.fillRect(centerX + width * 0.1, y + height * 0.17, width * 0.08, height * 0.08);
        
        ctx.shadowBlur = 0;
        
        // === ARMADURA Y EQUIPO (FASE C: EVOLUCIÓN VISUAL DETALLADA) ===
        if (type === 'shaman') {
            // CHAMÁN: Ref image_b88bf9.jpg - Túnica de pieles, báculo brillante
            const robeColor = isGhost ? 'rgba(100, 120, 140, 0.5)' : '#5d4332';
            const furColor = isGhost ? 'rgba(130, 110, 90, 0.6)' : '#8b6c47';
            
            // Túnica base
            ctx.fillStyle = robeColor;
            ctx.fillRect(x + width * 0.15, y + height * 0.35, width * 0.7, height * 0.6);
            
            // Adornos de piel en hombros 
            ctx.fillStyle = furColor;
            ctx.beginPath();
            ctx.arc(x + width * 0.2, y + height * 0.42, width * 0.15, 0, Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + width * 0.8, y + height * 0.42, width * 0.15, 0, Math.PI);
            ctx.fill();
            
            // Capucha profunda con cuernos
            ctx.fillStyle = robeColor;
            ctx.beginPath();
            ctx.arc(centerX, y + height * 0.18, width * 0.45, 0, Math.PI);
            ctx.fill();
            
            // Collar de cráneos
            const skullColor = isGhost ? 'rgba(255, 255, 200, 0.8)' : '#e8d5a0';
            ctx.fillStyle = skullColor;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(
                    x + width * (0.25 + i * 0.1), 
                    y + height * 0.48, 
                    width * 0.04, 
                    0, Math.PI * 2
                );
                ctx.fill();
            }
            
            // Símbolo mágico en el pecho (círculo con runas)
            ctx.strokeStyle = isGhost ? 'rgba(255, 100, 255, 0.9)' : '#ff3333';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, y + height * 0.58, width * 0.08, 0, Math.PI * 2);
            ctx.stroke();
            
            // Runas interiores
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(centerX - width * 0.05, y + height * 0.55);
            ctx.lineTo(centerX + width * 0.05, y + height * 0.61);
            ctx.moveTo(centerX + width * 0.05, y + height * 0.55);
            ctx.lineTo(centerX - width * 0.05, y + height * 0.61);
            ctx.stroke();
            
        } else if (type === 'tank') {
            // TANQUE: Ref image_b887fa.jpg - Armadura pesada gris con hombreras masivas y pinchos
            const armorColor = isGhost ? 'rgba(120, 120, 130, 0.6)' : '#4a4a4a';
            const metalDark = isGhost ? 'rgba(80, 80, 90, 0.7)' : '#2a2a2a';
            const metalLight = isGhost ? 'rgba(180, 180, 200, 0.7)' : '#707070';
            
            // HOMBRERAS MASIVAS CON PINCHOS (característica principal)
            ctx.fillStyle = armorColor;
            
            // Hombrera izquierda grande
            ctx.beginPath();
            ctx.arc(x + width * 0.05, y + height * 0.35, width * 0.22, 0, Math.PI * 2);
            ctx.fill();
            
            // Hombrera derecha grande  
            ctx.beginPath();
            ctx.arc(x + width * 0.95, y + height * 0.35, width * 0.22, 0, Math.PI * 2);
            ctx.fill();
            
            // Pinchos en hombreras
            ctx.fillStyle = metalDark;
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                // Pinchos hombrera izquierda
                ctx.beginPath();
                ctx.moveTo(x + width * 0.05, y + height * 0.35);
                ctx.lineTo(
                    x + width * 0.05 + Math.cos(angle) * width * 0.15,
                    y + height * 0.35 + Math.sin(angle) * width * 0.08
                );
                ctx.lineWidth = width * 0.02;
                ctx.stroke();
                
                // Pinchos hombrera derecha
                ctx.beginPath();
                ctx.moveTo(x + width * 0.95, y + height * 0.35);
                ctx.lineTo(
                    x + width * 0.95 + Math.cos(angle) * width * 0.15,
                    y + height * 0.35 + Math.sin(angle) * width * 0.08
                );
                ctx.stroke();
            }
            
            // Peto masivo con placas superpuestas
            ctx.fillStyle = armorColor;
            ctx.fillRect(x + width * 0.1, y + height * 0.4, width * 0.8, height * 0.5);
            
            // Placas superiores del peto
            ctx.fillStyle = metalLight;
            ctx.fillRect(x + width * 0.15, y + height * 0.42, width * 0.7, height * 0.15);
            
            // Placas medias
            ctx.fillStyle = armorColor;
            ctx.fillRect(x + width * 0.12, y + height * 0.58, width * 0.76, height * 0.15);
            
            // REMACHES GRANDES (muy característico)
            ctx.fillStyle = metalDark;
            const rivetSize = width * 0.06;
            const positions = [
                [0.2, 0.45], [0.35, 0.45], [0.5, 0.45], [0.65, 0.45], [0.8, 0.45],
                [0.18, 0.62], [0.32, 0.62], [0.5, 0.62], [0.68, 0.62], [0.82, 0.62],
                [0.25, 0.78], [0.4, 0.78], [0.6, 0.78], [0.75, 0.78]
            ];
            
            positions.forEach(([px, py]) => {
                ctx.beginPath();
                ctx.arc(x + width * px, y + height * py, rivetSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillo en remaches
                ctx.fillStyle = metalLight;
                ctx.beginPath();
                ctx.arc(x + width * px - rivetSize * 0.3, y + height * py - rivetSize * 0.3, rivetSize * 0.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = metalDark;
            });
            
        } else if (type === 'assassin') {
            // ASESINO: Ref image_b8de8d.jpg - Figura encorvada, capucha, ropa oscura ajustada
            const clothColor = isGhost ? 'rgba(40, 40, 50, 0.7)' : '#1a1a1a';
            const leatherColor = isGhost ? 'rgba(60, 50, 40, 0.6)' : '#2d1f14';
            
            // Capa/capucha envolvente (postura encorvada)
            ctx.fillStyle = clothColor;
            ctx.beginPath();
            // Forma asimétrica para simular encorvamiento
            ctx.moveTo(x + width * 0.1, y + height * 0.25);
            ctx.quadraticCurveTo(centerX - width * 0.1, y + height * 0.1, centerX + width * 0.3, y + height * 0.2);
            ctx.quadraticCurveTo(x + width * 0.85, y + height * 0.35, x + width * 0.8, y + height * 0.9);
            ctx.quadraticCurveTo(centerX, y + height * 0.95, x + width * 0.2, y + height * 0.85);
            ctx.quadraticCurveTo(x + width * 0.05, y + height * 0.6, x + width * 0.1, y + height * 0.25);
            ctx.fill();
            
            // Chaleco de cuero ajustado
            ctx.fillStyle = leatherColor;
            ctx.fillRect(x + width * 0.25, y + height * 0.45, width * 0.5, height * 0.35);
            
            // Cinturón con bolsas/dagas
            ctx.fillStyle = leatherColor;
            ctx.fillRect(x + width * 0.15, y + width * 0.65, width * 0.7, height * 0.08);
            
            // Bolsas pequeñas en el cinturón
            ctx.fillStyle = clothColor;
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(
                    x + width * (0.2 + i * 0.15), 
                    y + height * 0.68, 
                    width * 0.08, 
                    height * 0.12
                );
            }
            
            // Vendas/protecciones en brazos
            ctx.fillStyle = isGhost ? 'rgba(80, 80, 90, 0.6)' : '#3a3a3a';
            ctx.fillRect(x + width * 0.05, y + height * 0.5, width * 0.15, height * 0.12);
            ctx.fillRect(x + width * 0.8, y + height * 0.5, width * 0.15, height * 0.12);
            
        } else {
            // GUERRERO: Armadura de cuero estándar (sin cambios)
            const armorColor = isGhost ? 'rgba(100, 150, 200, 0.5)' : '#5a3d2b';
            ctx.fillStyle = armorColor;
            
            // Hombrera izquierda
            ctx.beginPath();
            ctx.arc(x + width * 0.15, y + height * 0.4, width * 0.12, 0, Math.PI * 2);
            ctx.fill();
            
            // Hombrera derecha
            ctx.beginPath();
            ctx.arc(x + width * 0.85, y + height * 0.4, width * 0.12, 0, Math.PI * 2);
            ctx.fill();
            
            // Peto
            ctx.fillRect(x + width * 0.2, y + height * 0.4, width * 0.6, height * 0.35);
            
            // Detalles de la armadura (tachas/remaches)
            ctx.fillStyle = isGhost ? 'rgba(200, 220, 255, 0.7)' : '#3d2814';
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 2; j++) {
                    ctx.beginPath();
                    ctx.arc(
                        x + width * (0.3 + i * 0.2),
                        y + height * (0.45 + j * 0.15),
                        width * 0.03,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        }
        
        // === ARMAS (FASE C: DETALLADAS SEGÚN TIPO) ===
        const weaponColor = isGhost ? 'rgba(150, 200, 255, 0.6)' : '#6b4423';
        const bladeColor = isGhost ? 'rgba(180, 220, 255, 0.7)' : '#8c8c8c';
        
        if (type === 'shaman') {
            // BÁCULO DETALLADO: Ref image_b88bf9.jpg - Báculo con calavera y fuego fatuo
            const staffColor = isGhost ? 'rgba(100, 80, 60, 0.6)' : '#4a3020';
            const gemColor = isGhost ? 'rgba(255, 100, 255, 0.9)' : '#ff3333';
            const gemColorRgba70 = isGhost ? 'rgba(255, 100, 255, 0.7)' : 'rgba(255, 51, 51, 0.7)';
            const gemColorRgba50 = isGhost ? 'rgba(255, 100, 255, 0.5)' : 'rgba(255, 51, 51, 0.5)';
            const gemColorRgba00 = isGhost ? 'rgba(255, 100, 255, 0)' : 'rgba(255, 51, 51, 0)';
            const skullColor = isGhost ? 'rgba(255, 255, 200, 0.8)' : '#e8d5a0';
            
            // Mango del báculo (textura de madera)
            ctx.strokeStyle = staffColor;
            ctx.lineWidth = width * 0.06;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x + width * 0.95, y + height * 0.25);
            ctx.lineTo(x + width * 0.95, y + height * 1.1);
            ctx.stroke();
            
            // Detalles de textura en el mango
            ctx.strokeStyle = isGhost ? 'rgba(70, 50, 40, 0.7)' : '#2a1a10';
            ctx.lineWidth = width * 0.02;
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.moveTo(x + width * 0.92, y + height * (0.3 + i * 0.09));
                ctx.lineTo(x + width * 0.98, y + height * (0.3 + i * 0.09));
                ctx.stroke();
            }
            
            // Calavera en la punta del báculo
            ctx.fillStyle = skullColor;
            ctx.beginPath();
            ctx.ellipse(x + width * 0.95, y + height * 0.2, width * 0.07, width * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Cuencas de la calavera
            ctx.fillStyle = isGhost ? 'rgba(255, 50, 100, 0.8)' : '#aa0000';
            ctx.beginPath();
            ctx.arc(x + width * 0.92, y + height * 0.18, width * 0.02, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + width * 0.98, y + height * 0.18, width * 0.02, 0, Math.PI * 2);
            ctx.fill();
            
            // Fuego fatuo/energía mágica (OPTIMIZADO: Gradiente en lugar de shadowBlur)
            const gemRadius = width * 0.08;
            const glowRadius = gemRadius * 2.5;
            const gemPulse = 1 + Math.sin(time * 3.5) * 0.15;

            const glowGradient = ctx.createRadialGradient(
                x + width * 0.95, y + height * 0.12, 0,
                x + width * 0.95, y + height * 0.12, glowRadius * gemPulse
            );
            glowGradient.addColorStop(0, gemColorRgba70); // 70% alpha
            glowGradient.addColorStop(0.3, gemColorRgba50); // 50% alpha
            glowGradient.addColorStop(1, gemColorRgba00); // 0% alpha

            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x + width * 0.95, y + height * 0.12, glowRadius * gemPulse, 0, Math.PI * 2);
            ctx.fill();

            // Orbe sólido central
            ctx.fillStyle = gemColor;
            ctx.beginPath();
            ctx.arc(x + width * 0.95, y + height * 0.12, gemRadius * gemPulse, 0, Math.PI * 2);
            ctx.fill();
            
            // Llamas espectrales flotando
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = `rgba(255, ${50 + i * 20}, ${100 - i * 30}, ${0.6 - i * 0.1})`;
                ctx.beginPath();
                ctx.arc(
                    x + width * (0.93 + Math.sin(time * 2 + i) * 0.03),
                    y + height * (0.08 + i * 0.03),
                    width * (0.03 - i * 0.008),
                    0, Math.PI * 2
                );
                ctx.fill();
            }
            
        } else if (type === 'tank') {
            // MARTILLO MASIVO: Ref image_b887fa.jpg - Martillo de guerra enorme
            const hammerColor = isGhost ? 'rgba(80, 80, 90, 0.7)' : '#3a3a3a';
            const handleColor = isGhost ? 'rgba(100, 80, 60, 0.6)' : '#5a3d2b';
            const metalColor = isGhost ? 'rgba(120, 120, 140, 0.7)' : '#606060';
            
            // Mango grueso y largo
            ctx.strokeStyle = handleColor;
            ctx.lineWidth = width * 0.08;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x + width * 0.98, y + height * 0.2);
            ctx.lineTo(x + width * 0.98, y + height * 1.0);
            ctx.stroke();
            
            // Envolturas de cuero en el mango
            ctx.strokeStyle = isGhost ? 'rgba(60, 40, 30, 0.7)' : '#2a1a10';
            ctx.lineWidth = width * 0.03;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(x + width * 0.98, y + height * (0.35 + i * 0.12), width * 0.04, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Cabeza del martillo (MASIVA)
            ctx.fillStyle = hammerColor;
            const hammerWidth = width * 0.25;
            const hammerHeight = width * 0.18;
            ctx.fillRect(
                x + width * 0.85 - hammerWidth/2,
                y + height * 0.15 - hammerHeight/2,
                hammerWidth,
                hammerHeight
            );
            
            // Detalles metálicos en la cabeza
            ctx.fillStyle = metalColor;
            ctx.fillRect(
                x + width * 0.85 - hammerWidth/2 + 2,
                y + height * 0.15 - hammerHeight/2 + 2,
                hammerWidth - 4,
                hammerHeight/3
            );
            
            // Pinchos en la cabeza del martillo
            ctx.fillStyle = hammerColor;
            for (let i = 0; i < 7; i++) {
                ctx.beginPath();
                ctx.moveTo(x + width * (0.72 + i * 0.04), y + height * 0.06);
                ctx.lineTo(x + width * (0.73 + i * 0.04), y + height * 0.11);
                ctx.lineTo(x + width * (0.74 + i * 0.04), y + height * 0.06);
                ctx.fill();
            }
            
        } else if (type === 'assassin') {
            // DOS DAGAS
            const daggerColor = isGhost ? 'rgba(180, 220, 255, 0.7)' : '#aaaaaa';
            const handleColor = isGhost ? 'rgba(40, 30, 20, 0.7)' : '#1a1010';
            const wrapColor = isGhost ? 'rgba(80, 60, 40, 0.6)' : '#3a2416';
            
            // Daga mano izquierda
            // Mango
            ctx.strokeStyle = handleColor;
            ctx.lineWidth = width * 0.04;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x - width * 0.05, y + height * 0.6);
            ctx.lineTo(x - width * 0.05, y + height * 0.75);
            ctx.stroke();
            
            ctx.fillStyle = daggerColor;
            ctx.beginPath();
            ctx.moveTo(x - width * 0.1, y + height * 0.5);
            ctx.lineTo(x - width * 0.05, y + height * 0.6);
            ctx.lineTo(x, y + height * 0.55);
            ctx.fill();
            
            // Daga mano derecha 
            // Mango
            ctx.strokeStyle = handleColor;
            ctx.lineWidth = width * 0.04;
            ctx.beginPath();
            ctx.moveTo(x + width * 1.05, y + height * 0.6);
            ctx.lineTo(x + width * 1.05, y + height * 0.75);
            ctx.stroke();
            
            // Hoja
            ctx.fillStyle = daggerColor;
            ctx.beginPath();
            ctx.moveTo(x + width * 1.1, y + height * 0.5);
            ctx.lineTo(x + width * 1.05, y + height * 0.6);
            ctx.lineTo(x + width, y + height * 0.55);
            ctx.fill();
            
            // Envolturas del mango derecho
            ctx.fillStyle = wrapColor;
            ctx.fillRect(x + width * 0.91, y + height * 0.45, width * 0.06, width * 0.02);
            ctx.fillRect(x + width * 0.91, y + height * 0.55, width * 0.06, width * 0.02);
            
            // Efectos de velocidad (trazas de movimiento)
            if (!isGhost) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x + width * 0.02, y + height * 0.27);
                ctx.lineTo(x + width * -0.02, y + height * 0.3);
                ctx.moveTo(x + width * 0.98, y + height * 0.27);
                ctx.lineTo(x + width * 1.02, y + height * 0.3);
                ctx.stroke();
            }
            
        } else {
            // HACHA (Guerrero - original)
            // Mango del hacha
            ctx.strokeStyle = weaponColor;
            ctx.lineWidth = width * 0.08;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x + width * 0.05, y + height * 0.5);
            ctx.lineTo(x + width * 0.05, y + height * 0.95);
            ctx.stroke();
            
            // Hoja del hacha
            ctx.fillStyle = bladeColor;
            ctx.beginPath();
            ctx.moveTo(x - width * 0.05, y + height * 0.45);
            ctx.lineTo(x + width * 0.15, y + height * 0.35);
            ctx.lineTo(x + width * 0.15, y + height * 0.55);
            ctx.fill();
            
            // Borde afilado
            ctx.strokeStyle = isGhost ? '#bbddff' : '#aaaaaa';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // === EFECTO FANTASMA (AURA + BRILLO) ===
        if (isGhost) {
            ctx.globalAlpha = 0.3;
            
            // Aura espectral
            const ghostGradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, width * 1.2
            );
            ghostGradient.addColorStop(0, 'rgba(0, 255, 255, 0.4)');
            ghostGradient.addColorStop(0.5, 'rgba(102, 0, 255, 0.3)');
            ghostGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = ghostGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, width * 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Ondulaciones espectrales
            for (let i = 0; i < 2; i++) {
                const waveOffset = Math.sin(time * 4 + i * Math.PI) * 3;
                ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 - i * 0.1})`;
                ctx.lineWidth = 2;
                ctx.strokeRect(x + waveOffset, y, width, height);
            }
        }
        
        ctx.restore();
    }
}
