/**
 * GenAI - Estadísticas de Tiempo
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Maneja estadísticas de FPS y rendimiento
 */

class TimeStats {
    constructor(timeInstance) {
        this.time = timeInstance;
        this.fps = 0;
        this.averageFps = 0;
        this.fpsHistory = [];
        this.fpsHistorySize = 60;
    }

    /**
     * Actualiza las estadísticas de rendimiento
     */
    update() {
        // Calcular FPS actual
        if (this.time.deltaTime > 0) {
            this.fps = 1000 / this.time.deltaTime;
        }
        
        // Mantener historial de FPS
        this.fpsHistory.push(this.fps);
        if (this.fpsHistory.length > this.fpsHistorySize) {
            this.fpsHistory.shift();
        }
        
        // Calcular FPS promedio
        if (this.fpsHistory.length > 0) {
            const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
            this.averageFps = sum / this.fpsHistory.length;
        }
    }

    /**
     * Obtiene el FPS actual
     */
    getFPS() {
        return Math.round(this.fps);
    }

    /**
     * Obtiene el FPS promedio
     */
    getAverageFPS() {
        return Math.round(this.averageFps);
    }

    /**
     * Obtiene información de debug
     */
    getDebugInfo() {
        return {
            deltaTime: this.time.deltaTime.toFixed(2),
            smoothedDeltaTime: this.time.smoothedDeltaTime.toFixed(2),
            fps: this.getFPS(),
            averageFps: this.getAverageFPS(),
            frameCount: this.time.frameCount,
            totalTime: (this.time.totalTime / 1000).toFixed(2),
            timeScale: this.time.timeScale,
            isPaused: this.time.isPaused
        };
    }

    /**
     * Limpia recursos
     */
    destroy() {
        this.fpsHistory = [];
    }
}

// Crear instancia global
const timeStats = new TimeStats(gameTime);

// Hacer disponible globalmente
window.TimeStats = TimeStats;
window.timeStats = timeStats; 