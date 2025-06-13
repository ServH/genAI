/**
 * GenAI - Sistema de Comportamiento Optimizado para Criaturas
 * RAMA PERFORMANCE - Optimización de Decisiones
 * 
 * Versión optimizada que usa throttling para decisiones complejas
 */

class CreatureBehaviorOptimized {
    constructor(creature) {
        this.creature = creature;
        
        // Sistemas modulares
        this.vision = new CreatureVision(creature);
        this.states = new CreatureStates(creature);
        this.movement = new CreatureMovement(creature);
        this.decisionThrottler = new CreatureDecisionThrottler(creature);
        
        // Cache de búsquedas
        this.lastFoodSearch = null;
        this.lastMateSearch = null;
        this.searchCacheTime = 0;
        this.cacheValidTime = 1000; // 1 segundo de validez
        
        // Estadísticas de performance
        this.stats = {
            decisionsSkipped: 0,
            decisionsExecuted: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            console.log(`CreatureBehaviorOptimized: Inicializado para ${creature.id}`);
        }
    }

    /**
     * Actualización principal optimizada
     */
    update(deltaTime) {
        if (!this.creature.isAlive) return;
        
        // Actualizar throttler
        const canMakeDecisions = this.decisionThrottler.update(deltaTime);
        
        // El movimiento SIEMPRE se actualiza (barato)
        this.updateMovement(deltaTime);
        
        // Acciones inmediatas (baratas)
        this.checkFoodConsumption();
        this.checkNursingProcess(deltaTime);
        
        // Decisiones complejas solo si el throttler lo permite
        if (canMakeDecisions) {
            this.executeComplexDecisions(deltaTime);
            this.stats.decisionsExecuted++;
        } else {
            this.stats.decisionsSkipped++;
        }
        
        // Limpiar cache obsoleto
        this.cleanupSearchCache();
    }

    /**
     * Actualiza el movimiento (siempre ejecutado)
     */
    updateMovement(deltaTime) {
        const currentState = this.states.getCurrentState();
        const target = this.states.getTarget();
        this.movement.update(deltaTime, currentState, target);
    }

    /**
     * Ejecuta decisiones complejas con throttling
     */
    executeComplexDecisions(deltaTime) {
        // Actualizar sistemas de comportamiento
        this.updateBehaviorSystems(deltaTime);
        
        // Procesar decisiones pendientes
        this.processPendingDecisions();
        
        // Emitir evento de actualización (solo si debug está activo)
        if (CONSTANTS.DEBUG.EMIT_RENDER_EVENTS) {
            this.emitUpdateEvent();
        }
    }

    /**
     * Actualiza los sistemas de comportamiento
     */
    updateBehaviorSystems(deltaTime) {
        this.vision.update(deltaTime);
        this.states.update(deltaTime);
        
        const currentState = this.states.getCurrentState();
        
        // Ejecutar comportamiento según estado
        switch (currentState) {
            case CREATURE_STATES.IDLE:
                this.handleIdleState();
                break;
            case CREATURE_STATES.COURTING:
                this.checkCourtingProcess();
                break;
            case CREATURE_STATES.COMMITTED:
                this.checkCommittedProcess();
                break;
            case CREATURE_STATES.MATING:
                this.checkMatingProcess();
                break;
            case CREATURE_STATES.NURSING:
                // Ya manejado en updateMovement
                break;
            case CREATURE_STATES.SEEKING:
                this.checkIfShouldFollowMother();
                break;
        }
    }

    /**
     * Maneja el estado IDLE con búsquedas optimizadas
     */
    handleIdleState() {
        // Priorizar reproducción si es posible
        if (this.canReproduce()) {
            this.scheduleDecision('searchMate', 3);
        }
        // Buscar comida si tiene hambre
        else if (this.needsFood()) {
            this.scheduleDecision('searchFood', 2);
        }
    }

    /**
     * Programa una decisión para el próximo ciclo
     */
    scheduleDecision(type, priority = 1) {
        this.decisionThrottler.scheduleDecision(type, priority);
    }

    /**
     * Procesa decisiones pendientes
     */
    processPendingDecisions() {
        while (this.decisionThrottler.hasPendingDecisions()) {
            const decision = this.decisionThrottler.getNextDecision();
            if (decision) {
                this.executeDecision(decision);
            }
        }
    }

