/**
 * GenAI - Sistema de Estados de Criaturas
 * CAJA 2 - Fase 2.3: Comportamiento de Búsqueda
 * 
 * Gestión de estados de comportamiento: Idle/Seeking/Eating
 */

const CREATURE_STATES = {
    IDLE: 'idle',
    SEEKING: 'seeking',
    EATING: 'eating',
    MATING: 'mating'
};

class CreatureStates {
    constructor(creature) {
        this.creature = creature;
        this.currentState = CREATURE_STATES.IDLE;
        this.target = null;
        this.stateTimer = 0;
        this.lastStateChange = 0;
        
        // Configuración desde utilidades
        this.config = CreatureStatesUtils.getConfig();
        
        console.log(`CreatureStates: Sistema inicializado para ${creature.id} - Estado inicial: ${this.currentState}`);
    }

    /**
     * Actualiza el sistema de estados
     */
    update(deltaTime) {
        this.stateTimer += deltaTime * 1000; // convertir a ms
        
        // Verificar transiciones de estado
        this.checkStateTransitions();
        
        // Emitir evento de actualización
        CreatureStatesUtils.emitStateUpdateEvent(
            this.creature.id, 
            this.currentState, 
            this.target, 
            this.stateTimer
        );
    }

    /**
     * Cambia el estado con validaciones
     */
    setState(newState, target = null) {
        // Verificar cooldown
        const now = Date.now();
        if (now - this.lastStateChange < this.config.changeCooldown) {
            return false;
        }
        
        // Validar transición
        if (!CreatureStatesUtils.isValidTransition(this.currentState, newState)) {
            return false;
        }
        
        const previousState = this.currentState;
        this.currentState = newState;
        this.target = target;
        this.stateTimer = 0;
        this.lastStateChange = now;
        
        // Log solo cambios importantes
        if (newState === CREATURE_STATES.SEEKING || newState === CREATURE_STATES.EATING) {
            console.log(`ESTADO: ${this.creature.id} cambió de ${previousState} a ${newState}${target ? ` (objetivo: ${target.id})` : ''}`);
        }
        
        // Emitir evento de cambio de estado
        CreatureStatesUtils.emitStateChangeEvent(
            this.creature.id, 
            previousState, 
            newState, 
            target
        );
        
        return true;
    }

        /**
     * Verifica transiciones automáticas de estado
     */
    checkStateTransitions() {
        const newState = CreatureStatesUtils.checkTimeBasedTransitions(
            this.currentState, 
            this.stateTimer, 
            this.config
        );
        
        if (newState) {
            this.setState(newState);
        }
    }

    // Getters simples
    getCurrentState() { return this.currentState; }
    getTarget() { return this.target; }
    isInState(state) { return this.currentState === state; }
    
    // Limpieza
    destroy() {
        this.creature = null;
        this.target = null;
    }
}

// Exportar constantes y clase
window.CREATURE_STATES = CREATURE_STATES;
window.CreatureStates = CreatureStates; 