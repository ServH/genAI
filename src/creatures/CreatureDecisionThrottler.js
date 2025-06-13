/**
 * GenAI - Sistema de Throttling de Decisiones
 * RAMA PERFORMANCE - Optimización de Comportamiento
 * 
 * Limita la frecuencia de decisiones complejas para mejorar performance
 */

class CreatureDecisionThrottler {
    constructor(creature) {
        this.creature = creature;
        this.decisionCooldown = 0;
        this.decisionInterval = this.generateRandomInterval();
        this.lastDecisionTime = 0;
        this.pendingDecisions = [];
        
        if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            console.log(`DecisionThrottler: Inicializado para ${creature.id} con intervalo ${this.decisionInterval}s`);
        }
    }

    /**
     * Genera un intervalo aleatorio para las decisiones
     */
    generateRandomInterval() {
        const min = CONSTANTS.PERFORMANCE.DECISION_COOLDOWN_MIN;
        const max = CONSTANTS.PERFORMANCE.DECISION_COOLDOWN_MAX;
        return min + Math.random() * (max - min);
    }

    /**
     * Actualiza el throttler
     */
    update(deltaTime) {
        this.decisionCooldown -= deltaTime;
        
        // Si el cooldown ha terminado, permitir nueva decisión
        if (this.decisionCooldown <= 0) {
            this.decisionCooldown = this.decisionInterval;
            this.lastDecisionTime = Date.now();
            return true; // Puede tomar decisiones
        }
        
        return false; // Debe esperar
    }

    /**
     * Verifica si puede tomar una decisión compleja
     */
    canMakeDecision() {
        return this.decisionCooldown <= 0;
    }

    /**
     * Programa una decisión para el próximo ciclo
     */
    scheduleDecision(decisionType, priority = 1) {
        const decision = {
            type: decisionType,
            priority,
            timestamp: Date.now()
        };
        
        this.pendingDecisions.push(decision);
        this.pendingDecisions.sort((a, b) => b.priority - a.priority);
        
        if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            console.log(`DecisionThrottler: Decisión programada: ${decisionType} (prioridad: ${priority})`);
        }
    }

    /**
     * Obtiene la próxima decisión pendiente
     */
    getNextDecision() {
        return this.pendingDecisions.shift();
    }

    /**
     * Verifica si hay decisiones pendientes
     */
    hasPendingDecisions() {
        return this.pendingDecisions.length > 0;
    }

    /**
     * Limpia decisiones obsoletas
     */
    cleanupOldDecisions() {
        const now = Date.now();
        const maxAge = 5000; // 5 segundos
        
        this.pendingDecisions = this.pendingDecisions.filter(
            decision => now - decision.timestamp < maxAge
        );
    }

    /**
     * Obtiene el tiempo restante hasta la próxima decisión
     */
    getTimeUntilNextDecision() {
        return Math.max(0, this.decisionCooldown);
    }

    /**
     * Fuerza el reset del cooldown (para situaciones críticas)
     */
    forceReset() {
        this.decisionCooldown = 0;
        
        if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            console.log(`DecisionThrottler: Reset forzado para ${this.creature.id}`);
        }
    }

    /**
     * Obtiene estadísticas del throttler
     */
    getStats() {
        return {
            cooldown: this.decisionCooldown,
            interval: this.decisionInterval,
            pendingDecisions: this.pendingDecisions.length,
            canDecide: this.canMakeDecision(),
            timeUntilNext: this.getTimeUntilNextDecision()
        };
    }

    /**
     * Destruye el sistema
     */
    destroy() {
        this.pendingDecisions = [];
        this.creature = null;
        
        if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            console.log('DecisionThrottler: Sistema destruido');
        }
    }
}

// Hacer disponible globalmente
window.CreatureDecisionThrottler = CreatureDecisionThrottler; 