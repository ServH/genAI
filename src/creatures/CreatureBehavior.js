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
        
        // 🔧 OPTIMIZACIÓN: sub-módulo de alimentación
        this.feeding = new FeedingBehavior(creature, this.vision, this.states);
        
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
        
        // Emitir evento de actualización
        this.emitUpdateEvent();
    }
    
    /**
     * Actualiza los sistemas de comportamiento modulares
     */
    updateBehaviorSystems(deltaTime) {
        // 1. Actualizar sistema de estados
        this.states.update(deltaTime);
        
        // 2. Lógica de alimentación delegada
        this.feeding.update(deltaTime);
        
        // 3. Verificar si llegó al objetivo (ahora dentro de FeedingBehavior)
        
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
                
                if (offspring) {
                    // 🔧 CORRECCIÓN: Establecer parentesco INMEDIATAMENTE después de crear offspring
                    if (window.gameLineage) {
                        window.gameLineage.setParentage(offspring, male, female);
                        console.log(`👨‍👩‍👧‍👦 PARENTESCO: Establecido para ${offspring.id} (Madre: ${female.id}, Padre: ${male.id})`);
                    }
                    
                    // Actualizar símbolos visuales inmediatamente
                    if (window.gameVisualId) {
                        // Buscar el sprite del offspring en el manager
                        const sprite = window.gameEngine.creatureManager.sprites?.get(offspring.id);
                        if (sprite) {
                            sprite.updateFamilySymbol();
                            console.log(`🏷️ SÍMBOLO: Actualizado para offspring ${offspring.id} con linaje ${offspring.lineageId}`);
                        } else {
                            console.warn(`⚠️ SÍMBOLO: No se encontró sprite para offspring ${offspring.id}`);
                        }
                    }
                    
                    // Activar efecto visual de nacimiento
                    if (window.gameEffects) {
                        window.gameEffects.createBirthEffect(offspringInfo.x, offspringInfo.y);
                    }
                    
                    // Emitir evento con información completa
                    if (window.eventBus) {
                        window.eventBus.emit('creature:offspring_born', {
                            parent1: male.id,
                            parent2: female.id,
                            offspring: offspring.id,
                            position: { x: offspringInfo.x, y: offspringInfo.y },
                            dna: offspringInfo.dna,
                            lineageId: offspring.lineageId,
                            generation: offspring.generation
                        });
                    }
                    
                    // Solo la hembra pasa a estado NURSING para cuidar al bebé
                    if (this.creature.dna && this.creature.dna.isFemale()) {
                        this.states.setState(CREATURE_STATES.NURSING, offspring);
                        console.log(`🤱 NURSING: Hembra ${female.id} comienza a cuidar bebé ${offspring.id}`);
                    } else {
                        // El macho vuelve a IDLE después de reproducirse
                        this.states.setState(CREATURE_STATES.IDLE);
                    }
                } else {
                    console.warn('⚠️ REPRODUCCIÓN: Falló la creación del offspring');
                    this.states.setState(CREATURE_STATES.IDLE);
                }
            } else {
                // Si no se pudo reproducir, volver a IDLE
                this.states.setState(CREATURE_STATES.IDLE);
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
        
        // 🔧 CORRECCIÓN: Buscar madre usando información de parentesco
        let mother = null;
        
        // Método 1: Buscar por parentesco (más confiable)
        if (this.creature.parents && this.creature.parents.mother) {
            const allCreatures = window.gameEngine.creatureManager.getAllCreatures();
            mother = allCreatures.find(creature => 
                creature.isAlive && 
                creature.id === this.creature.parents.mother &&
                creature.behavior && 
                creature.behavior.states &&
                creature.behavior.states.isInState(CREATURE_STATES.NURSING)
            );
        }
        
        // Método 2: Fallback - buscar madre que esté cuidando a esta criatura
        if (!mother) {
            const allCreatures = window.gameEngine.creatureManager.getAllCreatures();
            mother = allCreatures.find(creature => 
                creature.isAlive && 
                creature.behavior && 
                creature.behavior.states &&
                creature.behavior.states.isInState(CREATURE_STATES.NURSING) &&
                creature.behavior.states.getTarget() === this.creature
            );
        }
        
        if (mother) {
            // Cambiar a estado SEEKING para seguir a la madre
            this.states.setState(CREATURE_STATES.SEEKING, mother);
            
            // Log ocasional para debug
            if (Math.random() < 0.02) { // 2% chance por frame
                console.log(`👶 SEGUIMIENTO: Bebé ${this.creature.id} sigue a madre ${mother.id}`);
            }
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
            console.log(`🤱 NURSING: Madre ${this.creature.id} termina cuidado (bebé no disponible)`);
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        // 🔧 CORRECCIÓN: Verificar que realmente sea su hijo
        const isMyChild = baby.parents && baby.parents.mother === this.creature.id;
        if (!isMyChild) {
            console.warn(`⚠️ NURSING: Madre ${this.creature.id} no es madre de ${baby.id}, terminando cuidado`);
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        // Transferir energía de madre a bebé
        const transferRate = CONSTANTS.REPRODUCTION.ENERGY_TRANSFER_RATE || 0.3;
        const energyToTransfer = transferRate * deltaTime;
        
        if (this.creature.energy > energyToTransfer + 15) { // Mantener mínimo 15 energía
            this.creature.energySystem.consume(energyToTransfer);
            baby.energySystem.restore(energyToTransfer);
            
            // Log ocasional para debug
            if (Math.random() < 0.01) { // 1% chance por frame
                console.log(`🤱 NURSING: Madre ${this.creature.id} transfiere ${energyToTransfer.toFixed(1)} energía a bebé ${baby.id}`);
            }
            
            // El bebé sigue a la madre (esto se maneja en el movimiento del bebé)
            if (window.eventBus) {
                window.eventBus.emit('creature:nursing', {
                    motherId: this.creature.id,
                    babyId: baby.id,
                    energyTransferred: energyToTransfer,
                    motherEnergy: this.creature.energy,
                    babyEnergy: baby.energy
                });
            }
        } else {
            // Si la madre no tiene suficiente energía, terminar cuidado
            console.log(`🤱 NURSING: Madre ${this.creature.id} termina cuidado (energía insuficiente: ${this.creature.energy.toFixed(1)})`);
            this.states.setState(CREATURE_STATES.IDLE);
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
     * Limpia el comportamiento y sistemas modulares
     */
    destroy() {
        if (this.vision) this.vision.destroy();
        if (this.states) this.states.destroy();
        if (this.movement) this.movement.destroy();
        if (this.feeding) this.feeding.destroy();
        
        this.creature = null;
    }
}

// Hacer disponible globalmente
window.CreatureBehavior = CreatureBehavior; 