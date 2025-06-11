/**
 * GenAI - Generador Aleatorio Core
 * CAJA 1 - Fase 1.1: Sistema Core
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
     */
    generateSeed() {
        return Math.floor(Math.random() * 2147483647);
    }

    /**
     * Establece un nuevo seed
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
     * Generador LCG (Linear Congruential Generator)
     */
    next() {
        this.callCount++;
        
        // Parámetros del LCG (glibc)
        const a = 1103515245;
        const c = 12345;
        const m = 2147483648; // 2^31
        
        this.seed = (a * this.seed + c) % m;
        return this.seed / m;
    }

    /**
     * Genera un número aleatorio entre 0 y 1
     */
    random() {
        return this.next();
    }

    /**
     * Genera un número entero aleatorio entre min y max
     */
    randomInt(min, max) {
        if (min > max) {
            [min, max] = [max, min];
        }
        return Math.floor(this.random() * (max - min + 1)) + min;
    }

    /**
     * Genera un número decimal aleatorio entre min y max
     */
    randomFloat(min, max) {
        if (min > max) {
            [min, max] = [max, min];
        }
        return this.random() * (max - min) + min;
    }

    /**
     * Genera un booleano aleatorio
     */
    randomBool(probability = 0.5) {
        return this.random() < probability;
    }

    /**
     * Obtiene estadísticas del generador
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
     */
    getDebugInfo() {
        return {
            seed: this.originalSeed,
            calls: this.callCount,
            currentState: this.seed
        };
    }
}

// Crear instancia global
const gameRandom = new Random();

// Hacer disponible globalmente
window.Random = Random;
window.gameRandom = gameRandom; 