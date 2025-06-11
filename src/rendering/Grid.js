/**
 * GenAI - Grid de Debug
 * CAJA 1 - Fase 1.2: Rendering Base
 */

class Grid {
    constructor() {
        this.graphics = null;
        this.isVisible = false;
        this.gridSize = CONSTANTS.GRID.SIZE;
        this.color = CONSTANTS.GRID.COLOR;
        this.alpha = CONSTANTS.GRID.ALPHA;
        
        this.setupEvents();
        console.log('Grid: Sistema inicializado (tecla G para toggle)');
    }

    /**
     * Inicializa el grid
     */
    init(stage) {
        this.graphics = new PIXI.Graphics();
        this.graphics.alpha = 0; // Inicialmente invisible
        stage.addChild(this.graphics);
        
        // Escuchar eventos de cámara para redibujar
        if (window.eventBus) {
            eventBus.on('camera:moved', () => this.updateGrid());
            eventBus.on('renderer:resized', () => this.updateGrid());
        }
        
        this.updateGrid();
    }

    /**
     * Configura eventos de teclado
     */
    setupEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyG' && !e.repeat) {
                this.toggle();
            }
        });
    }

    /**
     * Alterna visibilidad del grid
     */
    toggle() {
        this.isVisible = !this.isVisible;
        
        if (this.graphics) {
            this.graphics.alpha = this.isVisible ? this.alpha : 0;
        }
        
        console.log(`Grid: ${this.isVisible ? 'Visible' : 'Oculto'}`);
        
        if (window.eventBus) {
            eventBus.emit('grid:toggled', { visible: this.isVisible });
        }
    }

    /**
     * Actualiza el grid basado en la cámara
     */
    updateGrid() {
        if (!this.graphics) return;
        
        this.graphics.clear();
        
        if (!this.isVisible) return;
        
        // Obtener información de la cámara
        const camera = window.gameCamera;
        if (!camera) return;
        
        const zoom = camera.zoom;
        const cameraX = camera.x;
        const cameraY = camera.y;
        
        // Calcular área visible
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const worldWidth = screenWidth / zoom;
        const worldHeight = screenHeight / zoom;
        
        // Calcular límites del grid
        const startX = Math.floor((-cameraX - worldWidth/2) / this.gridSize) * this.gridSize;
        const endX = Math.ceil((-cameraX + worldWidth/2) / this.gridSize) * this.gridSize;
        const startY = Math.floor((-cameraY - worldHeight/2) / this.gridSize) * this.gridSize;
        const endY = Math.ceil((-cameraY + worldHeight/2) / this.gridSize) * this.gridSize;
        
        // Dibujar líneas del grid
        this.graphics.lineStyle(1, this.hexToNumber(this.color), this.alpha);
        
        // Líneas verticales
        for (let x = startX; x <= endX; x += this.gridSize) {
            this.graphics.moveTo(x, startY);
            this.graphics.lineTo(x, endY);
        }
        
        // Líneas horizontales
        for (let y = startY; y <= endY; y += this.gridSize) {
            this.graphics.moveTo(startX, y);
            this.graphics.lineTo(endX, y);
        }
        
        // Líneas de origen más gruesas
        this.graphics.lineStyle(2, this.hexToNumber('#ffffff'), this.alpha * 0.8);
        this.graphics.moveTo(startX, 0);
        this.graphics.lineTo(endX, 0);
        this.graphics.moveTo(0, startY);
        this.graphics.lineTo(0, endY);
    }

    /**
     * Convierte hex string a número
     */
    hexToNumber(hex) {
        return parseInt(hex.replace('#', ''), 16);
    }

    /**
     * Limpia recursos
     */
    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;
        }
    }
}

// Hacer disponible globalmente
window.Grid = Grid; 