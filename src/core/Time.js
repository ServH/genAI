/**
 * GenAI - Sistema de Tiempo
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Maneja el tiempo del juego con deltaTime suavizado
 */

class Time {
    constructor() {
        this.currentTime = 0;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.smoothedDeltaTime = 0;
        this.timeScale = 1.0;
        this.isPaused = false;
        
        // Configuración de suavizado
        this.smoothingFactor = 0.1;
        this.maxDeltaTime = 50; // ms - Limitar saltos grandes
        this.targetFrameTime = 16.67; // 60fps
        
        // Estadísticas
        this.frameCount = 0;
        this.totalTime = 0;
        this.fps = 0;
        this.averageFps = 0;
        this.fpsHistory = [];
        this.fpsHistorySize = 60; // Últimos 60 frames
        
        // Eventos de tiempo
        this.timeEvents = [];
        
        this.init();
    }

    /**
     * Inicializa el sistema de tiempo
     */
    init() {
        this.currentTime = performance.now();
        this.lastTime = this.currentTime;
        
        console.log('Time: Sistema inicializado');
        
        // Emitir evento de inicialización
        if (window.eventBus) {
            eventBus.emit('time:initialized');
        }
    }

    /**
     * Actualiza el tiempo del juego
     * Debe ser llamado en cada frame
     */
    update() {
        if (this.isPaused) {
            this.deltaTime = 0;
            this.smoothedDeltaTime = 0;
            return;
        }
        
        this.currentTime = performance.now();
        const rawDeltaTime = this.currentTime - this.lastTime;
        
        // Limitar deltaTime para evitar saltos grandes
        this.deltaTime = Math.min(rawDeltaTime, this.maxDeltaTime);
        
        // Aplicar escala de tiempo
        this.deltaTime *= this.timeScale;
        
        // Suavizar deltaTime
        this.smoothedDeltaTime = this.lerp(
            this.smoothedDeltaTime,
            this.deltaTime,
            this.smoothingFactor
        );
        
        // Actualizar estadísticas
        this.updateStatistics();
        
        // Procesar eventos de tiempo
        this.processTimeEvents();
        
        this.lastTime = this.currentTime;
        this.frameCount++;
        this.totalTime += this.deltaTime;
    }

    /**
     * Actualiza las estadísticas de rendimiento
     */
    updateStatistics() {
        // Calcular FPS actual
        if (this.deltaTime > 0) {
            this.fps = 1000 / this.deltaTime;
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
     * Procesa eventos de tiempo programados
     */
    processTimeEvents() {
        const currentTime = this.getTotalTime();
        
        this.timeEvents = this.timeEvents.filter(event => {
            if (currentTime >= event.triggerTime) {
                try {
                    event.callback(event.data);
                } catch (error) {
                    console.error('Time: Error ejecutando evento de tiempo:', error);
                }
                return event.repeat;
            }
            return true;
        });
    }

    /**
     * Programa un evento para ejecutarse después de un tiempo
     * @param {Function} callback - Función a ejecutar
     * @param {number} delay - Retraso en milisegundos
     * @param {*} data - Datos opcionales
     * @param {boolean} repeat - Si el evento se repite
     * @returns {Object} Referencia al evento
     */
    setTimeout(callback, delay, data = null, repeat = false) {
        const event = {
            callback,
            triggerTime: this.getTotalTime() + delay,
            data,
            repeat,
            id: this.generateEventId()
        };
        
        this.timeEvents.push(event);
        return event;
    }

    /**
     * Cancela un evento de tiempo
     * @param {Object} event - Referencia al evento
     */
    clearTimeout(event) {
        const index = this.timeEvents.indexOf(event);
        if (index !== -1) {
            this.timeEvents.splice(index, 1);
        }
    }

    /**
     * Pausa el tiempo del juego
     */
    pause() {
        if (!this.isPaused) {
            this.isPaused = true;
            console.log('Time: Juego pausado');
            
            if (window.eventBus) {
                eventBus.emit('time:paused');
            }
        }
    }

    /**
     * Reanuda el tiempo del juego
     */
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.lastTime = performance.now(); // Resetear para evitar salto
            console.log('Time: Juego reanudado');
            
            if (window.eventBus) {
                eventBus.emit('time:resumed');
            }
        }
    }

