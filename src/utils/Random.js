/**
 * GenAI - Sistema de Números Aleatorios
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Generador de números aleatorios con seed determinista
 */

class Random {
    constructor(seed = null) {
        this.originalSeed = seed || this.generateSeed();
        this.seed = this.originalSeed;
        this.callCount = 0;
        
        console.log(`Random: Inicializado con seed ${this.originalSeed}`);
    }

    /**
     * Genera un seed basado en el tiempo actual
     * @returns {number} Seed generado
     */
    generateSeed() {
        return Math.floor(Math.random() * 2147483647);
    }

    /**
     * Establece un nuevo seed
     * @param {number} newSeed - Nuevo seed
     */
    setSeed(newSeed) {
        this.originalSeed = newSeed;
        this.seed = newSeed;
        this.callCount = 0;
        console.log(`Random: Seed cambiado a ${newSeed}`);
        
        if (window.eventBus) {
            eventBus.emit('random:seedChanged', newSeed);
        }
    }

    /**
     * Obtiene el seed actual
     * @returns {number} Seed actual
     */
    getSeed() {
        return this.originalSeed;
    }

    /**
     * Resetea el generador al seed original
     */
    reset() {
        this.seed = this.originalSeed;
        this.callCount = 0;
        console.log(`Random: Reseteado al seed ${this.originalSeed}`);
    }

    /**
     * Generador de números aleatorios LCG (Linear Congruential Generator)
     * Implementación simple pero efectiva para reproducibilidad
     * @returns {number} Número entre 0 y 1
     */
    next() {
        this.callCount++;
        
        // Parámetros del LCG (mismos que usa glibc)
        const a = 1103515245;
        const c = 12345;
        const m = 2147483648; // 2^31
        
        this.seed = (a * this.seed + c) % m;
        return this.seed / m;
    }

    /**
     * Genera un número aleatorio entre 0 y 1
     * @returns {number} Número entre 0 y 1
     */
    random() {
        return this.next();
    }

    /**
     * Genera un número entero aleatorio entre min y max (inclusive)
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {number} Número entero aleatorio
     */
    randomInt(min, max) {
        if (min > max) {
            [min, max] = [max, min];
        }
        return Math.floor(this.random() * (max - min + 1)) + min;
    }

    /**
     * Genera un número decimal aleatorio entre min y max
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {number} Número decimal aleatorio
     */
    randomFloat(min, max) {
        if (min > max) {
            [min, max] = [max, min];
        }
        return this.random() * (max - min) + min;
    }

    /**
     * Genera un booleano aleatorio
     * @param {number} probability - Probabilidad de true (0-1)
     * @returns {boolean} Valor booleano
     */
    randomBool(probability = 0.5) {
        return this.random() < probability;
    }