    /**
     * Ejecuta una decisión específica
     */
    executeDecision(decision) {
        switch (decision.type) {
            case 'searchMate':
                this.searchForMateOptimized();
                break;
            case 'searchFood':
                this.searchForFoodOptimized();
                break;
            default:
                if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
                    console.log(`CreatureBehaviorOptimized: Decisión desconocida: ${decision.type}`);
                }
        }
    }

    /**
     * Búsqueda optimizada de pareja con cache
     */
    searchForMateOptimized() {
        // Verificar cache primero
        if (this.isSearchCacheValid() && this.lastMateSearch) {
            this.stats.cacheHits++;
            if (this.lastMateSearch.mate && this.isValidMate(this.lastMateSearch.mate)) {
                this.initiateCourtship(this.lastMateSearch.mate);
                return;
            }
        }
        
        this.stats.cacheMisses++;
        
        // Búsqueda real (costosa)
        const mate = this.findNearestMate();
        this.lastMateSearch = { mate, timestamp: Date.now() };
        
        if (mate) {
            this.initiateCourtship(mate);
        }
    }

    /**
     * Búsqueda optimizada de comida con cache
     */
    searchForFoodOptimized() {
        // Verificar cache primero
        if (this.isSearchCacheValid() && this.lastFoodSearch) {
            this.stats.cacheHits++;
            if (this.lastFoodSearch.food && this.isValidFood(this.lastFoodSearch.food)) {
                this.states.setState(CREATURE_STATES.SEEKING, this.lastFoodSearch.food);
                return;
            }
        }
        
        this.stats.cacheMisses++;
        
        // Búsqueda real (costosa)
        const food = this.vision.getNearestVisibleFood(window.gameResources?.getAllFood() || []);
        this.lastFoodSearch = { food, timestamp: Date.now() };
        
        if (food) {
            this.states.setState(CREATURE_STATES.SEEKING, food);
        }
    }

    /**
     * Verifica si el cache de búsqueda es válido
     */
    isSearchCacheValid() {
        return Date.now() - this.searchCacheTime < this.cacheValidTime;
    }

    /**
     * Limpia el cache de búsqueda obsoleto
     */
    cleanupSearchCache() {
        const now = Date.now();
        if (now - this.searchCacheTime > this.cacheValidTime) {
            this.lastFoodSearch = null;
            this.lastMateSearch = null;
            this.searchCacheTime = now;
        }
    }

    /**
     * Verifica si una pareja sigue siendo válida
     */
    isValidMate(mate) {
        return mate && mate.isAlive && 
               this.distanceTo(mate.x, mate.y) < CONSTANTS.PERFORMANCE.MAX_SEARCH_DISTANCE;
    }

    /**
     * Verifica si la comida sigue siendo válida
     */
    isValidFood(food) {
        return food && food.active && 
               this.distanceTo(food.x, food.y) < CONSTANTS.PERFORMANCE.MAX_SEARCH_DISTANCE;
    }

    /**
     * Encuentra la pareja más cercana (versión optimizada)
     */
    findNearestMate() {
        const creatures = window.gameCreatureManager?.getAllCreatures() || [];
        const maxDistance = CONSTANTS.PERFORMANCE.MAX_SEARCH_DISTANCE;
        
        let nearestMate = null;
        let nearestDistance = maxDistance;
        
        for (const creature of creatures) {
            if (!this.isValidMateCandidate(creature)) continue;
            
            const distance = this.distanceTo(creature.x, creature.y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestMate = creature;
            }
        }
        
        return nearestMate;
    }

    /**
     * Verifica si una criatura es candidata válida para apareamiento
     */
    isValidMateCandidate(creature) {
        return creature !== this.creature &&
               creature.isAlive &&
               this.canMateWith(creature) &&
               this.distanceTo(creature.x, creature.y) < CONSTANTS.PERFORMANCE.MAX_SEARCH_DISTANCE;
    }

    /**
     * Verifica si puede reproducirse
     */
    canReproduce() {
        return this.creature.growthSystem?.canReproduce() &&
               this.creature.getEnergyPercentage() >= (CONSTANTS.REPRODUCTION.ENERGY_THRESHOLD / 100);
    }

    /**
     * Verifica si necesita comida
     */
    needsFood() {
        return this.creature.getEnergyPercentage() < 0.8; // 80%
    }

    /**
     * Verifica si puede aparearse con otra criatura
     */
    canMateWith(other) {
        // Lógica simplificada para performance
        return other.growthSystem?.canReproduce() &&
               other.getEnergyPercentage() >= (CONSTANTS.REPRODUCTION.ENERGY_THRESHOLD / 100);
    }

    /**
     * Inicia el cortejo con una pareja
     */
    initiateCourtship(mate) {
        this.states.setState(CREATURE_STATES.COURTING, mate);
        
        if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            console.log(`CreatureBehaviorOptimized: ${this.creature.id} inicia cortejo con ${mate.id}`);
        }
    }

    // Métodos heredados (simplificados para performance)
    checkFoodConsumption() {
        const currentState = this.states.getCurrentState();
        if (currentState !== CREATURE_STATES.SEEKING) return;
        
        const target = this.states.getTarget();
        if (!target || !target.active) return;
        
        if (this.isNear(target.x, target.y, CONSTANTS.RESOURCES.DETECTION_RADIUS)) {
            const energyGained = this.creature.restoreEnergy(CONSTANTS.RESOURCES.ENERGY_VALUE);
            
            if (window.gameResources) {
                window.gameResources.removeFood(target);
            }
            
            this.states.setState(CREATURE_STATES.EATING);
            
            if (CONSTANTS.DEBUG.EMIT_RENDER_EVENTS && window.eventBus) {
                window.eventBus.emit('food:consumed', {
                    creatureId: this.creature.id,
                    energyGained,
                    position: { x: target.x, y: target.y }
                });
            }
        }
    }

    checkCourtingProcess() {
        // Implementación simplificada
        const target = this.states.getTarget();
        if (!target || !target.isAlive) {
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        if (this.isNear(target.x, target.y, CONSTANTS.REPRODUCTION.MATING_DISTANCE)) {
            this.states.setState(CREATURE_STATES.MATING, target);
        }
    }

    checkCommittedProcess() {
        // Implementación simplificada
        const target = this.states.getTarget();
        if (!target || !target.isAlive) {
            this.states.setState(CREATURE_STATES.IDLE);
        }
    }

    checkMatingProcess() {
        // Implementación simplificada
        const target = this.states.getTarget();
        if (!target || !target.isAlive) {
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        // Lógica de apareamiento simplificada
        if (this.states.getTimeInCurrentState() > 3) { // 3 segundos
            this.states.setState(CREATURE_STATES.IDLE);
        }
    }

    checkNursingProcess(deltaTime) {
        // Implementación simplificada
        if (this.states.isInState(CREATURE_STATES.NURSING)) {
            // Transferir energía si es necesario
            if (this.creature.getEnergyPercentage() > 0.3) {
                this.creature.consumeEnergy(CONSTANTS.REPRODUCTION.ENERGY_TRANSFER_RATE * deltaTime);
            }
        }
    }

    checkIfShouldFollowMother() {
        // Implementación simplificada para bebés
        if (this.creature.growthSystem?.getCurrentStage()?.name === 'baby') {
            // Lógica de seguimiento de madre
        }
    }

    // Utilidades
    distanceTo(x, y) {
        const dx = this.creature.x - x;
        const dy = this.creature.y - y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    isNear(x, y, radius) {
        return this.distanceTo(x, y) <= radius;
    }

    emitUpdateEvent() {
        if (window.eventBus) {
            window.eventBus.emit('creature:behavior_updated', {
                creatureId: this.creature.id,
                state: this.states.getCurrentState(),
                stats: this.getStats()
            });
        }
    }

    /**
     * Obtiene estadísticas del comportamiento
     */
    getStats() {
        return {
            ...this.stats,
            throttlerStats: this.decisionThrottler.getStats(),
            cacheHitRate: this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) || 0,
            currentState: this.states.getCurrentState()
        };
    }

    /**
     * Destruye el sistema
     */
    destroy() {
        this.vision?.destroy();
        this.states?.destroy();
        this.movement?.destroy();
        this.decisionThrottler?.destroy();
        
        this.creature = null;
        this.lastFoodSearch = null;
        this.lastMateSearch = null;
        
        if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            console.log('CreatureBehaviorOptimized: Sistema destruido');
        }
    }
}

// Hacer disponible globalmente
window.CreatureBehaviorOptimized = CreatureBehaviorOptimized; 