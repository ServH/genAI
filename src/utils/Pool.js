/**
 * GenAI - Pool genérico
 * CAJA OPTIMIZACIÓN - Fase O.2
 * Provee acquire / release / warm para reutilizar objetos.
 * (≤ 100 líneas)
 */

class Pool {
    /**
     * @param {Function} factory - Devuelve una nueva instancia cuando el pool está vacío.
     */
    constructor(factory) {
        this.factory = factory;
        this.free = [];
        this.inUse = 0;
    }

    /** Obtiene un objeto del pool o crea uno nuevo */
    acquire() {
        const obj = this.free.pop() || this.factory();
        this.inUse++;
        return obj;
    }

    /** Devuelve un objeto al pool */
    release(obj) {
        if (!obj) return;
        this.inUse = Math.max(0, this.inUse - 1);
        this.free.push(obj);
    }

    /** Precalienta el pool con `count` instancias */
    warm(count = 10) {
        while (this.free.length < count) {
            this.free.push(this.factory());
        }
    }

    /** Estadísticas actuales */
    getStats() {
        return { free: this.free.length, inUse: this.inUse };
    }
}

// Exportar globalmente para uso simple en scripts vanilla
window.Pool = Pool; 