/**
 * GenAI - Sistema de Tiempo Core
 * CAJA 1 - Fase 1.1: Sistema Core
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
        this.maxDeltaTime = 50; // ms
        this.targetFrameTime = 16.67; // 60fps
        
        // Estadísticas básicas
        this.frameCount = 0;
        this.totalTime = 0;
        
        this.init();
    }

    /**
     * Inicializa el sistema de tiempo
     */
    init() {
        this.currentTime = performance.now();
        this.lastTime = this.currentTime;
        
        console.log('Time: Sistema inicializado');
        
        if (window.eventBus) {
            eventBus.emit('time:initialized');
        }
    }

    /**
     * Actualiza el tiempo del juego
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
        this.smoothedDeltaTime = this.smoothedDeltaTime + 
            (this.deltaTime - this.smoothedDeltaTime) * this.smoothingFactor;
        
        this.lastTime = this.currentTime;
        this.frameCount++;
        this.totalTime += this.deltaTime;
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
            this.lastTime = performance.now();
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
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0, scale);
        console.log(`Time: Escala de tiempo establecida a ${this.timeScale}`);
        
        if (window.eventBus) {
            eventBus.emit('time:scaleChanged', this.timeScale);
        }
    }
}

// Crear instancia global
const gameTime = new Time();

// Hacer disponible globalmente
window.Time = Time;
window.gameTime = gameTime; 