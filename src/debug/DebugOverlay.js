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
            <div class="debug-panel-container">
                <div class="debug-header">
                    <h3>GenAI Debug</h3>
                    <div class="debug-controls">
                        <button class="debug-btn" id="debug-minimize">-</button>
                        <button class="debug-btn" id="debug-close">×</button>
                    </div>
                </div>
                <div class="debug-content" id="debug-content">
                    <div class="debug-tabs">
                        <button class="debug-tab active" data-tab="sistema">Sistema</button>
                        <button class="debug-tab" data-tab="criaturas">Criaturas</button>
                        <button class="debug-tab" data-tab="reproduccion">Reproducción</button>
                        <button class="debug-tab" data-tab="linajes">Linajes</button>
                    </div>
                    <div class="debug-panels">
                        <!-- Panel Sistema -->
                        <div class="debug-panel active" id="panel-sistema">
                            <div class="debug-section">
                                <h4>Performance</h4>
                                <div id="debug-performance">Cargando...</div>
                            </div>
                            <div class="debug-section">
                                <h4>Cámara</h4>
                                <div id="debug-camera">Cargando...</div>
                            </div>
                            <div class="debug-section">
                                <h4>Efectos</h4>
                                <div id="debug-effects">Cargando...</div>
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
                        
                        <!-- Panel Criaturas -->
                        <div class="debug-panel" id="panel-criaturas">
                            <div class="debug-section">
                                <h4>Población</h4>
                                <div id="debug-population">Cargando...</div>
                            </div>
                            <div class="debug-section">
                                <h4>Criaturas</h4>
                                <div id="debug-creatures">Cargando...</div>
                            </div>
                            <div class="debug-section">
                                <h4>Genética</h4>
                                <div id="debug-genetics">Cargando...</div>
                            </div>
                        </div>
                        
                        <!-- Panel Reproducción -->
                        <div class="debug-panel" id="panel-reproduccion">
                            <div class="debug-section">
                                <h4>Sistema Reproductivo</h4>
                                <div id="debug-reproduction">Cargando...</div>
                            </div>
                        </div>
                        
                        <!-- Panel Linajes -->
                        <div class="debug-panel" id="panel-linajes">
                            <div class="debug-section">
                                <h4>Familias y Linajes</h4>
                                <div id="debug-lineage">Cargando...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.overlay = overlay;
        this.currentTab = 'sistema';
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
        
        // Tabs
        const tabs = document.querySelectorAll('.debug-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    /**
     * Cambia de tab en el debug overlay
     */
    switchTab(tabName) {
        // Actualizar tab activo
        const tabs = document.querySelectorAll('.debug-tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Actualizar panel activo
        const panels = document.querySelectorAll('.debug-panel');
        panels.forEach(panel => {
            if (panel.id === `panel-${tabName}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        this.currentTab = tabName;
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
        this.updateReproduction();
        this.updateEffects();
        this.updatePopulation(); // fixfeatures
        this.updateLineage(); // fixfeatures
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
                <div class="debug-info"><span class="debug-label">FPS:</span> <span class="debug-value">${stats.fps}</span></div>
                <div class="debug-info"><span class="debug-label">Delta:</span> <span class="debug-value">${stats.deltaTime}ms</span></div>
                <div class="debug-info"><span class="debug-label">Frames:</span> <span class="debug-value">${stats.frameCount}</span></div>
                <div class="debug-info"><span class="debug-label">Tiempo:</span> <span class="debug-value">${stats.totalTime}s</span></div>
                <div class="debug-info"><span class="debug-label">Escala:</span> <span class="debug-value">${stats.timeScale}x</span></div>
                <div class="debug-info"><span class="debug-label">Pausado:</span> <span class="debug-value">${stats.isPaused ? 'Sí' : 'No'}</span></div>
            `;
        }
        
        // 🔧 OPTIMIZACIÓN: Métricas adicionales de PerformanceMonitor
        if (window.performanceMonitor) {
            const pm = performanceMonitor.getStats();
            content += `
                <div class="debug-info"><span class="debug-label">Logic:</span> <span class="debug-value">${pm.logic.toFixed(2)}ms</span></div>
                <div class="debug-info"><span class="debug-label">Render:</span> <span class="debug-value">${pm.render.toFixed(2)}ms</span></div>
                <div class="debug-info"><span class="debug-label">Frame:</span> <span class="debug-value">${pm.frame.toFixed(2)}ms</span></div>
                <div class="debug-info"><span class="debug-label">DC:</span> <span class="debug-value">${pm.drawCalls}</span></div>
                <div class="debug-info"><span class="debug-label">Logic Activas:</span> <span class="debug-value">${pm.logicUpdated ?? '-'}</span></div>
                <div class="debug-info"><span class="debug-label">Logic Skipped:</span> <span class="debug-value">${pm.logicSkipped ?? '-'}</span></div>
                <div class="debug-info"><span class="debug-label">Sprites Visibles:</span> <span class="debug-value">${pm.spritesVisible ?? '-'}</span></div>
                <div class="debug-info"><span class="debug-label">Sprites Cull:</span> <span class="debug-value">${pm.spritesCulled ?? '-'}</span></div>
                <div class="debug-info">--- Hot Spots ---</div>
                <div class="debug-info">${pm.hot1 ?? '-'}</div>
                <div class="debug-info">${pm.hot2 ?? '-'}</div>
                <div class="debug-info">${pm.hot3 ?? '-'}</div>
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
                <div class="debug-info"><span class="debug-label">X:</span> <span class="debug-value">${Math.round(camera.x)}</span></div>
                <div class="debug-info"><span class="debug-label">Y:</span> <span class="debug-value">${Math.round(camera.y)}</span></div>
                <div class="debug-info"><span class="debug-label">Zoom:</span> <span class="debug-value">${camera.zoom.toFixed(2)}x</span></div>
                <div class="debug-info"><span class="debug-label">Target Zoom:</span> <span class="debug-value">${camera.targetZoom.toFixed(2)}x</span></div>
                <div class="debug-info"><span class="debug-label">Arrastrando:</span> <span class="debug-value">${camera.isDragging ? 'Sí' : 'No'}</span></div>
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
                const maxCapacity = manager.maxCreatures || 50;
                content = `
                    <div class="debug-info">Población: ${stats.basic.aliveCreatures}/${maxCapacity}</div>
                    <div class="debug-info">Total creadas: ${stats.basic.totalCreatures}</div>
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
            
            // Estadísticas de comportamiento (Fase 2.3 + 3.1)
            if (stats.behavior) {
                const behaviorStats = stats.behavior;
                content += `
                    <div class="debug-info">--- Estados ---</div>
                    <div class="debug-info">Idle: ${behaviorStats.idleCount}</div>
                    <div class="debug-info">Seeking: ${behaviorStats.seekingCount}</div>
                    <div class="debug-info">Eating: ${behaviorStats.eatingCount}</div>
                    <div class="debug-info">Mating: ${behaviorStats.matingCount || 0}</div>
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
     * Actualiza la sección de reproducción - Sistema de género
     */
    updateReproduction() {
        const reproductionDiv = document.getElementById('debug-reproduction');
        if (!reproductionDiv) return;
        
        let content = '<div class="debug-info">Cargando reproducción...</div>';
        
        if (window.gameReproduction) {
            const reproStats = window.gameReproduction.getStats();
            
            // Estadísticas de reproducción
            content = `
                <div class="debug-info">--- Apareamientos ---</div>
                <div class="debug-info">Total: ${reproStats.totalReproductions}</div>
                <div class="debug-info">Exitosos: ${reproStats.successfulMatings}</div>
                <div class="debug-info">Cooldowns: ${reproStats.activeCooldowns}</div>
                <div class="debug-info">Dist. Gen. Prom: ${(reproStats.averageGeneticDistance * 100).toFixed(1)}%</div>
                <div class="debug-info">--- Sistema Género ---</div>
                <div class="debug-info">Rechazos: ${reproStats.maleRejections}</div>
                <div class="debug-info">Selecciones: ${reproStats.femaleSelections}</div>
                <div class="debug-info">Machos Rechazados: ${reproStats.rejectedMales}</div>
                <div class="debug-info">Hembras Eligiendo: ${reproStats.activeFemaleSelections}</div>
            `;
            
            // Estadísticas de población por género
            if (window.gameEngine && window.gameEngine.creatureManager) {
                const manager = window.gameEngine.creatureManager;
                const creatures = manager.getAllCreatures().filter(c => c.isAlive && c.dna);
                
                const males = creatures.filter(c => c.dna.isMale());
                const females = creatures.filter(c => c.dna.isFemale());
                const courtingMales = males.filter(c => 
                    c.behavior && c.behavior.states && 
                    c.behavior.states.isInState && 
                    c.behavior.states.isInState(CREATURE_STATES.COURTING)
                );
                const committedFemales = females.filter(c => 
                    c.behavior && c.behavior.states && 
                    c.behavior.states.isInState && 
                    c.behavior.states.isInState(CREATURE_STATES.COMMITTED)
                );
                const matingCount = creatures.filter(c => 
                    c.behavior && c.behavior.states && 
                    c.behavior.states.isInState && 
                    c.behavior.states.isInState(CREATURE_STATES.MATING)
                ).length;
                const nursingFemales = females.filter(c => 
                    c.behavior && c.behavior.states && 
                    c.behavior.states.isInState && 
                    c.behavior.states.isInState(CREATURE_STATES.NURSING)
                );
                
                const readyMales = males.filter(c => c.energy >= CONSTANTS.REPRODUCTION.ENERGY_THRESHOLD).length;
                const readyFemales = females.filter(c => c.energy >= CONSTANTS.REPRODUCTION.ENERGY_THRESHOLD).length;
                
                // Contar hembras con pretendientes
                const femalesWithSuitors = females.filter(f => window.gameReproduction.hasSuitors(f));
                const totalSuitors = femalesWithSuitors.reduce((sum, f) => 
                    sum + window.gameReproduction.getSuitorCount(f), 0);
                
                content += `
                    <div class="debug-info">--- Población ---</div>
                    <div class="debug-info">Machos: ${males.length} (${readyMales} listos)</div>
                    <div class="debug-info">Hembras: ${females.length} (${readyFemales} listas)</div>
                    <div class="debug-info">--- Estados ---</div>
                    <div class="debug-info">Cortejando: ${courtingMales.length}</div>
                    <div class="debug-info">Comprometidas: ${committedFemales.length}</div>
                    <div class="debug-info">Apareándose: ${matingCount}</div>
                    <div class="debug-info">Cuidando: ${nursingFemales.length}</div>
                    <div class="debug-info">--- Pretendientes ---</div>
                    <div class="debug-info">Hembras c/Pretend.: ${femalesWithSuitors.length}</div>
                    <div class="debug-info">Total Pretend.: ${totalSuitors}</div>
                    <div class="debug-info">Vel. Reducida: ${femalesWithSuitors.length > 0 ? 'Sí' : 'No'}</div>
                `;
            }
        }
        
        reproductionDiv.innerHTML = content;
    }

    /**
     * Actualiza la sección de efectos - Fase 3.1
     */
    updateEffects() {
        const effectsDiv = document.getElementById('debug-effects');
        if (!effectsDiv) return;
        
        let content = '<div class="debug-info">Sin datos</div>';
        
        if (window.gameEffects) {
            const stats = window.gameEffects.getStats();
            
            content = `
                <div class="debug-info">--- Apareamiento ---</div>
                <div class="debug-info">Conexiones: ${stats.mating.connections}</div>
                <div class="debug-info">Pulsos: ${stats.mating.seekingPulses}</div>
                <div class="debug-info">--- Nacimiento ---</div>
                <div class="debug-info">Efectos: ${stats.birth.activeEffects}</div>
                <div class="debug-info">Partículas: ${stats.birth.totalParticles}</div>
                <div class="debug-info">Prom/Efecto: ${stats.birth.averageParticlesPerEffect}</div>
            `;
        }
        
        effectsDiv.innerHTML = content;
    }

    /**
     * Actualiza la sección de población - fixfeatures
     */
    updatePopulation() {
        const populationDiv = document.getElementById('debug-population');
        if (!populationDiv) return;
        
        let content = '<div class="debug-info">Sin datos</div>';
        
        if (window.gameEngine && window.gameEngine.creatureManager && 
            window.gameEngine.creatureManager.stats) {
            const metrics = window.gameEngine.creatureManager.stats.getPopulationMetrics();
            content = `
                <div class="debug-info">Población: ${metrics.currentPopulation}</div>
                <div class="debug-info">Nacimientos: ${metrics.totalBirths}</div>
                <div class="debug-info">Muertes: ${metrics.totalDeaths}</div>
                <div class="debug-info">Tasa Natalidad: ${metrics.birthRate.toFixed(3)}/s</div>
                <div class="debug-info">Tasa Mortalidad: ${metrics.deathRate.toFixed(3)}/s</div>
                <div class="debug-info">Esperanza Vida: ${metrics.avgLifespan.toFixed(1)}s</div>
                <div class="debug-info">Gen Promedio: ${metrics.avgGeneration.toFixed(1)}</div>
                <div class="debug-info">Diversidad: ${(metrics.geneticDiversity * 100).toFixed(1)}%</div>
                <div class="debug-info">Sostenibilidad: ${metrics.sustainabilityIndex.toFixed(2)}</div>
                <div class="debug-info">Tiempo: ${metrics.timeElapsed}s</div>
            `;
        }
        
        populationDiv.innerHTML = content;
    }

    /**
     * Actualiza la sección de linajes - fixfeatures
     */
    updateLineage() {
        const lineageDiv = document.getElementById('debug-lineage');
        if (!lineageDiv) return;
        
        let content = '<div class="debug-info">Sin datos</div>';
        
        if (window.gameLineage && window.gameVisualId) {
            const lineageStats = window.gameLineage.getLineageStats();
            const visualStats = window.gameVisualId.getStats();
            
            content = `
                <div class="debug-info">Familias: ${lineageStats.totalFamilies}</div>
                <div class="debug-info">Generaciones: ${lineageStats.totalGenerations}</div>
                <div class="debug-info">Tamaño Promedio: ${lineageStats.avgFamilySize.toFixed(1)}</div>
                <div class="debug-info">Familia Antigua: ${lineageStats.oldestFamily || 'N/A'}</div>
                <div class="debug-info">Familia Grande: ${lineageStats.largestFamily || 'N/A'}</div>
                <div class="debug-info">Símbolos Usados: ${visualStats.symbolsUsed}/${visualStats.availableSymbols}</div>
                <div class="debug-info">Símbolos Libres: ${visualStats.symbolsRemaining}</div>
            `;
        }
        
        lineageDiv.innerHTML = content;
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