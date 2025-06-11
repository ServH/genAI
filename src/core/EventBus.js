/**
 * GenAI - Sistema de Eventos Core
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Maneja la comunicación básica entre módulos
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
        this.debugMode = false;
    }

    /**
     * Suscribe un listener a un evento
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
     * Emite un evento con datos opcionales
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
            
            this.onceEvents.delete(eventName);
        }
        
        if (this.debugMode && listenersExecuted > 0) {
            console.log(`EventBus: Evento '${eventName}' emitido a ${listenersExecuted} listeners`);
        }
        
        return listenersExecuted;
    }



    /**
     * Activa o desactiva el modo debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`EventBus: Modo debug ${enabled ? 'activado' : 'desactivado'}`);
    }

    /**
     * Genera un ID único para listeners
     */
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Limpia todos los recursos
     */
    destroy() {
        this.events.clear();
        this.onceEvents.clear();
        console.log('EventBus: Destruido');
    }
}

// Crear instancia global
const eventBus = new EventBus();

// Hacer disponible globalmente
window.EventBus = EventBus;
window.eventBus = eventBus; 