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
     * Configura el canvas principal (legacy para compatibilidad)
     */
    setupCanvas() {
        // En Fase 1.2, PixiJS maneja el canvas principal
        // Este módulo se mantiene para compatibilidad
        this.canvas = document.querySelector('#pixiCanvas') || document.querySelector('canvas');
        
        if (!this.canvas) {
            console.warn('EngineCanvas: Canvas no encontrado, creando canvas legacy');
            this.createLegacyCanvas();
        } else {
            console.log('EngineCanvas: Usando canvas de PixiJS');
        }
        
        // Escuchar cambios de tamaño
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Crea un canvas legacy si es necesario
     */
    createLegacyCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'legacyCanvas';
        this.canvas.style.display = 'none'; // Oculto, solo para compatibilidad
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    /**
     * Ajusta el tamaño del canvas
     */
    resizeCanvas() {
        if (!this.canvas) return;
        
        // Si es canvas de PixiJS, no redimensionar (PixiJS lo maneja)
        if (this.canvas.id === 'pixiCanvas') {
            return;
        }
        
        // Solo para canvas legacy
        const rect = this.canvas.parentElement?.getBoundingClientRect() || 
                    { width: window.innerWidth, height: window.innerHeight };
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
     * Renderizado básico (legacy)
     */
    render() {
        // En Fase 1.2, PixiJS maneja el renderizado
        // Este método se mantiene para compatibilidad
        if (!this.ctx || this.canvas.id === 'pixiCanvas') {
            return;
        }
        
        // Solo renderizar en canvas legacy
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