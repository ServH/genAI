/**
 * GenAI - Sistema de Eventos Global
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Maneja la comunicación entre módulos mediante eventos
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
        this.debugMode = false;
    }

    /**
     * Suscribe un listener a un evento
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función callback
     * @param {Object} context - Contexto para el callback (opcional)
     */
    on(eventName, callback, context = null) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        
        const listener = {
            callback,
            context,
            id: this.generateListenerId()
        };
        
        this.events.get(eventName).push(listener);
        
        if (this.debugMode) {
            console.log(`EventBus: Listener agregado para '${eventName}'`);
        }
        
        return listener.id;
    }

    /**
     * Suscribe un listener que se ejecuta solo una vez
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función callback
     * @param {Object} context - Contexto para el callback (opcional)
     */
    once(eventName, callback, context = null) {
        if (!this.onceEvents.has(eventName)) {
            this.onceEvents.set(eventName, []);
        }
        
        const listener = {
            callback,
            context,
            id: this.generateListenerId()
        };
        
        this.onceEvents.get(eventName).push(listener);
        
        if (this.debugMode) {
            console.log(`EventBus: Listener 'once' agregado para '${eventName}'`);
        }
        
        return listener.id;
    }

    /**
     * Desuscribe un listener de un evento
     * @param {string} eventName - Nombre del evento
     * @param {string|Function} listenerIdOrCallback - ID del listener o función callback
     */
    off(eventName, listenerIdOrCallback) {
        // Remover de eventos normales
        if (this.events.has(eventName)) {
            const listeners = this.events.get(eventName);
            const filteredListeners = listeners.filter(listener => {
                if (typeof listenerIdOrCallback === 'string') {
                    return listener.id !== listenerIdOrCallback;
                } else {
                    return listener.callback !== listenerIdOrCallback;
                }
            });
            
            if (filteredListeners.length === 0) {
                this.events.delete(eventName);
            } else {
                this.events.set(eventName, filteredListeners);
            }
        }
        
        // Remover de eventos 'once'
        if (this.onceEvents.has(eventName)) {
            const listeners = this.onceEvents.get(eventName);
            const filteredListeners = listeners.filter(listener => {
                if (typeof listenerIdOrCallback === 'string') {
                    return listener.id !== listenerIdOrCallback;
                } else {
                    return listener.callback !== listenerIdOrCallback;
                }
            });
            
            if (filteredListeners.length === 0) {
                this.onceEvents.delete(eventName);
            } else {
                this.onceEvents.set(eventName, filteredListeners);
            }
        }
        
        if (this.debugMode) {
            console.log(`EventBus: Listener removido de '${eventName}'`);
        }
    }

    /**
     * Emite un evento con datos opcionales
     * @param {string} eventName - Nombre del evento
     * @param {*} data - Datos a enviar (opcional)
     */
    emit(eventName, data = null) {
        let listenersExecuted = 0;
        
        // Ejecutar listeners normales
        if (this.events.has(eventName)) {
            const listeners = this.events.get(eventName);
            listeners.forEach(listener => {
                try {
                    if (listener.context) {
                        listener.callback.call(listener.context, data);
                    } else {
                        listener.callback(data);
                    }
                    listenersExecuted++;
                } catch (error) {
                    console.error(`EventBus: Error ejecutando listener para '${eventName}':`, error);
                }
            });
        }
        
        // Ejecutar listeners 'once' y removerlos
        if (this.onceEvents.has(eventName)) {
            const listeners = this.onceEvents.get(eventName);
            listeners.forEach(listener => {
                try {
                    if (listener.context) {
                        listener.callback.call(listener.context, data);
                    } else {
                        listener.callback(data);
                    }
                    listenersExecuted++;
                } catch (error) {
                    console.error(`EventBus: Error ejecutando listener 'once' para '${eventName}':`, error);
                }
            });
            
            // Remover todos los listeners 'once' después de ejecutarlos
            this.onceEvents.delete(eventName);
        }
        
        if (this.debugMode && listenersExecuted > 0) {
            console.log(`EventBus: Evento '${eventName}' emitido a ${listenersExecuted} listeners`);
        }
        
        return listenersExecuted;
    }

    /**
     * Remueve todos los listeners de un evento específico
     * @param {string} eventName - Nombre del evento
     */
    removeAllListeners(eventName) {
        if (eventName) {
            this.events.delete(eventName);
            this.onceEvents.delete(eventName);
            
            if (this.debugMode) {
                console.log(`EventBus: Todos los listeners removidos de '${eventName}'`);
            }
        } else {
            // Si no se especifica evento, remover todos
            this.events.clear();
            this.onceEvents.clear();
            
            if (this.debugMode) {
                console.log('EventBus: Todos los listeners removidos');
            }
        }
    }

    /**
     * Obtiene la lista de eventos registrados
     * @returns {Array} Lista de nombres de eventos
     */
    getEventNames() {
        const normalEvents = Array.from(this.events.keys());
        const onceEvents = Array.from(this.onceEvents.keys());
        return [...new Set([...normalEvents, ...onceEvents])];
    }

    /**
     * Obtiene el número de listeners para un evento
     * @param {string} eventName - Nombre del evento
     * @returns {number} Número de listeners
     */
    getListenerCount(eventName) {
        const normalCount = this.events.has(eventName) ? this.events.get(eventName).length : 0;
        const onceCount = this.onceEvents.has(eventName) ? this.onceEvents.get(eventName).length : 0;
        return normalCount + onceCount;
    }

    /**
     * Activa o desactiva el modo debug
     * @param {boolean} enabled - Estado del debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`EventBus: Modo debug ${enabled ? 'activado' : 'desactivado'}`);
    }

    /**
     * Genera un ID único para listeners
     * @returns {string} ID único
     */
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Limpia todos los recursos
     */
    destroy() {
        this.removeAllListeners();
        console.log('EventBus: Destruido');
    }
}

// Crear instancia global
const eventBus = new EventBus();

// Hacer disponible globalmente
window.EventBus = EventBus;
window.eventBus = eventBus; 