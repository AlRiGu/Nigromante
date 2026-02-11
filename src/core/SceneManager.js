/**
 * SceneManager - Sistema de gestión de escenas
 * Maneja transiciones entre MenuScene, GameScene y GameOverScene
 */
export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        if (!this.ctx) {
            throw new Error('No se pudo obtener el contexto 2D del canvas');
        }
        
        // Escenas registradas
        this.scenes = new Map();
        this.currentScene = null;
        this.nextScene = null;
        
        // Estado del loop
        this.running = false;
        this.lastTime = 0;
        
        // Transición (opcional para el futuro)
        this.transitioning = false;
        this.transitionDuration = 0.3; // segundos
        this.transitionProgress = 0;
    }
    
    /**
     * Registra una escena
     * @param {string} name - Nombre de la escena
     * @param {Scene} scene - Instancia de la escena
     */
    registerScene(name, scene) {
        scene.sceneManager = this;
        scene.canvas = this.canvas;
        scene.ctx = this.ctx;
        scene.width = this.width;
        scene.height = this.height;
        this.scenes.set(name, scene);
    }
    
    /**
     * Cambia a una escena específica
     * @param {string} name - Nombre de la escena
     * @param {Object} data - Datos a pasar a la escena
     */
    switchTo(name, data = {}) {
        const scene = this.scenes.get(name);
        
        if (!scene) {
            console.error(`Escena '${name}' no encontrada`);
            return;
        }
        
        // Salir de la escena actual
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        // Entrar a la nueva escena
        this.currentScene = scene;
        this.currentScene.enter(data);
        
        console.log(`📺 Cambio a escena: ${name}`);
    }
    
    /**
     * Inicia el game loop
     */
    start() {
        if (this.running) return;
        
        this.running = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }
    
    /**
     * Detiene el game loop
     */
    stop() {
        this.running = false;
    }
    
    /**
     * Pausa el loop temporalmente (para escenas que manejan su propio loop)
     */
    pauseLoop() {
        if (!this.running) return;
        this.running = false;
        console.log('⏸️ SceneManager loop pausado');
    }
    
    /**
     * Reanuda el loop
     */
    resumeLoop() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
        console.log('▶️ SceneManager loop reanudado');
    }
    
    /**
     * Loop principal
     */
    loop(currentTime) {
        if (!this.running) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Actualizar y renderizar la escena actual
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
            this.currentScene.render();
        }
        
        // Continuar el loop
        requestAnimationFrame((time) => this.loop(time));
    }
    
    /**
     * Obtiene la escena actual
     */
    getCurrentScene() {
        return this.currentScene;
    }
}

/**
 * Scene - Clase base para todas las escenas
 */
export class Scene {
    constructor() {
        this.sceneManager = null;
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
    }
    
    /**
     * Se llama cuando se entra a la escena
     * @param {Object} data - Datos pasados desde otra escena
     */
    enter(data = {}) {
        // Override en clases hijas
    }
    
    /**
     * Se llama cuando se sale de la escena
     */
    exit() {
        // Override en clases hijas
    }
    
    /**
     * Actualiza la lógica de la escena
     * @param {number} deltaTime - Delta time en segundos
     */
    update(deltaTime) {
        // Override en clases hijas
    }
    
    /**
     * Renderiza la escena
     */
    render() {
        // Override en clases hijas
    }
}
