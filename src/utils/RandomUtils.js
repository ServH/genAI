/**
 * GenAI - Utilidades Aleatorias
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Funciones avanzadas para generación aleatoria
 */

class RandomUtils {
    constructor(randomInstance) {
        this.random = randomInstance;
    }

    /**
     * Selecciona un elemento aleatorio de un array
     */
    randomChoice(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return null;
        }
        const index = this.random.randomInt(0, array.length - 1);
        return array[index];
    }

    /**
     * Selecciona múltiples elementos aleatorios únicos
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
     * Mezcla un array usando Fisher-Yates
     */
    shuffle(array) {
        const shuffled = [...array];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = this.random.randomInt(0, i);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    }

    /**
     * Genera un ángulo aleatorio en radianes
     */
    randomAngle() {
        return this.random.random() * Math.PI * 2;
    }

    /**
     * Genera un ángulo aleatorio en grados
     */
    randomAngleDegrees() {
        return this.random.random() * 360;
    }

    /**
     * Genera un punto aleatorio en un círculo
     */
    randomPointInCircle(radius = 1) {
        const angle = this.randomAngle();
        const r = Math.sqrt(this.random.random()) * radius;
        
        return {
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r
        };
    }

    /**
     * Genera un punto aleatorio en un rectángulo
     */
    randomPointInRect(width, height, offsetX = 0, offsetY = 0) {
        return {
            x: this.random.randomFloat(offsetX, offsetX + width),
            y: this.random.randomFloat(offsetY, offsetY + height)
        };
    }

    /**
     * Genera ruido usando distribución normal (Box-Muller)
     */
    randomGaussian(mean = 0, stdDev = 1) {
        if (this.hasSpare) {
            this.hasSpare = false;
            return this.spare * stdDev + mean;
        }
        
        this.hasSpare = true;
        const u = this.random.random();
        const v = this.random.random();
        const mag = stdDev * Math.sqrt(-2.0 * Math.log(u));
        this.spare = mag * Math.cos(2.0 * Math.PI * v);
        
        return mag * Math.sin(2.0 * Math.PI * v) + mean;
    }
}

// Crear instancia global
const randomUtils = new RandomUtils(gameRandom);

// Hacer disponible globalmente
window.RandomUtils = RandomUtils;
window.randomUtils = randomUtils; 