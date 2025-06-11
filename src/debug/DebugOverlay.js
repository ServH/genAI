/**
 * GenAI - Debug Overlay Core
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Interface de debug básica
 */

class DebugOverlay {
    constructor() {
        this.isVisible = false;
        this.isMinimized = false;
        this.updateInterval = 100;
        this.lastUpdate = 0;
        
        this.init();
    }

    /**
     * Inicializa el overlay de debug
     */
    init() {
        this.createOverlay();
        this.setupEventListeners();
        
        console.log('DebugOverlay: Inicializado');
        
        if (window.eventBus) {
            eventBus.emit('debug:initialized');
        }
    }

    /**
     * Crea la estructura HTML del overlay
     */
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'debug-overlay';
        overlay.className = 'debug-overlay hidden';
        
        overlay.innerHTML = `
            <div class="debug-header">
                <span class="debug-title">GenAI Debug</span>
                <div class="debug-controls">
                    <button class="debug-btn" id="debug-minimize">-</button>
                    <button class="debug-btn" id="debug-close">×</button>
                </div>
            </div>
            <div class="debug-content" id="debug-content">
                <div class="debug-section">
                    <h4>Performance</h4>
                    <div id="debug-performance">Cargando...</div>
                </div>
                <div class="debug-section">
                    <h4>Cámara</h4>
                    <div id="debug-camera">Cargando...</div>
                </div>
                <div class="debug-section">
                    <h4>Criaturas</h4>
                    <div id="debug-creatures">Cargando...</div>
                </div>
                <div class="debug-section">
                    <h4>Genética</h4>
                    <div id="debug-genetics">Cargando...</div>
                </div>
                <div class="debug-section">
                    <h4>Controles</h4>
                    <div id="debug-controls">
                        <div class="debug-info">D: Toggle Debug</div>
                        <div class="debug-info">G: Toggle Grid</div>
                        <div class="debug-info">Espacio: Pausa</div>
                        <div class="debug-info">Mouse: Pan cámara</div>
                        <div class="debug-info">Rueda: Zoom</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Botón minimizar
        const minimizeBtn = document.getElementById('debug-minimize');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        }
        
        // Botón cerrar
        const closeBtn = document.getElementById('debug-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
    }

    /**
     * Muestra el overlay
     */
    show() {
        if (!this.isVisible) {
            this.isVisible = true;
            this.overlay.classList.remove('hidden');
            
            console.log('DebugOverlay: Mostrado');
            
            if (window.eventBus) {
                eventBus.emit('debug:shown');
            }
        }
    }

    /**
     * Oculta el overlay
     */
    hide() {
        if (this.isVisible) {
            this.isVisible = false;
            this.overlay.classList.add('hidden');
            
            console.log('DebugOverlay: Ocultado');
            
            if (window.eventBus) {
                eventBus.emit('debug:hidden');
            }
        }
    }

    /**
     * Alterna la visibilidad del overlay
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Alterna el estado minimizado
     */
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        const content = document.getElementById('debug-content');
        
        if (content) {
            if (this.isMinimized) {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        }
        
        console.log(`DebugOverlay: ${this.isMinimized ? 'Minimizado' : 'Expandido'}`);
    }

    /**
     * Actualiza la información mostrada
     */
    update() {
        if (!this.isVisible || this.isMinimized) return;
        
        const now = performance.now();
        if (now - this.lastUpdate < this.updateInterval) return;
        
        this.updatePerformance();
        this.updateCamera();
        this.updateCreatures();
        this.updateGenetics();
        this.lastUpdate = now;
    }

    /**
     * Actualiza la sección de performance
     */
    updatePerformance() {
        const performanceDiv = document.getElementById('debug-performance');
        if (!performanceDiv) return;
        
        let content = '<div class="debug-info">Sin datos</div>';
        
        if (window.timeStats) {
            const stats = timeStats.getDebugInfo();
            content = `
                <div class="debug-info">FPS: ${stats.fps}</div>
                <div class="debug-info">Delta: ${stats.deltaTime}ms</div>
                <div class="debug-info">Frames: ${stats.frameCount}</div>
                <div class="debug-info">Tiempo: ${stats.totalTime}s</div>
                <div class="debug-info">Escala: ${stats.timeScale}x</div>
                <div class="debug-info">Pausado: ${stats.isPaused ? 'Sí' : 'No'}</div>
            `;
        }
        
        performanceDiv.innerHTML = content;
    }

    /**
     * Actualiza la sección de cámara
     */
    updateCamera() {
        const cameraDiv = document.getElementById('debug-camera');
        if (!cameraDiv) return;
        
        let content = '<div class="debug-info">Sin datos</div>';
        
        if (window.gameCamera) {
            const camera = window.gameCamera;
            content = `
                <div class="debug-info">X: ${Math.round(camera.x)}</div>
                <div class="debug-info">Y: ${Math.round(camera.y)}</div>
                <div class="debug-info">Zoom: ${camera.zoom.toFixed(2)}x</div>
                <div class="debug-info">Target Zoom: ${camera.targetZoom.toFixed(2)}x</div>
                <div class="debug-info">Arrastrando: ${camera.isDragging ? 'Sí' : 'No'}</div>
            `;
        }
        
        cameraDiv.innerHTML = content;
    }

    /**
     * Actualiza la sección de criaturas
     */
    updateCreatures() {
        const creaturesDiv = document.getElementById('debug-creatures');
        if (!creaturesDiv) return;
        
        let content = '<div class="debug-info">Sin datos</div>';
        
        if (window.gameEngine && window.gameEngine.creatureManager) {
            const manager = window.gameEngine.creatureManager;
            const stats = manager.getStats();
            
            // Estadísticas básicas
            if (stats.basic) {
                content = `
                    <div class="debug-info">Activas: ${stats.basic.aliveCreatures}/${stats.basic.totalCreatures}</div>
                    <div class="debug-info">Sprites: ${stats.basic.sprites}</div>
                    <div class="debug-info">Updates: ${stats.basic.updateCounter}</div>
                `;
            }
            
            // Estadísticas de energía
            if (stats.energy) {
                const energyStats = stats.energy;
                content += `
                    <div class="debug-info">--- Energía ---</div>
                    <div class="debug-info">Promedio: ${energyStats.avgEnergy.toFixed(1)}</div>
                    <div class="debug-info">Críticas: ${energyStats.criticalCount}</div>
                    <div class="debug-info">Muriendo: ${energyStats.dyingCount}</div>
                `;
            }
            
            // Estadísticas de recursos
            if (window.gameResources) {
                const resourceStats = window.gameResources.getStats();
                content += `
                    <div class="debug-info">--- Recursos ---</div>
                    <div class="debug-info">Comida: ${resourceStats.currentFood}/${resourceStats.maxFood}</div>
                    <div class="debug-info">Spawneada: ${resourceStats.totalSpawned}</div>
                    <div class="debug-info">Consumida: ${resourceStats.totalConsumed}</div>
                    <div class="debug-info">Próximo: ${((resourceStats.spawnInterval - resourceStats.spawnTimer) / 1000).toFixed(1)}s</div>
                `;
            }
            
            // Estadísticas de comportamiento (Fase 2.3)
            if (stats.behavior) {
                const behaviorStats = stats.behavior;
                content += `
                    <div class="debug-info">--- Estados ---</div>
                    <div class="debug-info">Idle: ${behaviorStats.idleCount}</div>
                    <div class="debug-info">Seeking: ${behaviorStats.seekingCount}</div>
                    <div class="debug-info">Eating: ${behaviorStats.eatingCount}</div>
                `;
            }
        }
        
        creaturesDiv.innerHTML = content;
    }

    /**
     * Actualiza la sección de genética - Fase 3.0
     * CORREGIDO: Usa getAllCreatures() en lugar de getAliveCreatures()
     */
    updateGenetics() {
        const geneticsDiv = document.getElementById('debug-genetics');
        if (!geneticsDiv) return;
        
        let content = '<div class="debug-info">Cargando genética...</div>';
        
        if (window.gameEngine && window.gameEngine.creatureManager) {
            const manager = window.gameEngine.creatureManager;
            const allCreatures = manager.getAllCreatures();
            const creatures = allCreatures.filter(c => c.isAlive);
            
            if (creatures.length > 0) {
                // Estadísticas de población genética
                const dnaArray = creatures.map(c => c.dna).filter(dna => dna);
                
                if (dnaArray.length > 0) {
                    // Diversidad genética
                    const diversity = GeneticUtils.calculatePopulationDiversity(dnaArray);
                    
                    // Estadísticas por gen
                    const speedStats = GeneticUtils.getGeneStats(dnaArray, 'SPEED');
                    const sizeStats = GeneticUtils.getGeneStats(dnaArray, 'SIZE');
                    const visionStats = GeneticUtils.getGeneStats(dnaArray, 'VISION');
                    
                    content = `
                        <div class="debug-info">Población: ${dnaArray.length}</div>
                        <div class="debug-info">Diversidad: ${(diversity * 100).toFixed(1)}%</div>
                        <div class="debug-info">--- Velocidad ---</div>
                        <div class="debug-info">Min: ${speedStats.min.toFixed(2)}</div>
                        <div class="debug-info">Max: ${speedStats.max.toFixed(2)}</div>
                        <div class="debug-info">Prom: ${speedStats.avg.toFixed(2)}</div>
                        <div class="debug-info">--- Tamaño ---</div>
                        <div class="debug-info">Min: ${sizeStats.min.toFixed(2)}</div>
                        <div class="debug-info">Max: ${sizeStats.max.toFixed(2)}</div>
                        <div class="debug-info">Prom: ${sizeStats.avg.toFixed(2)}</div>
                        <div class="debug-info">--- Visión ---</div>
                        <div class="debug-info">Min: ${Math.round(visionStats.min)}</div>
                        <div class="debug-info">Max: ${Math.round(visionStats.max)}</div>
                        <div class="debug-info">Prom: ${Math.round(visionStats.avg)}</div>
                    `;
                }
            }
        }
        
        geneticsDiv.innerHTML = content;
    }

    /**
     * Limpia recursos
     */
    destroy() {
        if (this.overlay) {
            this.overlay.remove();
        }
        
        console.log('DebugOverlay: Destruido');
        
        if (window.eventBus) {
            eventBus.emit('debug:destroyed');
        }
    }
}

// Crear instancia global
const debugOverlay = new DebugOverlay();

// Hacer disponible globalmente
window.DebugOverlay = DebugOverlay;
window.debugOverlay = debugOverlay; 