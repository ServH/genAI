/**
 * GenAI - Comportamientos de Criaturas
 * CAJA 2 - Fase 2.3: Comportamiento de Búsqueda
 * 
 * Coordinador de sistemas de comportamiento modular
 */

class CreatureBehavior {
    constructor(creature) {
        this.creature = creature;
        
        // Sistemas modulares independientes
        this.vision = new CreatureVision(creature);
        this.states = new CreatureStates(creature);
        this.movement = new CreatureMovement(creature);
        
        // Estado de movimiento
        this.isMoving = true;
        this.lastPosition = { x: creature.x, y: creature.y };
        
        console.log(`CreatureBehavior: Coordinador inicializado para ${creature.id} con sistemas modulares`);
    }
    
    /**
     * Actualiza el comportamiento de la criatura
     */
    update(deltaTime) {
        if (!this.creature.isAlive) return;
        
        // Actualizar sistemas modulares
        this.updateBehaviorSystems(deltaTime);
        
        // Verificar consumo de comida
        this.checkFoodConsumption();
        
        // Emitir evento de actualización
        this.emitUpdateEvent();
    }
    
    /**
     * Actualiza los sistemas de comportamiento modulares
     */
    updateBehaviorSystems(deltaTime) {
        // 1. Actualizar sistema de estados
        this.states.update(deltaTime);
        
        // 2. Buscar comida o pareja con visión si está en IDLE
        if (this.states.isInState(CREATURE_STATES.IDLE)) {
            // Priorizar reproducción si tiene suficiente energía
            if (this.creature.energy >= 80 && window.gameReproduction) {
                this.searchForMate();
            } else {
                this.searchForFood();
            }
        }
        
        // 3. Verificar si llegó al objetivo
        if (this.states.isInState(CREATURE_STATES.SEEKING)) {
            this.checkTargetReached();
        }
        
        // 4. Verificar reproducción si está en MATING
        if (this.states.isInState(CREATURE_STATES.MATING)) {
            this.checkMatingProcess();
        }
        
        // 5. Actualizar movimiento según estado
        const currentState = this.states.getCurrentState();
        const target = this.states.getTarget();
        this.movement.update(deltaTime, currentState, target);
    }
    
    /**
     * Busca pareja para reproducción - Fase 3.1
     */
    searchForMate() {
        if (!window.gameEngine || !window.gameEngine.creatureManager || !window.gameReproduction) {
            return;
        }
        
        const allCreatures = gameEngine.creatureManager.getAllCreatures();
        const mate = gameReproduction.findMate(this.creature, allCreatures);
        
        if (mate) {
            // Cambiar a estado MATING con objetivo
            this.states.setState(CREATURE_STATES.MATING, mate);
            
            if (window.eventBus) {
                eventBus.emit('creature:mate_found', {
                    id: this.creature.id,
                    mateId: mate.id,
                    distance: this.distanceTo(mate.x, mate.y)
                });
            }
        }
    }

    /**
     * Busca comida usando el sistema de visión
     */
    searchForFood() {
        if (!window.gameResources) {
            return;
        }
        
        const foods = gameResources.getAllFood();
        const nearestFood = this.vision.getNearestVisibleFood(foods);
        

        
        if (nearestFood) {
            // Cambiar a estado SEEKING con objetivo
            this.states.setState(CREATURE_STATES.SEEKING, nearestFood);
            
            if (window.eventBus) {
                eventBus.emit('creature:food_spotted', {
                    id: this.creature.id,
                    foodId: nearestFood.id,
                    distance: this.vision.getDistance(nearestFood.x, nearestFood.y)
                });
            }
        }
    }
    
