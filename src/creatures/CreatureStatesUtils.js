/**
 * GenAI - Utilidades de Estados de Criaturas
 * CAJA 2 - Fase 2.3: Comportamiento de Búsqueda
 * 
 * Utilidades y validaciones para el sistema de estados
 */

class CreatureStatesUtils {
    /**
     * Verifica si una transición de estado es válida
     */
    static isValidTransition(fromState, toState) {
        const validTransitions = {
            [CREATURE_STATES.IDLE]: [CREATURE_STATES.SEEKING, CREATURE_STATES.COURTING],
            [CREATURE_STATES.SEEKING]: [CREATURE_STATES.IDLE, CREATURE_STATES.EATING, CREATURE_STATES.COURTING],
            [CREATURE_STATES.EATING]: [CREATURE_STATES.IDLE],
            [CREATURE_STATES.COURTING]: [CREATURE_STATES.MATING, CREATURE_STATES.IDLE],
            [CREATURE_STATES.MATING]: [CREATURE_STATES.NURSING, CREATURE_STATES.IDLE],
            [CREATURE_STATES.NURSING]: [CREATURE_STATES.IDLE]
        };
        
        return validTransitions[fromState]?.includes(toState) || false;
    }
    
    /**
     * Obtiene la configuración de estados desde constantes
     */
    static getConfig() {
        return {
            idleDuration: CONSTANTS.STATES ? CONSTANTS.STATES.IDLE_DURATION : 2000,
            seekingTimeout: CONSTANTS.STATES ? CONSTANTS.STATES.SEEKING_TIMEOUT : 5000,
            eatingDuration: CONSTANTS.STATES ? CONSTANTS.STATES.EATING_DURATION : 500,
            courtingDuration: CONSTANTS.STATES ? CONSTANTS.STATES.COURTING_DURATION : 3000,
            matingDuration: CONSTANTS.STATES ? CONSTANTS.STATES.MATING_DURATION : 5000,
            nursingDuration: CONSTANTS.STATES ? CONSTANTS.STATES.NURSING_DURATION : 30000,
            changeCooldown: CONSTANTS.STATES ? CONSTANTS.STATES.STATE_CHANGE_COOLDOWN : 200
        };
    }
    
    /**
     * Verifica transiciones automáticas basadas en tiempo
     */
    static checkTimeBasedTransitions(currentState, stateTimer, config) {
        switch (currentState) {
            case CREATURE_STATES.EATING:
                return stateTimer >= config.eatingDuration ? CREATURE_STATES.IDLE : null;
                
            case CREATURE_STATES.SEEKING:
                return stateTimer >= config.seekingTimeout ? CREATURE_STATES.IDLE : null;
                
            case CREATURE_STATES.COURTING:
                // COURTING ahora transiciona por distancia, no por tiempo
                // La transición se maneja en checkCourtingProcess()
                return null;
                
            case CREATURE_STATES.MATING:
                return stateTimer >= config.matingDuration ? CREATURE_STATES.IDLE : null;
                
            case CREATURE_STATES.NURSING:
                return stateTimer >= config.nursingDuration ? CREATURE_STATES.IDLE : null;
                
            default:
                return null;
        }
    }
    
    /**
     * Emite eventos de cambio de estado
     */
    static emitStateChangeEvent(creatureId, previousState, newState, target) {
        if (window.eventBus) {
            eventBus.emit('creature:state_changed', {
                id: creatureId,
                previousState: previousState,
                newState: newState,
                target: target
            });
        }
    }
    
    /**
     * Emite eventos de actualización de estado
     */
    static emitStateUpdateEvent(creatureId, state, target, timer) {
        if (window.eventBus) {
            eventBus.emit('creature:state_updated', {
                id: creatureId,
                state: state,
                target: target,
                timer: timer
            });
        }
    }
}

// Hacer disponible globalmente
window.CreatureStatesUtils = CreatureStatesUtils; 