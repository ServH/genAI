/**
 * GenAI - PerformanceMonitor
 * CAJA OPTIMIZACIÓN - Fase O.0: Profiling Base
 *
 * Módulo independiente para medir tiempos de lógica y render por frame
 * y emitir métricas vía EventBus. Cumple "UN ARCHIVO = UNA RESPONSABILIDAD" (≤100 líneas).
 */

class PerformanceMonitor {
    constructor(pixiApp = null) {
        this.app = pixiApp; // PIXI.Application (opcional hasta que esté disponible)
        this.reset();
    }

    // Reinicia contadores
    reset() {
        this.frameStart = 0;
        this.logicStart = 0;
        this.logicTime = 0;
        this.renderTime = 0;
        this.frameTime = 0;
        this.drawCalls = 0;
        this.custom = {};
    }

    // ----- Hooks ---------------------------------------------------------
    beginFrame() {
        this.frameStart = performance.now();
    }

    beginLogic() {
        this.logicStart = performance.now();
    }

    endLogic() {
        this.logicTime = performance.now() - this.logicStart;
    }

    endFrame() {
        const now = performance.now();
        this.frameTime = now - this.frameStart;
        this.renderTime = this.frameTime - this.logicTime;
        // Extraer drawCalls si renderer disponible
        if (this.app && this.app.renderer && this.app.renderer.metrics) {
            this.drawCalls = this.app.renderer.metrics.batches;
        }
        this.emitStats();
    }

    // Devuelve estadísticas actuales
    getStats() {
        return {
            logic: this.logicTime,
            render: this.renderTime,
            frame: this.frameTime,
            drawCalls: this.drawCalls,
            ...this.custom
        };
    }

    // Emite evento global con stats para debug overlay u otros sistemas
    emitStats() {
        if (window.eventBus) {
            eventBus.emit('performance:frame', this.getStats());
        }
    }

    // Permite que otros sistemas establezcan métricas adicionales
    setCustomStats(obj = {}) { this.custom = { ...this.custom, ...obj }; }
}

// Registrar globalmente para acceso sencillo
window.PerformanceMonitor = PerformanceMonitor; 