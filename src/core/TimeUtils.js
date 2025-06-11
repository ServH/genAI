/**
 * GenAI - Utilidades de Tiempo
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Funciones de acceso y utilidades para el sistema de tiempo
 */

class TimeUtils {
    constructor(timeInstance) {
        this.time = timeInstance;
    }

    /**
     * Obtiene el deltaTime actual en milisegundos
     */
    getDeltaTime() {
        return this.time.deltaTime;
    }

    /**
     * Obtiene el deltaTime suavizado en milisegundos
     */
    getSmoothedDeltaTime() {
        return this.time.smoothedDeltaTime;
    }

    /**
     * Obtiene el deltaTime en segundos
     */
    getDeltaTimeSeconds() {
        return this.time.deltaTime / 1000;
    }

    /**
     * Obtiene el deltaTime suavizado en segundos
     */
    getSmoothedDeltaTimeSeconds() {
        return this.time.smoothedDeltaTime / 1000;
    }

    /**
     * Obtiene el tiempo total transcurrido
     */
    getTotalTime() {
        return this.time.totalTime;
    }

    /**
     * Obtiene el tiempo total en segundos
     */
    getTotalTimeSeconds() {
        return this.time.totalTime / 1000;
    }

    /**
     * Obtiene el número de frames renderizados
     */
    getFrameCount() {
        return this.time.frameCount;
    }

    /**
     * Verifica si el juego está pausado
     */
    isPausedState() {
        return this.time.isPaused;
    }

    /**
     * Obtiene la escala de tiempo actual
     */
    getTimeScale() {
        return this.time.timeScale;
    }
}

// Crear instancia global
const timeUtils = new TimeUtils(gameTime);

// Hacer disponible globalmente
window.TimeUtils = TimeUtils;
window.timeUtils = timeUtils; 