    /**
     * Verifica el proceso de apareamiento - Fase 3.1
     */
    checkMatingProcess() {
        const mate = this.states.getTarget();
        if (!mate || !mate.isAlive) {
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        // Verificar si ambos están cerca
        const distance = this.distanceTo(mate.x, mate.y);
        const matingDistance = 30; // pixels
        
        if (distance <= matingDistance && window.gameReproduction) {
            // Intentar reproducción
            const offspringDNA = gameReproduction.reproduce(this.creature, mate);
            
            if (offspringDNA && window.gameEngine && window.gameEngine.creatureManager) {
                // Calcular posición de la cría
                const position = gameReproduction.calculateOffspringPosition(this.creature, mate);
                
                // Crear nueva criatura con DNA mezclado
                const offspring = gameEngine.creatureManager.spawnCreatureWithDNA(position.x, position.y, offspringDNA);
                
                if (offspring && window.eventBus) {
                    eventBus.emit('creature:offspring_born', {
                        parent1: this.creature.id,
                        parent2: mate.id,
                        offspring: offspring.id,
                        position: position,
                        dna: offspringDNA
                    });
                }
            }
            
            // Volver a IDLE después del apareamiento
            this.states.setState(CREATURE_STATES.IDLE);
        }
    }

    /**
     * Verifica si llegó al objetivo
     */
    checkTargetReached() {
        const target = this.states.getTarget();
        if (!target) {
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        // Verificar si el objetivo (comida) aún existe
        if (!window.gameResources || !gameResources.food.has(target.id)) {
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        const distance = this.vision.getDistance(target.x, target.y);
        const minDistance = CONSTANTS.MOVEMENT.MIN_TARGET_DISTANCE;
        
        if (distance <= minDistance) {
            // Cambiar a estado EATING
            this.states.setState(CREATURE_STATES.EATING, target);
        }
    }
    
    /**
     * Emite evento de actualización de comportamiento
     */
    emitUpdateEvent() {
        if (window.eventBus) {
            eventBus.emit('creature:behavior_updated', {
                id: this.creature.id,
                state: this.states.getCurrentState(),
                target: this.states.getTarget(),
                position: { x: this.creature.x, y: this.creature.y },
                direction: this.creature.direction
            });
        }
    }
    
    /**
     * Calcula la distancia a un punto
     */
    distanceTo(x, y) {
        const dx = this.creature.x - x;
        const dy = this.creature.y - y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Verifica si está cerca de un punto
     */
    isNear(x, y, radius) {
        return this.distanceTo(x, y) <= radius;
    }
    
    /**
     * Obtiene la velocidad actual
     */
    getVelocity() {
        return {
            x: Math.cos(this.creature.direction) * this.creature.speed,
            y: Math.sin(this.creature.direction) * this.creature.speed
        };
    }
    
    /**
     * Detiene el movimiento
     */
    stop() {
        this.isMoving = false;
    }
    
    /**
     * Reanuda el movimiento
     */
    resume() {
        this.isMoving = true;
    }
    
    /**
     * Verifica si puede consumir comida cercana
     */
    checkFoodConsumption() {
        if (!window.gameResources) return;
        
        // Solo consumir si está en estado EATING
        if (this.states.isInState(CREATURE_STATES.EATING)) {
            const result = gameResources.checkFoodConsumption(this.creature);
            if (result) {
                // Volver a IDLE después de comer
                this.states.setState(CREATURE_STATES.IDLE);
                
                // Emitir evento de alimentación exitosa
                if (window.eventBus) {
                    eventBus.emit('creature:fed', {
                        creatureId: this.creature.id,
                        foodId: result.foodItem.id,
                        energyGained: result.energyGained,
                        newEnergy: this.creature.energy
                    });
                }
            }
        }
    }
    
    /**
     * Obtiene información de debug del comportamiento
     */
    getDebugInfo() {
        return {
            state: this.states.getCurrentState(),
            target: this.states.getTarget(),
            vision: this.vision.getDebugInfo(),
            isMoving: this.isMoving
        };
    }
    
    /**
     * Limpia el comportamiento y sistemas modulares
     */
    destroy() {
        if (this.vision) this.vision.destroy();
        if (this.states) this.states.destroy();
        if (this.movement) this.movement.destroy();
        
        this.creature = null;
    }
}

// Hacer disponible globalmente
window.CreatureBehavior = CreatureBehavior; 