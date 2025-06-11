/**
 * GenAI - Motor Principal del Juego
 * CAJA 1 - Fase 1.0: Setup Inicial
 * 
 * Maneja el gameloop principal y la inicialización de PixiJS
 */

class Engine {
    constructor() {
        this.app = null;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.isRunning = false;
        this.frameCount = 0;
        
        // Debug info
        this.fps = 0;
        this.lastFpsUpdate = 0;
        
        this.init();
    }

    /**
     * Inicializa PixiJS y configura el canvas
     */
    async init() {
        try {
            // Crear aplicación PixiJS
            this.app = new PIXI.Application();
            
            // Inicializar con configuración
            await this.app.init({
                width: window.innerWidth,
                height: window.innerHeight,
                backgroundColor: CONSTANTS.CANVAS.BACKGROUND_COLOR,
                antialias: CONSTANTS.CANVAS.ANTIALIAS,
                resolution: CONSTANTS.CANVAS.RESOLUTION,
                autoDensity: true
            });

            // Agregar canvas al DOM
            const gameContainer = document.getElementById('game-container');
            const existingCanvas = document.getElementById('game-canvas');
            if (existingCanvas) {
                existingCanvas.remove();
            }
            
            this.app.canvas.id = 'game-canvas';
            gameContainer.appendChild(this.app.canvas);

            // Configurar responsive
            this.setupResize();
            
            // Inicializar debug
            this.setupDebug();
            
            console.log('Engine inicializado correctamente');
            console.log(`Fase actual: ${CONSTANTS.CURRENT_PHASE}`);
            
            // Iniciar gameloop
            this.start();
            
        } catch (error) {
            console.error('Error inicializando Engine:', error);
        }
    }

    /**
     * Configura el redimensionamiento responsivo
     */
    setupResize() {
        const resize = () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        };
        
        window.addEventListener('resize', resize);
        resize(); // Aplicar inmediatamente
    }

    /**
     * Configura el sistema de debug y controles
     */
    setupDebug() {
        // Controles de teclado
        document.addEventListener('keydown', (event) => {
            switch(event.key.toLowerCase()) {
                case 'd':
                    this.toggleDebug();
                    break;
                case ' ':
                    event.preventDefault();
                    this.togglePause();
                    break;
            }
        });
    }

    /**
     * Alterna entre pausa y reproducción del juego
     */
    togglePause() {
        if (window.gameTime) {
            gameTime.togglePause();
        }
    }

    /**
     * Alterna la visualización del debug overlay
     */
    toggleDebug() {
        if (window.debugOverlay) {
            debugOverlay.toggle();
        } else {
            // Fallback para compatibilidad
            const debugOverlayElement = document.getElementById('debug-overlay');
            if (debugOverlayElement) {
                debugOverlayElement.classList.toggle('hidden');
            }
        }
    }

    /**
     * Actualiza la información de debug
     */
    updateDebug() {
        const now = performance.now();
        
        // Actualizar FPS cada 100ms
        if (now - this.lastFpsUpdate > CONSTANTS.DEBUG.UPDATE_INTERVAL) {
            this.fps = Math.round(1000 / this.deltaTime);
            this.lastFpsUpdate = now;
            
            // Actualizar DOM
            const debugContent = document.getElementById('debug-content');
            if (debugContent) {
                debugContent.innerHTML = `
                    <div>FPS: ${this.fps}</div>
                    <div>Delta: ${this.deltaTime.toFixed(2)}ms</div>
                    <div>Frame: ${this.frameCount}</div>
                    <div>Fase: ${CONSTANTS.CURRENT_PHASE}</div>
                `;
            }
        }
    }

    /**
     * Inicia el gameloop principal
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        
        console.log('Gameloop iniciado');
        
        // Usar el ticker de PixiJS para el gameloop
        this.app.ticker.add(this.gameLoop.bind(this));
    }

    /**
     * Detiene el gameloop
     */
    stop() {
        this.isRunning = false;
        this.app.ticker.remove(this.gameLoop.bind(this));
        console.log('Gameloop detenido');
    }

    /**
     * Loop principal del juego
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.frameCount++;
        
        // Log deltaTime para validación de la fase (solo cada 5 segundos para no saturar)
        if (this.frameCount % 300 === 0) { // Cada 5 segundos aprox
            console.log(`DeltaTime: ${this.deltaTime.toFixed(2)}ms | FPS: ${Math.round(1000/this.deltaTime)}`);
        }
        
        // Actualizar sistemas (TODO: Fases futuras)
        this.update();
        
        // Actualizar debug
        this.updateDebug();
    }

    /**
     * Actualiza todos los sistemas del juego
     */
    update() {
        // Actualizar sistema de tiempo
        if (window.gameTime) {
            gameTime.update();
        }
        
        // Actualizar debug overlay
        if (window.debugOverlay) {
            debugOverlay.update();
        }
        
        // TODO: Fase 2.0 - Actualizar criaturas
        // TODO: Fase 3.0 - Actualizar genética
        // TODO: Fase 4.0 - Actualizar mundo
    }

    /**
     * Limpia recursos al destruir el engine
     */
    destroy() {
        if (this.app) {
            this.stop();
            this.app.destroy(true);
            console.log('Engine destruido');
        }
    }
}

// Hacer disponible globalmente
window.Engine = Engine; 