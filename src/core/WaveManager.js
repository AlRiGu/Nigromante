import { Enemy } from '../entities/Enemy.js';

/**
 * WaveManager - Sistema de oleadas de enemigos
 */
export class WaveManager {
    constructor(bounds, eventBus) {
        this.bounds = bounds;
        this.eventBus = eventBus;
        
        this.currentWave = 0;
        this.enemiesPerWave = 5;
        this.waveMultiplier = 1.3;
        this.timeBetweenWaves = 5; // segundos
        this.timeUntilNextWave = 3; // Iniciar primera oleada en 3 segundos
        this.waveInProgress = false;
        this.enemiesSpawnedThisWave = 0;
        this.enemiesToSpawn = 0;
    }

    /**
     * Actualiza el wave manager
     * @param {number} deltaTime - Delta time
     * @param {Array} enemies - Array de enemigos actuales
     */
    update(deltaTime, enemies) {
        this.timeUntilNextWave -= deltaTime;
        
        // Iniciar nueva oleada
        if (!this.waveInProgress && this.timeUntilNextWave <= 0) {
            this.startWave();
        }
        
        // Verificar si la oleada terminó
        if (this.waveInProgress && enemies.length === 0 && this.enemiesSpawnedThisWave >= this.enemiesToSpawn) {
            this.endWave();
        }
    }

    /**
     * Inicia una nueva oleada
     */
    startWave() {
        this.currentWave++;
        this.waveInProgress = true;
        this.enemiesSpawnedThisWave = 0;
        this.enemiesToSpawn = Math.floor(this.enemiesPerWave * Math.pow(this.waveMultiplier, this.currentWave - 1));
        
        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('wave_started', {
                wave: this.currentWave,
                enemyCount: this.enemiesToSpawn
            });
        }
        
        console.log(`🌊 Oleada ${this.currentWave} - ${this.enemiesToSpawn} enemigos`);
    }

    /**
     * Finaliza la oleada actual
     */
    endWave() {
        this.waveInProgress = false;
        this.timeUntilNextWave = this.timeBetweenWaves;
        
        // Emitir evento
        if (this.eventBus) {
            this.eventBus.emit('wave_completed', {
                wave: this.currentWave
            });
        }
        
        console.log(`✅ Oleada ${this.currentWave} completada`);
    }

    /**
     * Genera un enemigo si es necesario
     * @param {Array} enemies - Array donde agregar el enemigo
     * @param {Player} player - Target para el enemigo
     * @returns {boolean} - true si se generó un enemigo
     */
    spawnEnemy(enemies, player) {
        if (!this.waveInProgress || this.enemiesSpawnedThisWave >= this.enemiesToSpawn) {
            return false;
        }
        
        // Generar enemigo en un borde aleatorio del mapa
        const spawnPos = this.getRandomSpawnPosition();
        
        // Determinar tipo de enemigo según la oleada
        const type = this.getEnemyTypeForWave();
        
        const enemy = new Enemy(spawnPos.x, spawnPos.y, type);
        enemy.setTarget(player);
        
        enemies.push(enemy);
        this.enemiesSpawnedThisWave++;
        
        return true;
    }

    /**
     * Obtiene una posición de spawn aleatoria en los bordes
     * @returns {{x: number, y: number}}
     */
    getRandomSpawnPosition() {
        const side = Math.floor(Math.random() * 4); // 0: arriba, 1: derecha, 2: abajo, 3: izquierda
        const padding = 20;
        
        let x, y;
        
        switch (side) {
            case 0: // Arriba
                x = Math.random() * this.bounds.width;
                y = -padding;
                break;
            case 1: // Derecha
                x = this.bounds.width + padding;
                y = Math.random() * this.bounds.height;
                break;
            case 2: // Abajo
                x = Math.random() * this.bounds.width;
                y = this.bounds.height + padding;
                break;
            case 3: // Izquierda
                x = -padding;
                y = Math.random() * this.bounds.height;
                break;
        }
        
        return { x, y };
    }

    /**
     * Determina el tipo de enemigo a generar según la oleada
     * Tipos: warrior, tank, shaman, assassin
     * @returns {string} - Tipo de enemigo
     */
    getEnemyTypeForWave() {
        const roll = Math.random();
        
        // Oleadas tempranas: solo guerreros
        if (this.currentWave <= 2) {
            return 'warrior';
        } 
        // Oleadas 3-5: guerreros y asesinos
        else if (this.currentWave <= 5) {
            if (roll < 0.6) return 'warrior';
            return 'assassin';
        } 
        // Oleadas 6-8: introducir chamanes
        else if (this.currentWave <= 8) {
            if (roll < 0.4) return 'warrior';
            if (roll < 0.7) return 'assassin';
            return 'shaman';
        } 
        // Oleadas 9+: todos los tipos incluido tanques
        else {
            if (roll < 0.3) return 'warrior';
            if (roll < 0.5) return 'assassin';
            if (roll < 0.75) return 'shaman';
            return 'tank';
        }
    }

    /**
     * Obtiene el tiempo restante hasta la próxima oleada
     * @returns {number}
     */
    getTimeUntilNextWave() {
        return Math.max(0, this.timeUntilNextWave);
    }
}
