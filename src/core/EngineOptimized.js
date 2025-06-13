/**
 * GenAI - Motor Principal Optimizado
 * RAMA PERFORMANCE - Optimización del Motor
 * 
 * Gameloop principal optimizado con sistema de performance
 */

class EngineOptimized {
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
        
        // Sistema de performance
        this.performanceManager = null;
        this.useOptimizedSystems = CONSTANTS.PERFORMANCE.USE_RENDER_TEXTURE;
        
        // Métricas de performance
        this.frameCount = 0;
        this.lastPerformanceCheck = 0;
        
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
                   (this.useOptimizedSystems ? window.CreatureSpriteOptimized : window.CreatureSprite) &&
                   window.CreatureFactory &&
                   window.CreatureManager &&
                   window.Energy &&
                   window.gameEnergy &&
                   window.Resources &&
                   window.PerformanceManager &&
                   typeof PIXI !== 'undefined';
        };
        
        while (!checkModules()) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * Inicializa el motor optimizado
     */
    async init() {
        if (CONSTANTS.DEBUG.MODE) {
            console.log('EngineOptimized: Inicializando motor optimizado...');
        }
        
        try {
            // Inicializar renderer PixiJS
            this.renderer = new Renderer();
            await this.renderer.init();
            
            // Inicializar sistema de performance PRIMERO
            this.performanceManager = new PerformanceManager();
            await this.performanceManager.init(this.renderer.getApp().renderer);
            window.gamePerformanceManager = this.performanceManager;
            
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
            
            // Inicializar sistema de efectos
            this.effects = new Effects();
            window.gameEffects = this.effects;
            
            // Inicializar sistemas nuevos - fixfeatures
            this.lineage = new Lineage();
            window.gameLineage = this.lineage;
            
            this.visualId = new CreatureVisualId();
            window.gameVisualId = this.visualId;
            
            // Inicializar sistema de recursos
            this.gameResources = new Resources();
            this.gameResources.init(this.worldContainer, this.camera);
            
            // Hacer recursos disponible globalmente
            window.gameResources = this.gameResources;
            
            // Inicializar sistema de criaturas (con optimizaciones)
            this.creatureManager = new CreatureManager();
            await this.creatureManager.init(this.worldContainer, this.camera);
            
            // Configurar modo optimizado en CreatureManager
            if (this.useOptimizedSystems) {
                this.creatureManager.setOptimizedMode(true);
            }
            
            // Hacer creatureManager disponible globalmente para reproducción
            window.gameEngine = this;
            window.gameCreatureManager = this.creatureManager;
            
            // Configurar canvas legacy (para compatibilidad)
            this.canvas = new EngineCanvas();
            
            // Configurar controles
            this.controls = new EngineControls(this);
            
            if (CONSTANTS.DEBUG.MODE) {
                console.log('EngineOptimized: Motor inicializado correctamente');
                console.log('Modo optimizado:', this.useOptimizedSystems);
            }
            
            // Emitir evento de inicialización
            if (window.eventBus) {
                eventBus.emit('engine:initialized');
            }
            
            // Iniciar automáticamente
            this.start();
            
        } catch (error) {
            console.error('EngineOptimized: Error inicializando:', error);
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
            
            if (CONSTANTS.DEBUG.MODE) {
                console.log('EngineOptimized: Motor iniciado');
            }
            
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
            
            if (CONSTANTS.DEBUG.MODE) {
                console.log('EngineOptimized: Motor detenido');
            }
            
            if (window.eventBus) {
                eventBus.emit('engine:stopped');
            }
        }
    }

    /**
     * Gameloop principal optimizado
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const frameStart = performance.now();
        
        // Actualizar sistemas
        this.updateSystems();
        
        // Renderizar frame
        if (this.canvas) {
            this.canvas.render();
        }
        
        // Actualizar métricas de performance
        const frameEnd = performance.now();
        const frameTime = frameEnd - frameStart;
        
        if (this.performanceManager) {
            this.performanceManager.update(frameTime / 1000); // convertir a segundos
        }
        
        this.frameCount++;
        
        // Verificar performance periódicamente
        if (frameEnd - this.lastPerformanceCheck > 5000) { // cada 5 segundos
            this.checkPerformance();
            this.lastPerformanceCheck = frameEnd;
        }
        
        // Programar siguiente frame
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Actualiza todos los sistemas (optimizado)
     */
    updateSystems() {
        // Actualizar tiempo
        if (window.gameTime) {
            gameTime.update();
            
            // Obtener deltaTime desde timeUtils
            if (window.timeUtils) {
                const deltaTime = timeUtils.getDeltaTimeSeconds();
                
                // Actualizar cámara (siempre necesario)
                if (this.camera) {
                    this.camera.update(deltaTime);
                }
                
                // Actualizar recursos (optimizado)
                if (this.gameResources) {
                    this.gameResources.update(deltaTime);
                }
                
                // Actualizar criaturas (con optimizaciones)
                if (this.creatureManager) {
                    this.creatureManager.update(deltaTime);
                }
                
                // Actualizar efectos visuales (solo si es necesario)
                if (this.effects && CONSTANTS.DEBUG.EMIT_RENDER_EVENTS) {
                    this.effects.update(deltaTime);
                    this.effects.render(this.renderer);
                }
                
                // Actualizar sistema de reproducción - Fase 3.1 (throttled)
                if (window.gameReproduction && this.frameCount % 60 === 0) { // cada segundo
                    const aliveCreatureIds = this.creatureManager.getAllCreatures()
                        .filter(c => c.isAlive)
                        .map(c => c.id);
                    gameReproduction.cleanupCooldowns(aliveCreatureIds);
                }
            }
        }
        
        // Actualizar estadísticas (throttled)
        if (window.timeStats && this.frameCount % 10 === 0) { // cada 10 frames
            timeStats.update();
        }
        
        // Actualizar debug overlay (throttled)
        if (window.debugOverlay && this.frameCount % 30 === 0) { // cada 30 frames
            debugOverlay.update();
        }
    }

    /**
     * Verifica la performance y ajusta optimizaciones
     */
    checkPerformance() {
        if (!this.performanceManager) return;
        
        const summary = this.performanceManager.getPerformanceSummary();
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('EngineOptimized: Performance check:', summary);
        }
        
        // Ajustar optimizaciones automáticamente
        if (summary.fps < 45) {
            this.enableAggressiveOptimizations();
        } else if (summary.fps > 55) {
            this.enableNormalOptimizations();
        }
        
        // Limpiar memoria si es necesario
        if (summary.memory > 100) { // >100MB
            this.performanceManager.forceMemoryCleanup();
        }
    }

    /**
     * Activa optimizaciones agresivas
     */
    enableAggressiveOptimizations() {
        if (CONSTANTS.DEBUG.MODE) {
            console.log('EngineOptimized: Activando optimizaciones agresivas');
        }
        
        // Reducir frecuencia de updates de debug
        CONSTANTS.DEBUG.UPDATE_INTERVAL = 500; // 500ms
        
        // Desactivar efectos visuales no críticos
        CONSTANTS.DEBUG.EMIT_RENDER_EVENTS = false;
        
        // Configurar performance manager
        if (this.performanceManager) {
            this.performanceManager.setOptimizationLevel('performance');
        }
    }

    /**
     * Activa optimizaciones normales
     */
    enableNormalOptimizations() {
        // Restaurar configuración normal
        CONSTANTS.DEBUG.UPDATE_INTERVAL = 100; // 100ms
        
        // Permitir efectos si debug está activo
        if (CONSTANTS.DEBUG.MODE) {
            CONSTANTS.DEBUG.EMIT_RENDER_EVENTS = true;
        }
        
        // Configurar performance manager
        if (this.performanceManager) {
            this.performanceManager.setOptimizationLevel('balanced');
        }
    }

    /**
     * Obtiene estadísticas del motor
     */
    getStats() {
        const stats = {
            frameCount: this.frameCount,
            isRunning: this.isRunning,
            optimizedMode: this.useOptimizedSystems
        };
        
        if (this.performanceManager) {
            stats.performance = this.performanceManager.getStats();
        }
        
        if (this.creatureManager) {
            stats.creatures = this.creatureManager.getStats();
        }
        
        return stats;
    }

    /**
     * Limpia recursos
     */
    destroy() {
        this.stop();
        
        if (this.performanceManager) {
            this.performanceManager.destroy();
        }
        
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
        
        if (this.effects) {
            this.effects.destroy();
        }
        
        if (this.renderer) {
            this.renderer.destroy();
        }
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('EngineOptimized: Destruido');
        }
    }
}

// Hacer disponible globalmente
window.EngineOptimized = EngineOptimized; 