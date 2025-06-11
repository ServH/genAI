/**
 * GenAI - Generador de Colores Aleatorios
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Funciones para generar colores aleatorios
 */

class RandomColors {
    constructor(randomInstance) {
        this.random = randomInstance;
    }

    /**
     * Genera un color aleatorio en formato hexadecimal
     */
    randomColor() {
        const r = this.random.randomInt(0, 255);
        const g = this.random.randomInt(0, 255);
        const b = this.random.randomInt(0, 255);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * Genera un color RGB aleatorio
     */
    randomRGB() {
        return {
            r: this.random.randomInt(0, 255),
            g: this.random.randomInt(0, 255),
            b: this.random.randomInt(0, 255)
        };
    }

    /**
     * Genera un color HSL aleatorio
     */
    randomHSL() {
        return {
            h: this.random.randomInt(0, 360),
            s: this.random.randomInt(0, 100),
            l: this.random.randomInt(0, 100)
        };
    }

    /**
     * Genera un color de una paleta predefinida
     */
    randomFromPalette(palette) {
        if (!Array.isArray(palette) || palette.length === 0) {
            return this.randomColor();
        }
        
        const index = this.random.randomInt(0, palette.length - 1);
        return palette[index];
    }

    /**
     * Genera un color pastel aleatorio
     */
    randomPastel() {
        const hue = this.random.randomInt(0, 360);
        const saturation = this.random.randomInt(25, 70);
        const lightness = this.random.randomInt(80, 95);
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    /**
     * Genera un color vibrante aleatorio
     */
    randomVibrant() {
        const hue = this.random.randomInt(0, 360);
        const saturation = this.random.randomInt(70, 100);
        const lightness = this.random.randomInt(40, 70);
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
}

// Crear instancia global
const randomColors = new RandomColors(gameRandom);

// Hacer disponible globalmente
window.RandomColors = RandomColors;
window.randomColors = randomColors; 