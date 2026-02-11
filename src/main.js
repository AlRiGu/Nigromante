import { SceneManager } from './core/SceneManager.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

/**
 * Punto de entrada de la aplicación
 */
function init() {
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('No se pudo encontrar el canvas');
        return;
    }
    
    // Crear el SceneManager
    const sceneManager = new SceneManager(canvas);
    
    // Registrar todas las escenas
    sceneManager.registerScene('menu', new MenuScene());
    sceneManager.registerScene('game', new GameScene());
    sceneManager.registerScene('gameover', new GameOverScene());
    
    // Iniciar con el menú principal
    sceneManager.switchTo('menu');
    sceneManager.start();
    
    // Mensaje de bienvenida
    console.log('%c🎮 Nigromante - El Invocador de las Sombras', 'color: #8b00ff; font-size: 20px; font-weight: bold;');
    console.log('%cControles:', 'color: #00aaff; font-weight: bold;');
    console.log('WASD - Movimiento');
    console.log('ESPACIO - Atacar');
    console.log('%cFase 5: Menú y Flujo de Juego implementado', 'color: #00ff00; font-weight: bold;');
    console.log('%cDesarrollado con Vite + Canvas', 'color: #666; font-style: italic;');
    
    // Exponer sceneManager para debugging
    window.sceneManager = sceneManager;
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
