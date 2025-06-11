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
        
        // Sistemas de rendering
        this.renderer = null;
        this.camera = null;
        this.background = null;
        this.grid = null;
        this.worldContainer = null;
        
        // Sistema de criaturas
        this.creatureManager = null;
        
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
                   window.timeUtils &&
                   window.eventBus && 
                   window.debugOverlay &&
                   window.EngineControls &&
                   window.EngineCanvas &&
                   window.Renderer &&
                   window.Camera &&
                   window.Background &&
                   window.Grid &&
                   window.Creature &&
                   window.CreatureSprite &&
                   window.CreatureFactory &&
                   window.CreatureManager &&
                   window.Energy &&
                   window.gameEnergy &&
                   window.Resources &&
                   typeof PIXI !== 'undefined';
        };
        
        while (!checkModules()) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * Inicializa el motor
     */
    async init() {
        console.log('Engine: Inicializando motor principal...');
        
        try {
            // Inicializar renderer PixiJS
            this.renderer = new Renderer();
            await this.renderer.init();
            
            // Crear contenedor del mundo
            this.worldContainer = new PIXI.Container();
            this.renderer.getStage().addChild(this.worldContainer);
            
            // Inicializar sistemas de rendering
            this.background = new Background();
            this.background.init(this.renderer.getStage());
            
            this.grid = new Grid();
            this.grid.init(this.worldContainer);
            
            this.camera = new Camera();
            this.camera.setContainer(this.worldContainer);
            
            // Hacer cámara disponible globalmente
            window.gameCamera = this.camera;
            
            // Inicializar sistema de recursos
            this.gameResources = new Resources();
            this.gameResources.init(this.worldContainer, this.camera);
            
            // Hacer recursos disponible globalmente
            window.gameResources = this.gameResources;
            
            // Inicializar sistema de criaturas
            this.creatureManager = new CreatureManager();
            await this.creatureManager.init(this.worldContainer, this.camera);
            
            // Configurar canvas legacy (para compatibilidad)
            this.canvas = new EngineCanvas();
            
            // Configurar controles
            this.controls = new EngineControls(this);
            
            console.log('Engine: Motor inicializado correctamente');
            
            // Emitir evento de inicialización
            if (window.eventBus) {
                eventBus.emit('engine:initialized');
            }
            
            // Iniciar automáticamente
            this.start();
            
        } catch (error) {
            console.error('Engine: Error inicializando:', error);
            throw error;
        }
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
            
            // Obtener deltaTime desde timeUtils
            if (window.timeUtils) {
                const deltaTime = timeUtils.getDeltaTimeSeconds();
                
                // Actualizar cámara
                if (this.camera) {
                    this.camera.update(deltaTime);
                }
                
                // Actualizar recursos
                if (this.gameResources) {
                    this.gameResources.update(deltaTime);
                }
                
                // Actualizar criaturas
                if (this.creatureManager) {
                    this.creatureManager.update(deltaTime);
                }
            }
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
        
        if (this.background) {
            this.background.destroy();
        }
        
        if (this.grid) {
            this.grid.destroy();
        }
        
        if (this.creatureManager) {
            this.creatureManager.destroy();
        }
        
        if (this.gameResources) {
            this.gameResources.destroy();
        }
        
        if (this.renderer) {
            this.renderer.destroy();
        }
        
        console.log('Engine: Destruido');
    }
}

// Crear instancia global
const gameEngine = new Engine();

// Hacer disponible globalmente
window.Engine = Engine;
window.gameEngine = gameEngine; 