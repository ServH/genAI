/**
 * GenAI - Debug Overlay Mejorado
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Sistema de debug visual con información detallada
 */

class DebugOverlay {
    constructor() {
        this.isVisible = false;
        this.updateInterval = 100; // ms
        this.lastUpdate = 0;
        this.panels = new Map();
        this.container = null;
        
        this.init();
    }

    /**
     * Inicializa el sistema de debug
     */
    init() {
        this.createContainer();
        this.setupPanels();
        this.setupEventListeners();
        
        console.log('DebugOverlay: Sistema inicializado');
        
        if (window.eventBus) {
            eventBus.emit('debug:initialized');
        }
    }

    /**
     * Crea el contenedor principal del debug
     */
    createContainer() {
        this.container = document.getElementById('debug-overlay');
        if (!this.container) {
            console.error('DebugOverlay: No se encontró el elemento debug-overlay');
            return;
        }
        
        // Limpiar contenido existente
        this.container.innerHTML = '';
        
        // Crear estructura mejorada
        this.container.innerHTML = `
            <div class="debug-panel-container">
                <div class="debug-header">
                    <h3>GenAI Debug</h3>
                    <div class="debug-controls">
                        <button id="debug-minimize" class="debug-btn">-</button>
                        <button id="debug-close" class="debug-btn">×</button>
                    </div>
                </div>
                <div class="debug-content" id="debug-main-content">
                    <div class="debug-tabs">
                        <button class="debug-tab active" data-panel="performance">Performance</button>
                        <button class="debug-tab" data-panel="systems">Systems</button>
                        <button class="debug-tab" data-panel="events">Events</button>
                        <button class="debug-tab" data-panel="random">Random</button>
                    </div>
                    <div class="debug-panels">
                        <div id="debug-panel-performance" class="debug-panel active"></div>
                        <div id="debug-panel-systems" class="debug-panel"></div>
                        <div id="debug-panel-events" class="debug-panel"></div>
                        <div id="debug-panel-random" class="debug-panel"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Configura los paneles de debug
     */
    setupPanels() {
        // Panel de Performance
        this.panels.set('performance', {
            element: document.getElementById('debug-panel-performance'),
            update: this.updatePerformancePanel.bind(this)
        });
        
        // Panel de Systems
        this.panels.set('systems', {
            element: document.getElementById('debug-panel-systems'),
            update: this.updateSystemsPanel.bind(this)
        });
        
        // Panel de Events
        this.panels.set('events', {
            element: document.getElementById('debug-panel-events'),
            update: this.updateEventsPanel.bind(this)
        });
        
        // Panel de Random
        this.panels.set('random', {
            element: document.getElementById('debug-panel-random'),
            update: this.updateRandomPanel.bind(this)
        });
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Botones de control
        const minimizeBtn = document.getElementById('debug-minimize');
        const closeBtn = document.getElementById('debug-close');
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
        
        // Tabs
        const tabs = document.querySelectorAll('.debug-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.panel);
            });
        });
        
        // Eventos del sistema
        if (window.eventBus) {
            eventBus.on('time:paused', () => this.onGamePaused());
            eventBus.on('time:resumed', () => this.onGameResumed());
        }
    }

    /**
     * Actualiza el panel de performance
     */
    updatePerformancePanel() {
        const panel = this.panels.get('performance').element;
        if (!panel) return;
        
        const timeInfo = window.gameTime ? gameTime.getDebugInfo() : null;
        const engineInfo = window.gameEngine ? {
            frameCount: gameEngine.frameCount,
            isRunning: gameEngine.isRunning
        } : null;
        
        panel.innerHTML = `
            <div class="debug-section">
                <h4>Time System</h4>
                ${timeInfo ? `
                    <div class="debug-row">
                        <span>FPS:</span>
                        <span class="${timeInfo.fps < 50 ? 'debug-warning' : 'debug-good'}">${timeInfo.fps}</span>
                    </div>
                    <div class="debug-row">
                        <span>Avg FPS:</span>
                        <span>${timeInfo.averageFps}</span>
                    </div>
                    <div class="debug-row">
                        <span>Delta Time:</span>
                        <span>${timeInfo.deltaTime}ms</span>
                    </div>
                    <div class="debug-row">
                        <span>Smoothed:</span>
                        <span>${timeInfo.smoothedDeltaTime}ms</span>
                    </div>
                    <div class="debug-row">
                        <span>Total Time:</span>
                        <span>${timeInfo.totalTime}s</span>
                    </div>
                    <div class="debug-row">
                        <span>Time Scale:</span>
                        <span>${timeInfo.timeScale}</span>
                    </div>
                    <div class="debug-row">
                        <span>Paused:</span>
                        <span class="${timeInfo.isPaused ? 'debug-warning' : 'debug-good'}">${timeInfo.isPaused}</span>
                    </div>
                ` : '<div class="debug-error">Time system not available</div>'}
            </div>
            
            <div class="debug-section">
                <h4>Engine</h4>
                ${engineInfo ? `
                    <div class="debug-row">
                        <span>Frame Count:</span>
                        <span>${engineInfo.frameCount}</span>
                    </div>
                    <div class="debug-row">
                        <span>Running:</span>
                        <span class="${engineInfo.isRunning ? 'debug-good' : 'debug-error'}">${engineInfo.isRunning}</span>
                    </div>
                ` : '<div class="debug-error">Engine not available</div>'}
            </div>
            
            <div class="debug-section">
                <h4>Memory</h4>
                <div class="debug-row">
                    <span>Used JS Heap:</span>
                    <span>${this.formatBytes(performance.memory?.usedJSHeapSize || 0)}</span>
                </div>
                <div class="debug-row">
                    <span>Total JS Heap:</span>
                    <span>${this.formatBytes(performance.memory?.totalJSHeapSize || 0)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Actualiza el panel de sistemas
     */
    updateSystemsPanel() {
        const panel = this.panels.get('systems').element;
        if (!panel) return;
        
        panel.innerHTML = `
            <div class="debug-section">
                <h4>Core Systems</h4>
                <div class="debug-row">
                    <span>Engine:</span>
                    <span class="${window.gameEngine ? 'debug-good' : 'debug-error'}">${window.gameEngine ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="debug-row">
                    <span>EventBus:</span>
                    <span class="${window.eventBus ? 'debug-good' : 'debug-error'}">${window.eventBus ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="debug-row">
                    <span>Time:</span>
                    <span class="${window.gameTime ? 'debug-good' : 'debug-error'}">${window.gameTime ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="debug-row">
                    <span>Random:</span>
                    <span class="${window.gameRandom ? 'debug-good' : 'debug-error'}">${window.gameRandom ? 'Active' : 'Inactive'}</span>
                </div>
            </div>
            
            <div class="debug-section">
                <h4>Phase Info</h4>
                <div class="debug-row">
                    <span>Current Phase:</span>
                    <span>${CONSTANTS.CURRENT_PHASE}</span>
                </div>
                <div class="debug-row">
                    <span>Version:</span>
                    <span>${CONSTANTS.VERSION}</span>
                </div>
            </div>
            
            <div class="debug-section">
                <h4>Future Systems</h4>
                <div class="debug-row">
                    <span>Creatures:</span>
                    <span class="debug-pending">TODO: Fase 2.0</span>
                </div>
                <div class="debug-row">
                    <span>Genetics:</span>
                    <span class="debug-pending">TODO: Fase 3.0</span>
                </div>
                <div class="debug-row">
                    <span>World:</span>
                    <span class="debug-pending">TODO: Fase 4.0</span>
                </div>
            </div>
        `;
    }

    /**
     * Actualiza el panel de eventos
     */
    updateEventsPanel() {
        const panel = this.panels.get('events').element;
        if (!panel) return;
        
        const eventBusInfo = window.eventBus ? {
            eventNames: eventBus.getEventNames(),
            totalEvents: eventBus.getEventNames().length
        } : null;
        
        panel.innerHTML = `
            <div class="debug-section">
                <h4>Event System</h4>
                ${eventBusInfo ? `
                    <div class="debug-row">
                        <span>Total Events:</span>
                        <span>${eventBusInfo.totalEvents}</span>
                    </div>
                    <div class="debug-row">
                        <span>Registered Events:</span>
                        <div class="debug-list">
                            ${eventBusInfo.eventNames.map(name => `
                                <div class="debug-list-item">
                                    <span>${name}</span>
                                    <span class="debug-count">${eventBus.getListenerCount(name)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : '<div class="debug-error">EventBus not available</div>'}
            </div>
            
            <div class="debug-section">
                <h4>Time Events</h4>
                ${window.gameTime ? `
                    <div class="debug-row">
                        <span>Scheduled Events:</span>
                        <span>${gameTime.getDebugInfo().timeEvents}</span>
                    </div>
                ` : '<div class="debug-error">Time system not available</div>'}
            </div>
        `;
    }

    /**
     * Actualiza el panel de random
     */
    updateRandomPanel() {
        const panel = this.panels.get('random').element;
        if (!panel) return;
        
        const randomInfo = window.gameRandom ? gameRandom.getDebugInfo() : null;
        
        panel.innerHTML = `
            <div class="debug-section">
                <h4>Random Generator</h4>
                ${randomInfo ? `
                    <div class="debug-row">
                        <span>Seed:</span>
                        <span>${randomInfo.seed}</span>
                    </div>
                    <div class="debug-row">
                        <span>Calls:</span>
                        <span>${randomInfo.calls}</span>
                    </div>
                    <div class="debug-row">
                        <span>Current State:</span>
                        <span>${randomInfo.currentState}</span>
                    </div>
                ` : '<div class="debug-error">Random system not available</div>'}
            </div>
            
            <div class="debug-section">
                <h4>Test Values</h4>
                <div class="debug-row">
                    <span>Random Float:</span>
                    <span>${window.gameRandom ? gameRandom.randomFloat(0, 100).toFixed(2) : 'N/A'}</span>
                </div>
                <div class="debug-row">
                    <span>Random Int:</span>
                    <span>${window.gameRandom ? gameRandom.randomInt(1, 100) : 'N/A'}</span>
                </div>
                <div class="debug-row">
                    <span>Random Bool:</span>
                    <span>${window.gameRandom ? gameRandom.randomBool() : 'N/A'}</span>
                </div>
            </div>
        `;
    }

    /**
     * Cambia de tab activo
     * @param {string} panelName - Nombre del panel
     */
    switchTab(panelName) {
        // Desactivar todos los tabs y paneles
        document.querySelectorAll('.debug-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.debug-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Activar el tab y panel seleccionado
        const tab = document.querySelector(`[data-panel="${panelName}"]`);
        const panel = document.getElementById(`debug-panel-${panelName}`);
        
        if (tab) tab.classList.add('active');
        if (panel) panel.classList.add('active');
        
        // Actualizar el panel inmediatamente
        const panelInfo = this.panels.get(panelName);
        if (panelInfo && panelInfo.update) {
            panelInfo.update();
        }
    }

    /**
     * Actualiza todos los paneles visibles
     */
    update() {
        if (!this.isVisible) return;
        
        const now = performance.now();
        if (now - this.lastUpdate < this.updateInterval) return;
        
        // Actualizar solo el panel activo
        const activePanel = document.querySelector('.debug-panel.active');
        if (activePanel) {
            const panelId = activePanel.id.replace('debug-panel-', '');
            const panelInfo = this.panels.get(panelId);
            if (panelInfo && panelInfo.update) {
                panelInfo.update();
            }
        }
        
        this.lastUpdate = now;
    }

    /**
     * Muestra el debug overlay
     */
    show() {
        if (this.container) {
            this.container.classList.remove('hidden');
            this.isVisible = true;
            console.log('DebugOverlay: Mostrado');
            
            if (window.eventBus) {
                eventBus.emit('debug:shown');
            }
        }
    }

    /**
     * Oculta el debug overlay
     */
    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
            this.isVisible = false;
            console.log('DebugOverlay: Ocultado');
            
            if (window.eventBus) {
                eventBus.emit('debug:hidden');
            }
        }
    }

    /**
     * Alterna la visibilidad del debug overlay
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Minimiza/maximiza el debug overlay
     */
    toggleMinimize() {
        const content = document.getElementById('debug-main-content');
        if (content) {
            content.classList.toggle('minimized');
        }
    }

    /**
     * Maneja el evento de juego pausado
     */
    onGamePaused() {
        console.log('DebugOverlay: Juego pausado detectado');
    }

    /**
     * Maneja el evento de juego reanudado
     */
    onGameResumed() {
        console.log('DebugOverlay: Juego reanudado detectado');
    }

    /**
     * Formatea bytes en formato legible
     * @param {number} bytes - Número de bytes
     * @returns {string} Formato legible
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Limpia todos los recursos
     */
    destroy() {
        if (window.eventBus) {
            eventBus.removeAllListeners('time:paused');
            eventBus.removeAllListeners('time:resumed');
        }
        
        this.panels.clear();
        console.log('DebugOverlay: Destruido');
    }
}

// Crear instancia global
const debugOverlay = new DebugOverlay();

// Hacer disponible globalmente
window.DebugOverlay = DebugOverlay;
window.debugOverlay = debugOverlay; 