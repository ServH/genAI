/**
 * GenAI - Sistema de Gestión de Performance
 * RAMA PERFORMANCE - Coordinador de Optimizaciones
 * 
 * Gestiona y coordina todas las optimizaciones de performance
 */

class PerformanceManager {
    constructor() {
        this.isInitialized = false;
        this.textureCache = null;
        this.optimizedMode = CONSTANTS.PERFORMANCE.USE_RENDER_TEXTURE;
        
        // Métricas de performance
        this.metrics = {
            frameTime: 0,
            avgFrameTime: 0,
            fps: 0,
            avgFps: 0,
            renderTime: 0,
            updateTime: 0,
            memoryUsage: 0,
            textureMemory: 0
        };
        
        // Historial para promedios
        this.frameTimeHistory = [];
        this.maxHistorySize = 60; // 1 segundo a 60fps
        
        // Contadores
        this.frameCount = 0;
        this.lastMetricsUpdate = 0;
        this.metricsUpdateInterval = 1000; // 1 segundo
        
        // Estado de optimizaciones
        this.optimizations = {
            renderTextures: false,
            decisionThrottling: false,
            debugMode: CONSTANTS.DEBUG.MODE,
            verboseLogging: CONSTANTS.DEBUG.VERBOSE_LOGGING
        };
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('PerformanceManager: Sistema inicializado');
        }
    }

    /**
     * Inicializa el sistema de performance
     */
    async init(renderer) {
        if (this.isInitialized) return;
        
        // Inicializar cache de texturas
        if (CONSTANTS.PERFORMANCE.USE_RENDER_TEXTURE) {
            this.textureCache = new TextureCache();
            this.textureCache.init(renderer);
            window.gameTextureCache = this.textureCache;
            this.optimizations.renderTextures = true;
        }
        
        // Configurar modo de optimización
        this.setupOptimizationMode();
        
        // Configurar monitoreo de performance
        this.setupPerformanceMonitoring();
        
        this.isInitialized = true;
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('PerformanceManager: Sistema inicializado completamente');
            console.log('Optimizaciones activas:', this.optimizations);
        }
    }

    /**
     * Configura el modo de optimización
     */
    setupOptimizationMode() {
        // Configurar flags globales
        if (!CONSTANTS.DEBUG.MODE) {
            // Modo performance: desactivar logs y eventos costosos
            this.disableDebugFeatures();
        }
        
        // Activar throttling de decisiones
        this.optimizations.decisionThrottling = true;
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('PerformanceManager: Modo optimización configurado');
        }
    }

    /**
     * Desactiva características de debug para mejor performance
     */
    disableDebugFeatures() {
        // Sobrescribir console.log en modo performance
        if (!CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            const originalLog = console.log;
            console.log = (...args) => {
                // Solo mostrar logs críticos
                if (args[0] && args[0].includes('ERROR') || args[0].includes('CRITICAL')) {
                    originalLog.apply(console, args);
                }
            };
        }
        
        this.optimizations.debugMode = false;
        this.optimizations.verboseLogging = false;
    }

    /**
     * Configura el monitoreo de performance
     */
    setupPerformanceMonitoring() {
        // Configurar medición de tiempo de frame
        this.lastFrameTime = performance.now();
        
        // Configurar medición de memoria (si está disponible)
        if (performance.memory) {
            this.memoryMonitoringAvailable = true;
        }
    }

    /**
     * Actualiza las métricas de performance
     */
    update(deltaTime) {
        const now = performance.now();
        
        // Calcular tiempo de frame
        const frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        // Actualizar historial
        this.frameTimeHistory.push(frameTime);
        if (this.frameTimeHistory.length > this.maxHistorySize) {
            this.frameTimeHistory.shift();
        }
        
        // Actualizar métricas básicas
        this.metrics.frameTime = frameTime;
        this.metrics.fps = 1000 / frameTime;
        this.frameCount++;
        
        // Actualizar promedios periódicamente
        if (now - this.lastMetricsUpdate > this.metricsUpdateInterval) {
            this.updateAverageMetrics();
            this.updateMemoryMetrics();
            this.lastMetricsUpdate = now;
        }
        
        // Optimización automática basada en performance
        this.autoOptimize();
    }

    /**
     * Actualiza métricas promedio
     */
    updateAverageMetrics() {
        if (this.frameTimeHistory.length === 0) return;
        
        const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
        this.metrics.avgFrameTime = sum / this.frameTimeHistory.length;
        this.metrics.avgFps = 1000 / this.metrics.avgFrameTime;
    }

    /**
     * Actualiza métricas de memoria
     */
    updateMemoryMetrics() {
        if (!this.memoryMonitoringAvailable) return;
        
        this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        
        // Memoria de texturas
        if (this.textureCache) {
            const cacheStats = this.textureCache.getStats();
            this.metrics.textureMemory = cacheStats.size * 0.1; // Estimación aproximada
        }
    }

    /**
     * Optimización automática basada en performance
     */
    autoOptimize() {
        const avgFps = this.metrics.avgFps;
        
        // Si el FPS baja de 45, activar optimizaciones agresivas
        if (avgFps < 45 && avgFps > 0) {
            this.enableAggressiveOptimizations();
        }
        // Si el FPS está bien (>55), permitir más características
        else if (avgFps > 55) {
            this.enableNormalOptimizations();
        }
    }

    /**
     * Activa optimizaciones agresivas
     */
    enableAggressiveOptimizations() {
        if (CONSTANTS.DEBUG.MODE) {
            console.log('PerformanceManager: Activando optimizaciones agresivas (FPS bajo)');
        }
        
        // Reducir frecuencia de decisiones
        if (CONSTANTS.PERFORMANCE.DECISION_COOLDOWN_MIN < 1.0) {
            CONSTANTS.PERFORMANCE.DECISION_COOLDOWN_MIN = 1.0;
            CONSTANTS.PERFORMANCE.DECISION_COOLDOWN_MAX = 2.0;
        }
        
        // Desactivar eventos de debug
        CONSTANTS.DEBUG.EMIT_RENDER_EVENTS = false;
        
        // Limpiar cache de texturas más agresivamente
        if (this.textureCache && this.textureCache.cache.size > 50) {
            this.textureCache.clear();
        }
    }

    /**
     * Activa optimizaciones normales
     */
    enableNormalOptimizations() {
        // Restaurar configuración normal
        CONSTANTS.PERFORMANCE.DECISION_COOLDOWN_MIN = 0.5;
        CONSTANTS.PERFORMANCE.DECISION_COOLDOWN_MAX = 1.0;
        
        // Permitir algunos eventos de debug si está habilitado
        if (CONSTANTS.DEBUG.MODE) {
            CONSTANTS.DEBUG.EMIT_RENDER_EVENTS = true;
        }
    }

    /**
     * Fuerza la limpieza de memoria
     */
    forceMemoryCleanup() {
        if (this.textureCache) {
            this.textureCache.clear();
        }
        
        // Forzar garbage collection si está disponible
        if (window.gc) {
            window.gc();
        }
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('PerformanceManager: Limpieza de memoria forzada');
        }
    }

    /**
     * Obtiene estadísticas completas de performance
     */
    getStats() {
        const stats = {
            ...this.metrics,
            optimizations: { ...this.optimizations },
            frameCount: this.frameCount,
            isOptimized: this.optimizedMode
        };
        
        // Agregar estadísticas del cache de texturas
        if (this.textureCache) {
            stats.textureCache = this.textureCache.getStats();
        }
        
        return stats;
    }

    /**
     * Obtiene un resumen de performance para debug
     */
    getPerformanceSummary() {
        return {
            fps: Math.round(this.metrics.avgFps),
            frameTime: Math.round(this.metrics.avgFrameTime * 100) / 100,
            memory: Math.round(this.metrics.memoryUsage),
            textureMemory: Math.round(this.metrics.textureMemory),
            optimizationsActive: Object.values(this.optimizations).filter(Boolean).length
        };
    }

    /**
     * Configura el nivel de optimización
     */
    setOptimizationLevel(level) {
        switch (level) {
            case 'performance':
                this.enableAggressiveOptimizations();
                break;
            case 'balanced':
                this.enableNormalOptimizations();
                break;
            case 'quality':
                this.disableOptimizations();
                break;
            default:
                console.warn('PerformanceManager: Nivel de optimización desconocido:', level);
        }
    }

    /**
     * Desactiva optimizaciones para máxima calidad
     */
    disableOptimizations() {
        CONSTANTS.DEBUG.EMIT_RENDER_EVENTS = true;
        CONSTANTS.PERFORMANCE.DECISION_COOLDOWN_MIN = 0.1;
        CONSTANTS.PERFORMANCE.DECISION_COOLDOWN_MAX = 0.3;
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('PerformanceManager: Optimizaciones desactivadas (modo calidad)');
        }
    }

    /**
     * Destruye el sistema
     */
    destroy() {
        if (this.textureCache) {
            this.textureCache.destroy();
            this.textureCache = null;
        }
        
        this.frameTimeHistory = [];
        this.isInitialized = false;
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('PerformanceManager: Sistema destruido');
        }
    }
}

// Hacer disponible globalmente
window.PerformanceManager = PerformanceManager; 