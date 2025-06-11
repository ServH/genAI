/**
 * GenAI - Motor Principal
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Gameloop principal del juego
 */

class Engine {
    constructor() {
        this.isRunning = false;
        this.animationFrameId = null;
        this.canvas = null;
        this.controls = null;
        
        // Esperar a que todos los módulos estén cargados
        this.waitForModules().then(() => {
            this.init();
        });
    }

    /**
     * Espera a que todos los módulos necesarios estén disponibles
     */
    async waitForModules() {
        const checkModules = () => {
            return window.gameTime && 
                   window.timeStats && 
                   window.eventBus && 
                   window.debugOverlay &&
                   window.EngineControls &&
                   window.EngineCanvas;
        };
        
        while (!checkModules()) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * Inicializa el motor
     */
    init() {
        console.log('Engine: Inicializando motor principal...');
        
        // Configurar canvas
        this.canvas = new EngineCanvas();
        
        // Configurar controles
        this.controls = new EngineControls(this);
        
        // Emitir evento de inicialización
        if (window.eventBus) {
            eventBus.emit('engine:initialized');
        }
        
        console.log('Engine: Motor inicializado correctamente');
        
        // Iniciar automáticamente
        this.start();
    }

    /**
     * Inicia el motor
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop();
            
            console.log('Engine: Motor iniciado');
            
            if (window.eventBus) {
                eventBus.emit('engine:started');
            }
        }
    }

    /**
     * Detiene el motor
     */
    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
            console.log('Engine: Motor detenido');
            
            if (window.eventBus) {
                eventBus.emit('engine:stopped');
            }
        }
    }

    /**
     * Gameloop principal
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        // Actualizar sistemas
        this.updateSystems();
        
        // Renderizar frame
        if (this.canvas) {
            this.canvas.render();
        }
        
        // Programar siguiente frame
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Actualiza todos los sistemas
     */
    updateSystems() {
        // Actualizar tiempo
        if (window.gameTime) {
            gameTime.update();
        }
        
        // Actualizar estadísticas
        if (window.timeStats) {
            timeStats.update();
        }
        
        // Actualizar debug overlay
        if (window.debugOverlay) {
            debugOverlay.update();
        }
    }

    /**
     * Limpia recursos
     */
    destroy() {
        this.stop();
        
        if (this.controls) {
            this.controls.destroy();
        }
        
        console.log('Engine: Destruido');
    }
}

// Crear instancia global
const gameEngine = new Engine();

// Hacer disponible globalmente
window.Engine = Engine;
window.gameEngine = gameEngine; 