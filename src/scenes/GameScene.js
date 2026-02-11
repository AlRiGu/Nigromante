import { Scene } from '../core/SceneManager.js';
import { Game } from '../core/Game.js';

/**
 * GameScene - Escena del juego principal
 * Envuelve la clase Game existente
 */
export class GameScene extends Scene {
    constructor() {
        super();
        this.game = null;
    }
    
    enter(data = {}) {
        console.log('🎮 Iniciando partida...');
        
        // CRÍTICO: Pausar el loop del SceneManager para evitar double loop
        // GameScene usa su propio RAF interno, no necesita el de SceneManager
        this.sceneManager.pauseLoop();
        
        // Crear una nueva instancia del juego
        this.game = new Game(this.canvas);
        
        // Setup listener para game over
        this.game.eventBus.on('game_over', (gameOverData) => {
            this.handleGameOver(gameOverData);
        });
        
        // Iniciar el juego
        this.game.start();
    }
    
    exit() {
        console.log('👋 Saliendo del juego...');
        
        // Detener y limpiar el juego
        if (this.game) {
            this.game.stop();
            this.game.destroy();
            this.game = null;
        }
        
        // Reanudar el loop del SceneManager para otras escenas
        this.sceneManager.resumeLoop();
    }
    
    handleGameOver(data) {
        console.log('💀 Juego terminado, cambiando a Game Over...');
        
        // Detener el juego pero mantener los datos
        if (this.game) {
            this.game.stop();
            
            // Preparar datos para GameOverScene
            const stats = {
                level: this.game.player.level,
                kills: this.game.player.points, // Usar puntos como kills
                armySize: this.game.army.length,
                wave: this.game.waveManager.currentWave,
                playerHealth: this.game.player.health
            };
            
            // Cambiar a escena de Game Over
            this.sceneManager.switchTo('gameover', stats);
        }
    }
    
    update(deltaTime) {
        // El game maneja su propio update desde su loop interno
        // No hacemos nada aquí porque Game tiene su propio requestAnimationFrame
    }
    
    render() {
        // El game maneja su propio render desde su loop interno
        // No hacemos nada aquí porque Game tiene su propio requestAnimationFrame
    }
}
