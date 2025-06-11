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
        
        // Debug: Verificar que se está llamando
        if (Math.random() < 0.001) { // Muy ocasional
            console.log(`CreatureBehavior: ${this.creature.id} update() llamado`);
        }
        
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
        
        // 2. Buscar comida con visión si está en IDLE
        if (this.states.isInState(CREATURE_STATES.IDLE)) {
            this.searchForFood();
        } else {
            // Debug: ¿Por qué no está en IDLE?
            if (Math.random() < 0.01) {
                console.log(`CreatureBehavior: ${this.creature.id} no está en IDLE, estado actual: ${this.states.getCurrentState()}`);
            }
        }
        
        // 3. Verificar si llegó al objetivo
        if (this.states.isInState(CREATURE_STATES.SEEKING)) {
            this.checkTargetReached();
        }
        
        // 4. Actualizar movimiento según estado
        const currentState = this.states.getCurrentState();
        const target = this.states.getTarget();
        this.movement.update(deltaTime, currentState, target);
    }
    
    /**
     * Busca comida usando el sistema de visión
     */
    searchForFood() {
        if (!window.gameResources) {
            console.log(`CreatureBehavior: ${this.creature.id} - gameResources no disponible`);
            return;
        }
        
        const foods = gameResources.getAllFood();
        // Solo log ocasional para no saturar
        if (Math.random() < 0.01) {
            console.log(`CreatureBehavior: ${this.creature.id} buscando comida - ${foods.size} items disponibles`);
        }
        
        const nearestFood = this.vision.getNearestVisibleFood(foods);
        
        if (nearestFood) {
            console.log(`CreatureBehavior: ${this.creature.id} detectó comida ${nearestFood.id}, cambiando a SEEKING`);
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
            console.log(`CreatureBehavior: ${this.creature.id} - Objetivo ${target.id} ya no existe, volviendo a IDLE`);
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        
        const distance = this.vision.getDistance(target.x, target.y);
        const minDistance = CONSTANTS.MOVEMENT.MIN_TARGET_DISTANCE;
        
        // Debug: Log de distancia al objetivo
        if (Math.random() < 0.01) { // Solo 1% de las veces para no saturar
            console.log(`CreatureBehavior: ${this.creature.id} - Distancia al objetivo: ${distance.toFixed(1)}px (min: ${minDistance}px)`);
        }
        
        if (distance <= minDistance) {
            // Cambiar a estado EATING
            console.log(`CreatureBehavior: ${this.creature.id} llegó al objetivo, cambiando a EATING`);
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
                console.log(`CreatureBehavior: ${this.creature.id} consumió comida (+${result.energyGained} energía)`);
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