    /**
     * Alterna entre pausa y reproducción
     */
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    /**
     * Establece la escala de tiempo
     * @param {number} scale - Escala (1.0 = normal, 0.5 = mitad, 2.0 = doble)
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0, scale);
        console.log(`Time: Escala de tiempo establecida a ${this.timeScale}`);
        
        if (window.eventBus) {
            eventBus.emit('time:scaleChanged', this.timeScale);
        }
    }

    /**
     * Obtiene el deltaTime actual en milisegundos
     * @returns {number} DeltaTime en ms
     */
    getDeltaTime() {
        return this.deltaTime;
    }

    /**
     * Obtiene el deltaTime suavizado en milisegundos
     * @returns {number} DeltaTime suavizado en ms
     */
    getSmoothedDeltaTime() {
        return this.smoothedDeltaTime;
    }

    /**
     * Obtiene el deltaTime en segundos
     * @returns {number} DeltaTime en segundos
     */
    getDeltaTimeSeconds() {
        return this.deltaTime / 1000;
    }

    /**
     * Obtiene el deltaTime suavizado en segundos
     * @returns {number} DeltaTime suavizado en segundos
     */
    getSmoothedDeltaTimeSeconds() {
        return this.smoothedDeltaTime / 1000;
    }

    /**
     * Obtiene el tiempo total transcurrido
     * @returns {number} Tiempo total en ms
     */
    getTotalTime() {
        return this.totalTime;
    }

    /**
     * Obtiene el tiempo total en segundos
     * @returns {number} Tiempo total en segundos
     */
    getTotalTimeSeconds() {
        return this.totalTime / 1000;
    }

    /**
     * Obtiene el FPS actual
     * @returns {number} FPS actual
     */
    getFPS() {
        return Math.round(this.fps);
    }

    /**
     * Obtiene el FPS promedio
     * @returns {number} FPS promedio
     */
    getAverageFPS() {
        return Math.round(this.averageFps);
    }

    /**
     * Obtiene el número de frames renderizados
     * @returns {number} Número de frames
     */
    getFrameCount() {
        return this.frameCount;
    }

    /**
     * Verifica si el juego está pausado
     * @returns {boolean} Estado de pausa
     */
    isPausedState() {
        return this.isPaused;
    }

    /**
     * Obtiene la escala de tiempo actual
     * @returns {number} Escala de tiempo
     */
    getTimeScale() {
        return this.timeScale;
    }

    /**
     * Interpolación lineal
     * @param {number} a - Valor inicial
     * @param {number} b - Valor final
     * @param {number} t - Factor de interpolación (0-1)
     * @returns {number} Valor interpolado
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Genera un ID único para eventos
     * @returns {string} ID único
     */
    generateEventId() {
        return `time_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Obtiene información de debug
     * @returns {Object} Información de debug
     */
    getDebugInfo() {
        return {
            deltaTime: this.deltaTime.toFixed(2),
            smoothedDeltaTime: this.smoothedDeltaTime.toFixed(2),
            fps: this.getFPS(),
            averageFps: this.getAverageFPS(),
            frameCount: this.frameCount,
            totalTime: (this.totalTime / 1000).toFixed(2),
            timeScale: this.timeScale,
            isPaused: this.isPaused,
            timeEvents: this.timeEvents.length
        };
    }

    /**
     * Limpia todos los recursos
     */
    destroy() {
        this.timeEvents = [];
        this.fpsHistory = [];
        console.log('Time: Sistema destruido');
        
        if (window.eventBus) {
            eventBus.emit('time:destroyed');
        }
    }
}

// Crear instancia global
const gameTime = new Time();

// Hacer disponible globalmente
window.Time = Time;
window.gameTime = gameTime; 