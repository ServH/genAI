/**
 * GenAI - Utilidades del EventBus
 * CAJA 1 - Fase 1.1: Sistema Core
 */

class EventBusUtils {
    constructor(eventBusInstance) {
        this.eventBus = eventBusInstance;
        
        // Agregar métodos al EventBus principal
        this.eventBus.off = this.off.bind(this);
        this.eventBus.removeAllListeners = this.removeAllListeners.bind(this);
        this.eventBus.getEventNames = this.getEventNames.bind(this);
        this.eventBus.getListenerCount = this.getListenerCount.bind(this);
    }

    /**
     * Desuscribe un listener de un evento
     */
    off(eventName, listenerIdOrCallback) {
        // Remover de eventos normales
        if (this.eventBus.events.has(eventName)) {
            const listeners = this.eventBus.events.get(eventName);
            const filteredListeners = listeners.filter(listener => {
                if (typeof listenerIdOrCallback === 'string') {
                    return listener.id !== listenerIdOrCallback;
                } else {
                    return listener.callback !== listenerIdOrCallback;
                }
            });
            
            if (filteredListeners.length === 0) {
                this.eventBus.events.delete(eventName);
            } else {
                this.eventBus.events.set(eventName, filteredListeners);
            }
        }
        
        // Remover de eventos 'once'
        if (this.eventBus.onceEvents.has(eventName)) {
            const listeners = this.eventBus.onceEvents.get(eventName);
            const filteredListeners = listeners.filter(listener => {
                if (typeof listenerIdOrCallback === 'string') {
                    return listener.id !== listenerIdOrCallback;
                } else {
                    return listener.callback !== listenerIdOrCallback;
                }
            });
            
            if (filteredListeners.length === 0) {
                this.eventBus.onceEvents.delete(eventName);
            } else {
                this.eventBus.onceEvents.set(eventName, filteredListeners);
            }
        }
        
        if (this.eventBus.debugMode) {
            console.log(`EventBus: Listener removido de '${eventName}'`);
        }
    }

    /**
     * Remueve todos los listeners de un evento específico
     */
    removeAllListeners(eventName) {
        if (eventName) {
            this.eventBus.events.delete(eventName);
            this.eventBus.onceEvents.delete(eventName);
            
            if (this.eventBus.debugMode) {
                console.log(`EventBus: Todos los listeners removidos de '${eventName}'`);
            }
        } else {
            this.eventBus.events.clear();
            this.eventBus.onceEvents.clear();
            
            if (this.eventBus.debugMode) {
                console.log('EventBus: Todos los listeners removidos');
            }
        }
    }

    /**
     * Obtiene la lista de eventos registrados
     */
    getEventNames() {
        const normalEvents = Array.from(this.eventBus.events.keys());
        const onceEvents = Array.from(this.eventBus.onceEvents.keys());
        return [...new Set([...normalEvents, ...onceEvents])];
    }

    /**
     * Obtiene el número de listeners para un evento
     */
    getListenerCount(eventName) {
        const normalCount = this.eventBus.events.has(eventName) ? 
            this.eventBus.events.get(eventName).length : 0;
        const onceCount = this.eventBus.onceEvents.has(eventName) ? 
            this.eventBus.onceEvents.get(eventName).length : 0;
        return normalCount + onceCount;
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
const eventBusUtils = new EventBusUtils(eventBus);

// Hacer disponible globalmente
window.EventBusUtils = EventBusUtils;
window.eventBusUtils = eventBusUtils; 