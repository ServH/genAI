/**
 * GenAI - Renderer PixiJS
 * CAJA 1 - Fase 1.2: Rendering Base
 */

class Renderer {
    constructor() {
        this.app = null;
        this.isInitialized = false;
        this.container = null;
    }

    /**
     * Inicializa PixiJS
     */
    async init() {
        try {
            // Crear aplicación PixiJS
            this.app = new PIXI.Application();
            
            // Configurar aplicación
            await this.app.init({
                width: window.innerWidth,
                height: window.innerHeight,
                backgroundColor: CONSTANTS.COLORS.BACKGROUND,
                antialias: CONSTANTS.CANVAS.ANTIALIAS,
                resolution: CONSTANTS.CANVAS.RESOLUTION,
                autoDensity: true
            });

            // Agregar al DOM
            this.setupDOM();
            
            // Configurar eventos
            this.setupEvents();
            
            this.isInitialized = true;
            console.log('Renderer: PixiJS inicializado');
            
            if (window.eventBus) {
                eventBus.emit('renderer:initialized');
            }
            
        } catch (error) {
            console.error('Renderer: Error inicializando PixiJS:', error);
            throw error;
        }
    }

    /**
     * Configura el DOM
     */
    setupDOM() {
        this.container = document.getElementById('game-container');
        if (!this.container) {
            throw new Error('Renderer: Container no encontrado');
        }
        
        // Remover canvas anterior si existe
        const existingCanvas = this.container.querySelector('canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        // Agregar nuevo canvas
        this.app.canvas.id = 'pixiCanvas';
        this.container.appendChild(this.app.canvas);
    }

    /**
     * Configura eventos de resize
     */
    setupEvents() {
        window.addEventListener('resize', () => this.resize());
        this.resize(); // Aplicar inmediatamente
    }

    /**
     * Redimensiona el renderer
     */
    resize() {
        if (!this.isInitialized) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.app.renderer.resize(width, height);
        
        if (window.eventBus) {
            eventBus.emit('renderer:resized', { width, height });
        }
    }

    /**
     * Obtiene el stage principal
     */
    getStage() {
        return this.app?.stage;
    }

    /**
     * Obtiene el renderer
     */
    getRenderer() {
        return this.app?.renderer;
    }

    /**
     * Limpia recursos
     */
    destroy() {
        if (this.app) {
            this.app.destroy(true);
            this.isInitialized = false;
            console.log('Renderer: Destruido');
        }
    }
}

// Hacer disponible globalmente
window.Renderer = Renderer; 