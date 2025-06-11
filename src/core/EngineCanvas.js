/**
 * GenAI - Manejo del Canvas
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Gestiona el canvas y su redimensionamiento
 */

class EngineCanvas {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.setupCanvas();
    }

    /**
     * Configura el canvas principal
     */
    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('EngineCanvas: Canvas con ID "gameCanvas" no encontrado');
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Escuchar cambios de tamaño
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Ajusta el tamaño del canvas
     */
    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        if (window.eventBus) {
            eventBus.emit('engine:canvasResized', {
                width: this.canvas.width,
                height: this.canvas.height
            });
        }
    }

    /**
     * Renderizado básico
     */
    render() {
        // Limpiar canvas
        this.ctx.fillStyle = CONSTANTS.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Emitir evento de render
        if (window.eventBus) {
            eventBus.emit('engine:render', this.ctx);
        }
    }

    /**
     * Obtiene el contexto del canvas
     */
    getContext() {
        return this.ctx;
    }

    /**
     * Obtiene las dimensiones del canvas
     */
    getDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
}

// Hacer disponible globalmente
window.EngineCanvas = EngineCanvas; 