/**
 * GenAI - Sistema de Fondo
 * CAJA 1 - Fase 1.2: Rendering Base
 */

class Background {
    constructor() {
        this.graphics = null;
        this.width = 0;
        this.height = 0;
        this.needsRedraw = true;
        
        console.log('Background: Sistema inicializado');
    }

    /**
     * Inicializa el fondo
     */
    init(stage) {
        this.graphics = new PIXI.Graphics();
        stage.addChildAt(this.graphics, 0); // Agregar al fondo
        
        // Escuchar eventos de resize
        if (window.eventBus) {
            eventBus.on('renderer:resized', (data) => {
                this.resize(data.width, data.height);
            });
        }
        
        this.resize(window.innerWidth, window.innerHeight);
    }

    /**
     * Redimensiona el fondo
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.needsRedraw = true;
        this.draw();
    }

    /**
     * Dibuja el gradiente radial
     */
    draw() {
        if (!this.graphics || !this.needsRedraw) return;
        
        this.graphics.clear();
        
        // Crear gradiente radial desde el centro
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.max(this.width, this.height) * 0.8;
        
        // Colores del gradiente
        const innerColor = this.hexToNumber(CONSTANTS.COLORS.BACKGROUND_INNER);
        const outerColor = this.hexToNumber(CONSTANTS.COLORS.BACKGROUND);
        
        // Dibujar círculos concéntricos para simular gradiente
        const steps = 20;
        for (let i = 0; i < steps; i++) {
            const ratio = i / (steps - 1);
            const currentRadius = radius * ratio;
            const alpha = 1 - (ratio * 0.3); // Fade hacia los bordes
            
            // Interpolar color
            const color = this.interpolateColor(innerColor, outerColor, ratio);
            
            this.graphics.beginFill(color, alpha);
            this.graphics.drawCircle(centerX, centerY, currentRadius);
            this.graphics.endFill();
        }
        
        // Fondo base para cubrir todo
        this.graphics.beginFill(outerColor);
        this.graphics.drawRect(0, 0, this.width, this.height);
        this.graphics.endFill();
        
        this.needsRedraw = false;
    }

    /**
     * Convierte hex string a número
     */
    hexToNumber(hex) {
        return parseInt(hex.replace('#', ''), 16);
    }

    /**
     * Interpola entre dos colores
     */
    interpolateColor(color1, color2, ratio) {
        const r1 = (color1 >> 16) & 0xFF;
        const g1 = (color1 >> 8) & 0xFF;
        const b1 = color1 & 0xFF;
        
        const r2 = (color2 >> 16) & 0xFF;
        const g2 = (color2 >> 8) & 0xFF;
        const b2 = color2 & 0xFF;
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return (r << 16) | (g << 8) | b;
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
window.Background = Background; 