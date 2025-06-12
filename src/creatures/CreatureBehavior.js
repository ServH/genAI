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
            // Verificar si es un bebé que debe seguir a su madre
            if (this.checkIfShouldFollowMother()) {
                return; // El comportamiento de seguimiento se maneja en checkIfShouldFollowMother
            }
            
            const reproductionThreshold = CONSTANTS.REPRODUCTION.ENERGY_THRESHOLD;
            const hungerThreshold = 60; // Solo buscar comida si energía < 60
            
            // Priorizar reproducción si tiene suficiente energía
            if (this.creature.energy >= reproductionThreshold && window.gameReproduction) {
                // Activar efecto visual de búsqueda
                if (window.gameEffects) {
                    window.gameEffects.startSeekingPulse(this.creature);
                }
                this.searchForMate();
            } 
            // Solo buscar comida si realmente tiene hambre
            else if (this.creature.energy < hungerThreshold) {
                this.searchForFood();
            }
            // Si no tiene hambre ni energía para reproducirse, simplemente vagar
            else {
                // Movimiento browniano normal
            }
        }
        
        // 3. Verificar si llegó al objetivo
        if (this.states.isInState(CREATURE_STATES.SEEKING)) {
            this.checkTargetReached();
        }
        
        // 4. Verificar cortejo si está en COURTING
        if (this.states.isInState(CREATURE_STATES.COURTING)) {
            this.checkCourtingProcess();
        }
        
        // 5. 🔄 NUEVO: Verificar compromiso si está en COMMITTED
        if (this.states.isInState(CREATURE_STATES.COMMITTED)) {
            this.checkCommittedProcess();
        }
        
        // 6. Verificar reproducción si está en MATING
        if (this.states.isInState(CREATURE_STATES.MATING)) {
            this.checkMatingProcess();
        }
        
        // 7. Verificar cuidado maternal si está en NURSING
        if (this.states.isInState(CREATURE_STATES.NURSING)) {
            this.checkNursingProcess(deltaTime);
        }
        
        // 8. Actualizar movimiento según estado
        const currentState = this.states.getCurrentState();
        const target = this.states.getTarget();
        this.movement.update(deltaTime, currentState, target);
    }
    
    /**
     * Busca pareja para reproducción - Solo machos buscan
     */
    searchForMate() {
        // Solo los machos buscan pareja
        if (!this.creature.dna || !this.creature.dna.isMale()) {
            return;
        }

        if (!window.gameEngine || !window.gameEngine.creatureManager || !window.gameReproduction) {
            return;
        }
        
        // 🔄 VERIFICACIÓN ADICIONAL: No buscar pareja si está en cooldown
        if (!window.gameReproduction.canReproduce(this.creature)) {
            return; // Silenciosamente no buscar si está en cooldown
        }
        
        const allCreatures = window.gameEngine.creatureManager.getAllCreatures();
        const female = window.gameReproduction.findMate(this.creature, allCreatures);
        
        if (female) {
            // Cambiar a estado COURTING con objetivo
            this.states.setState(CREATURE_STATES.COURTING, female);
            
            if (window.eventBus) {
                window.eventBus.emit('creature:mate_found', {
                    id: this.creature.id,
                    mateId: female.id,
                    distance: this.distanceTo(female.x, female.y),
                    gender: 'male_courting_female'
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
        
        const foods = window.gameResources.getAllFood();
        const nearestFood = this.vision.getNearestVisibleFood(foods);
        

        
        if (nearestFood) {
            // Cambiar a estado SEEKING con objetivo
            this.states.setState(CREATURE_STATES.SEEKING, nearestFood);
            
            if (window.eventBus) {
                window.eventBus.emit('creature:food_spotted', {
                    id: this.creature.id,
                    foodId: nearestFood.id,
                    distance: this.vision.getDistance(nearestFood.x, nearestFood.y)
                });
            }
        }
    }
    
    /**
     * Verifica el proceso de apareamiento - Sistema de género
     */
    checkMatingProcess() {
        const partner = this.states.getTarget();
        if (!partner || !partner.isAlive) {
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        // Verificar si ambos están cerca
        const distance = this.distanceTo(partner.x, partner.y);
        const matingDistance = CONSTANTS.REPRODUCTION.MATING_DISTANCE;
        
        // Diagnóstico silencioso - información disponible en debug overlay
        
        if (distance <= matingDistance && window.gameReproduction) {
            // 🔄 VERIFICAR SINCRONIZACIÓN: Asegurar que ambas criaturas estén en MATING
            if (!this.states.isInState(CREATURE_STATES.MATING) || 
                !partner.behavior?.states?.isInState(CREATURE_STATES.MATING)) {
                
                // Si no están ambas en MATING, usar sincronización bidireccional
                this.synchronizeMatingTransition(partner);
                return; // Esperar al siguiente frame para proceder
            }

            // Determinar macho y hembra
            let male, female;
            if (this.creature.dna && this.creature.dna.isMale()) {
                male = this.creature;
                female = partner;
            } else if (this.creature.dna && this.creature.dna.isFemale()) {
                male = partner;
                female = this.creature;
            } else {
                // Sin género válido, volver a IDLE
                this.states.setState(CREATURE_STATES.IDLE);
                return;
            }

            // Intentar reproducción
            const offspringInfo = window.gameReproduction.reproduce(male, female);
            
            if (offspringInfo && window.gameEngine && window.gameEngine.creatureManager) {
                // Crear nueva criatura con DNA mezclado
                const offspring = window.gameEngine.creatureManager.spawnCreatureWithDNA(
                    offspringInfo.x, 
                    offspringInfo.y, 
                    offspringInfo.dna
                );
                
                // Activar efecto visual de nacimiento
                if (window.gameEffects) {
                    window.gameEffects.createBirthEffect(offspringInfo.x, offspringInfo.y);
                }
                
                if (offspring && window.eventBus) {
                    window.eventBus.emit('creature:offspring_born', {
                        parent1: male.id,
                        parent2: female.id,
                        offspring: offspring.id,
                        position: { x: offspringInfo.x, y: offspringInfo.y },
                        dna: offspringInfo.dna
                    });
                }
                
                // Solo la hembra pasa a estado NURSING para cuidar al bebé
                if (offspring && this.creature.dna && this.creature.dna.isFemale()) {
                    // Establecer parentesco
                    if (window.gameLineage) {
                        window.gameLineage.setParentage(offspring, male, female);
                    }
                    
                    this.states.setState(CREATURE_STATES.NURSING, offspring);
                } else {
                    // El macho vuelve a IDLE después de reproducirse
                    this.states.setState(CREATURE_STATES.IDLE);
                }
            } else {
                // Si no se pudo reproducir, volver a IDLE
                this.states.setState(CREATURE_STATES.IDLE);
            }
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
        if (!window.gameResources || !window.gameResources.food.has(target.id)) {
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
            window.eventBus.emit('creature:behavior_updated', {
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
     * Verifica el proceso de cortejo con acercamiento gradual - fixfeatures
     */
    checkCourtingProcess() {
        const mate = this.states.getTarget();
        if (!mate || !mate.isAlive) {
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        // Calcular acercamiento gradual basado en tiempo de cortejo
        const timeInCourting = this.states.getTimeInCurrentState();
        const initialRadius = CONSTANTS.REPRODUCTION.COURTING_RADIUS;
        const minRadius = CONSTANTS.REPRODUCTION.COURTING_MIN_RADIUS;
        const approachRate = CONSTANTS.REPRODUCTION.COURTING_APPROACH_RATE;
        
        // Radio objetivo disminuye gradualmente con el tiempo
        const radiusReduction = timeInCourting * approachRate;
        const targetRadius = Math.max(minRadius, initialRadius - radiusReduction);
        
        // Verificar distancia actual
        const distance = this.distanceTo(mate.x, mate.y);
        
        // Diagnóstico silencioso - información disponible en debug overlay
        
        // Si están lo suficientemente cerca para aparearse, transición a MATING
        if (distance <= CONSTANTS.REPRODUCTION.MATING_DISTANCE) {
            // 🔄 SINCRONIZACIÓN BIDIRECCIONAL: Ambas criaturas deben cambiar a MATING
            this.synchronizeMatingTransition(mate);
            return;
        }
        
        // Activar efecto visual de conexión durante cortejo
        if (window.gameEffects) {
            window.gameEffects.startMatingConnection(this.creature, mate);
        }
        
        // Actualizar radio de cortejo en el sistema de movimiento
        if (this.movement && this.movement.setCourtingRadius) {
            this.movement.setCourtingRadius(targetRadius);
        }
    }

    /**
     * 🔄 NUEVO: Verifica el proceso de compromiso (hembra esperando al macho)
     */
    checkCommittedProcess() {
        const selectedMale = this.states.getTarget();
        if (!selectedMale || !selectedMale.isAlive) {
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        // Verificar que el macho esté cortejando a esta hembra
        const maleState = selectedMale.behavior?.states?.getCurrentState();
        const maleTarget = selectedMale.behavior?.states?.getTarget();
        
        if (maleState !== CREATURE_STATES.COURTING || !maleTarget || maleTarget.id !== this.creature.id) {
            this.states.setState(CREATURE_STATES.IDLE);
            
            // Limpiar selección femenina
            if (window.gameReproduction) {
                window.gameReproduction.clearFemaleSelection(this.creature);
            }
            return;
        }
        
        // Verificar distancia - si el macho está lo suficientemente cerca, esperar transición
        const distance = this.distanceTo(selectedMale.x, selectedMale.y);
        
        // Diagnóstico silencioso - información disponible en debug overlay
        
        // La hembra simplemente espera - el macho iniciará la transición a MATING cuando esté listo
        // No hacer nada más, solo mantener el estado COMMITTED
    }

    /**
     * Verifica si esta criatura debe seguir a su madre - fixfeatures
     */
    checkIfShouldFollowMother() {
        if (!window.gameEngine || !window.gameEngine.creatureManager) {
            return false;
        }
        
        // Buscar una madre que esté en estado NURSING con esta criatura como objetivo
        const allCreatures = window.gameEngine.creatureManager.getAllCreatures();
        const mother = allCreatures.find(creature => 
            creature.isAlive && 
            creature.behavior && 
            creature.behavior.states &&
            creature.behavior.states.isInState(CREATURE_STATES.NURSING) &&
            creature.behavior.states.getTarget() === this.creature
        );
        
        if (mother) {
            // Cambiar a estado SEEKING para seguir a la madre
            this.states.setState(CREATURE_STATES.SEEKING, mother);
            return true;
        }
        
        return false;
    }

    /**
     * Verifica el proceso de cuidado maternal - fixfeatures
     */
    checkNursingProcess(deltaTime) {
        const baby = this.states.getTarget();
        if (!baby || !baby.isAlive) {
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        // Transferir energía de madre a bebé
        const transferRate = CONSTANTS.REPRODUCTION.ENERGY_TRANSFER_RATE || 0.5;
        const energyToTransfer = transferRate * deltaTime;
        
        if (this.creature.energy > energyToTransfer + 10) { // Mantener mínimo 10 energía
            this.creature.energy -= energyToTransfer;
            baby.energy = Math.min(100, baby.energy + energyToTransfer);
            
            // El bebé sigue a la madre (esto se maneja en el movimiento del bebé)
            if (window.eventBus) {
                window.eventBus.emit('creature:nursing', {
                    motherId: this.creature.id,
                    babyId: baby.id,
                    energyTransferred: energyToTransfer
                });
            }
        }
    }

    /**
     * 🔄 NUEVO: Sincroniza transición a MATING usando sistema bidireccional
     * @param {Creature} mate - Pareja para apareamiento
     */
    synchronizeMatingTransition(mate) {
        // Solo el macho puede iniciar la transición sincronizada
        if (!this.creature.dna || !this.creature.dna.isMale()) {
            return;
        }
        
        // Verificar que la hembra esté en estado COMMITTED
        if (!mate.behavior?.states?.isInState(CREATURE_STATES.COMMITTED)) {
            return;
        }
        
        // Usar el sistema de reproducción para sincronizar la transición
        if (window.gameReproduction) {
            window.gameReproduction.synchronizeMatingTransition(this.creature, mate);
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