    /**
     * Selecciona un elemento aleatorio de un array
     * @param {Array} array - Array de elementos
     * @returns {*} Elemento seleccionado
     */
    randomChoice(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return null;
        }
        const index = this.randomInt(0, array.length - 1);
        return array[index];
    }

    /**
     * Selecciona múltiples elementos aleatorios únicos de un array
     * @param {Array} array - Array de elementos
     * @param {number} count - Número de elementos a seleccionar
     * @returns {Array} Array con elementos seleccionados
     */
    randomChoices(array, count) {
        if (!Array.isArray(array) || array.length === 0 || count <= 0) {
            return [];
        }
        
        count = Math.min(count, array.length);
        const shuffled = this.shuffle([...array]);
        return shuffled.slice(0, count);
    }

    /**
     * Mezcla un array usando el algoritmo Fisher-Yates
     * @param {Array} array - Array a mezclar
     * @returns {Array} Array mezclado (nueva instancia)
     */
    shuffle(array) {
        const shuffled = [...array];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = this.randomInt(0, i);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    }

    /**
     * Genera un ángulo aleatorio en radianes
     * @returns {number} Ángulo en radianes (0 a 2π)
     */
    randomAngle() {
        return this.random() * Math.PI * 2;
    }

    /**
     * Genera un ángulo aleatorio en grados
     * @returns {number} Ángulo en grados (0 a 360)
     */
    randomAngleDegrees() {
        return this.random() * 360;
    }

    /**
     * Genera un punto aleatorio en un círculo
     * @param {number} radius - Radio del círculo
     * @returns {Object} Objeto con propiedades x, y
     */
    randomPointInCircle(radius = 1) {
        const angle = this.randomAngle();
        const r = Math.sqrt(this.random()) * radius;
        
        return {
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r
        };
    }

    /**
     * Genera un punto aleatorio en un rectángulo
     * @param {number} width - Ancho del rectángulo
     * @param {number} height - Alto del rectángulo
     * @param {number} offsetX - Desplazamiento X
     * @param {number} offsetY - Desplazamiento Y
     * @returns {Object} Objeto con propiedades x, y
     */
    randomPointInRect(width, height, offsetX = 0, offsetY = 0) {
        return {
            x: this.randomFloat(offsetX, offsetX + width),
            y: this.randomFloat(offsetY, offsetY + height)
        };
    }

    /**
     * Genera un color aleatorio en formato hexadecimal
     * @returns {string} Color en formato #RRGGBB
     */
    randomColor() {
        const r = this.randomInt(0, 255).toString(16).padStart(2, '0');
        const g = this.randomInt(0, 255).toString(16).padStart(2, '0');
        const b = this.randomInt(0, 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    /**
     * Genera un color aleatorio en formato RGB
     * @returns {Object} Objeto con propiedades r, g, b
     */
    randomColorRGB() {
        return {
            r: this.randomInt(0, 255),
            g: this.randomInt(0, 255),
            b: this.randomInt(0, 255)
        };
    }

    /**
     * Genera un color aleatorio en formato HSL
     * @returns {Object} Objeto con propiedades h, s, l
     */
    randomColorHSL() {
        return {
            h: this.randomInt(0, 360),
            s: this.randomInt(0, 100),
            l: this.randomInt(0, 100)
        };
    }

    /**
     * Genera ruido usando distribución normal (Box-Muller)
     * @param {number} mean - Media
     * @param {number} stdDev - Desviación estándar
     * @returns {number} Valor con distribución normal
     */
    randomGaussian(mean = 0, stdDev = 1) {
        // Usar Box-Muller transform
        if (this.hasSpare) {
            this.hasSpare = false;
            return this.spare * stdDev + mean;
        }
        
        this.hasSpare = true;
        const u = this.random();
        const v = this.random();
        const mag = stdDev * Math.sqrt(-2.0 * Math.log(u));
        this.spare = mag * Math.cos(2.0 * Math.PI * v);
        
        return mag * Math.sin(2.0 * Math.PI * v) + mean;
    }

    /**
     * Genera un UUID v4 usando el generador determinista
     * @returns {string} UUID v4
     */
    randomUUID() {
        const chars = '0123456789abcdef';
        let uuid = '';
        
        for (let i = 0; i < 36; i++) {
            if (i === 8 || i === 13 || i === 18 || i === 23) {
                uuid += '-';
            } else if (i === 14) {
                uuid += '4'; // Versión 4
            } else if (i === 19) {
                uuid += chars[this.randomInt(8, 11)]; // 8, 9, a, o b
            } else {
                uuid += chars[this.randomInt(0, 15)];
            }
        }
        
        return uuid;
    }

    /**
     * Obtiene estadísticas del generador
     * @returns {Object} Estadísticas
     */
    getStats() {
        return {
            originalSeed: this.originalSeed,
            currentSeed: this.seed,
            callCount: this.callCount
        };
    }

    /**
     * Obtiene información de debug
     * @returns {Object} Información de debug
     */
    getDebugInfo() {
        return {
            seed: this.originalSeed,
            calls: this.callCount,
            currentState: this.seed
        };
    }
}

// Crear instancia global con seed aleatorio
const gameRandom = new Random();

// Hacer disponible globalmente
window.Random = Random;
window.gameRandom = gameRandom; 