/**
 * CardSystem - Sistema de cartas roguelike para upgrades
 */
export class CardSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        // Biblioteca de cartas disponibles
        this.cardLibrary = [
            // Daño
            {
                id: 'damage_1',
                name: 'Fuego Oscuro',
                description: 'Aumenta el daño de tus proyectiles',
                icon: '🔥',
                rarity: 'Common',
                type: 'damage',
                value: '+5 Daño',
                valueColor: '#ff6600',
                effect: (player) => {
                    player.damage += 5;
                }
            },
            {
                id: 'damage_2',
                name: 'Llamas Infernales',
                description: 'Gran aumento de daño',
                icon: '💥',
                rarity: 'Rare',
                type: 'damage',
                value: '+15 Daño',
                valueColor: '#ff0000',
                effect: (player) => {
                    player.damage += 15;
                }
            },
            
            // Capacidad de ejército
            {
                id: 'army_1',
                name: 'Llamado Espectral',
                description: 'Aumenta tu capacidad de ejército',
                icon: '👻',
                rarity: 'Common',
                type: 'army',
                value: '+3 Aliados',
                valueColor: '#00ffff',
                effect: (player) => {
                    player.baseArmyCapacity += 3;
                    player.updateArmyCapacity();
                }
            },
            {
                id: 'army_2',
                name: 'Legión de Sombras',
                description: 'Gran aumento de capacidad de ejército',
                icon: '👥',
                rarity: 'Epic',
                type: 'army',
                value: '+8 Aliados',
                valueColor: '#00aaff',
                effect: (player) => {
                    player.baseArmyCapacity += 8;
                    player.updateArmyCapacity();
                }
            },
            
            // Vida
            {
                id: 'health_1',
                name: 'Vigor Necrótico',
                description: 'Aumenta tu vida máxima',
                icon: '❤️',
                rarity: 'Common',
                type: 'health',
                value: '+25 Vida',
                valueColor: '#00ff00',
                effect: (player) => {
                    player.maxHealth += 25;
                    player.health = Math.min(player.health + 25, player.maxHealth);
                }
            },
            {
                id: 'health_2',
                name: 'Esencia Vital',
                description: 'Restaura y aumenta vida',
                icon: '💚',
                rarity: 'Rare',
                type: 'health',
                value: '+50 Vida',
                valueColor: '#00ff00',
                effect: (player) => {
                    player.maxHealth += 50;
                    player.health = player.maxHealth; // Curación completa
                }
            },
            
            // Velocidad de ataque
            {
                id: 'speed_1',
                name: 'Frenesí',
                description: 'Aumenta velocidad de ataque',
                icon: '⚡',
                rarity: 'Common',
                type: 'attackSpeed',
                value: '+20% Velocidad',
                valueColor: '#ffff00',
                effect: (player) => {
                    player.attackSpeed *= 0.8; // Reduce cooldown en 20%
                }
            },
            {
                id: 'speed_2',
                name: 'Tormenta Arcana',
                description: 'Gran aumento de velocidad de ataque',
                icon: '⚡⚡',
                rarity: 'Epic',
                type: 'attackSpeed',
                value: '+40% Velocidad',
                valueColor: '#ffaa00',
                effect: (player) => {
                    player.attackSpeed *= 0.6; // Reduce cooldown en 40%
                }
            },
            
            // Movimiento
            {
                id: 'move_1',
                name: 'Paso Fantasma',
                description: 'Aumenta velocidad de movimiento',
                icon: '💨',
                rarity: 'Common',
                type: 'movement',
                value: '+15% Velocidad',
                valueColor: '#aaaaff',
                effect: (player) => {
                    player.speed *= 1.15;
                }
            },
            {
                id: 'move_2',
                name: 'Viento Espectral',
                description: 'Gran aumento de velocidad',
                icon: '🌪️',
                rarity: 'Rare',
                type: 'movement',
                value: '+30% Velocidad',
                valueColor: '#8888ff',
                effect: (player) => {
                    player.speed *= 1.30;
                }
            },
            
            // Especiales
            {
                id: 'special_1',
                name: 'Cosecha de Almas',
                description: 'Los enemigos dan más puntos',
                icon: '✨',
                rarity: 'Epic',
                type: 'special',
                value: '+50% Puntos',
                valueColor: '#bd00ff',
                effect: (player) => {
                    player.pointsMultiplier = (player.pointsMultiplier || 1.0) * 1.5;
                }
            },
            {
                id: 'special_2',
                name: 'Regeneración',
                description: 'Regenera vida con el tiempo',
                icon: '🔋',
                rarity: 'Legendary',
                type: 'special',
                value: '+2 Vida/seg',
                valueColor: '#f39c12',
                effect: (player) => {
                    player.healthRegen = (player.healthRegen || 0) + 2;
                }
            },
            {
                id: 'special_3',
                name: 'Poder Definitivo',
                description: 'Mejora múltiples stats',
                icon: '👑',
                rarity: 'Legendary',
                type: 'special',
                value: 'Todo +10%',
                valueColor: '#ffd700',
                effect: (player) => {
                    player.damage = Math.floor(player.damage * 1.1);
                    player.maxHealth = Math.floor(player.maxHealth * 1.1);
                    player.speed *= 1.1;
                    player.attackSpeed *= 0.9;
                    player.baseArmyCapacity += 2;
                    player.updateArmyCapacity();
                }
            },
            
            // === NUEVAS CARTAS EVOLUTIVAS (FASE B+C) ===
            {
                id: 'healing_unlock',
                name: 'Despertar Sangriento',
                description: 'Desbloquea tu aura de curación para aliados',
                icon: '🩸',
                rarity: 'Epic',
                type: 'special',
                value: 'Aura Desbloqueada',
                valueColor: '#ff00ff',
                conditions: (player) => !player.hasHealingUnlocked, // Solo aparece si no está desbloqueada
                effect: (player) => {
                    player.hasHealingUnlocked = true;
                    console.log('✨ Aura de curación desbloqueada');
                }
            },
            {
                id: 'healing_range',
                name: 'Vínculo Vital',
                description: 'Expande el rango de tu aura de curación',
                icon: '💜',
                rarity: 'Rare',
                type: 'special',
                value: '+40 Rango',
                valueColor: '#ff00ff',
                conditions: (player) => player.hasHealingUnlocked, // Solo aparece si aura está desbloqueada
                effect: (player) => {
                    // La fórmula del aura es: 80 + (maxHealth * 0.5) + bonificación
                    if (!player.healingAuraBonus) player.healingAuraBonus = 0;
                    player.healingAuraBonus += 40;
                    console.log('💜 Rango del aura expandido');
                }
            },
            {
                id: 'master_souls',
                name: 'Maestro de Almas',
                description: 'Aumenta tu capacidad de invocación',
                icon: '⚜️',
                rarity: 'Epic',
                type: 'army',
                value: '+2 Aliados',
                valueColor: '#00ffff',
                effect: (player) => {
                    player.baseArmyCapacity += 2;
                    player.updateArmyCapacity();
                    console.log('⚜️ Capacidad de ejército aumentada');
                }
            }
        ];
        
        // Probabilidades de rareza
        this.rarityWeights = {
            Common: 60,
            Rare: 25,
            Epic: 12,
            Legendary: 3
        };
    }
    
    /**
     * Genera cartas aleatorias para el nivel actual
     */
    generateCards(count, playerLevel, player = null) {
        const cards = [];
        const usedIds = new Set();
        
        // Aumentar probabilidad de raras con el nivel
        const adjustedWeights = { ...this.rarityWeights };
        if (playerLevel >= 5) {
            adjustedWeights.Common = 45;
            adjustedWeights.Rare = 35;
            adjustedWeights.Epic = 15;
            adjustedWeights.Legendary = 5;
        }
        if (playerLevel >= 10) {
            adjustedWeights.Common = 30;
            adjustedWeights.Rare = 40;
            adjustedWeights.Epic = 20;
            adjustedWeights.Legendary = 10;
        }
        
        while (cards.length < count) {
            const rarity = this.selectRarity(adjustedWeights);
            const availableCards = this.cardLibrary.filter(c => {
                const notUsed = !usedIds.has(c.id);
                const matchesRarity = c.rarity === rarity;
                // Verificar condiciones si existen
                const conditionsMet = !c.conditions || (player && c.conditions(player));
                return notUsed && matchesRarity && conditionsMet;
            });
            
            if (availableCards.length > 0) {
                const card = availableCards[Math.floor(Math.random() * availableCards.length)];
                cards.push({ ...card }); // Copiar carta
                usedIds.add(card.id);
            } else {
                // Si no hay cartas disponibles (todas tienen condiciones no cumplidas), romper el bucle
                break;
            }
        }
        
        return cards;
    }
    
    /**
     * Selecciona una rareza basada en los pesos
     */
    selectRarity(weights) {
        const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
        let random = Math.random() * total;
        
        for (const [rarity, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return rarity;
            }
        }
        
        return 'Common'; // Fallback
    }
    
    /**
     * Aplica el efecto de una carta al jugador
     */
    applyCard(card, player) {
        if (!player) return;

        // Evitar aplicar la misma carta dos veces
        if (!player.appliedCards) player.appliedCards = new Set();
        if (player.appliedCards.has(card.id)) {
            // Ya aplicada, ignorar
            return;
        }

        if (card.effect) {
            card.effect(player);
        }
        
        // Marcar como aplicada
        player.appliedCards.add(card.id);

        // Emitir evento de carta aplicada
        if (this.eventBus) this.eventBus.emit('CARD_APPLIED', { card, player });
    }
}
