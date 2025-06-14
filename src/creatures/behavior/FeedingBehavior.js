/**
 * GenAI - FeedingBehavior
 * CAJA OPTIMIZACIÓN - Fase O.1
 * 
 * Encapsula la lógica de búsqueda, consumo y seguimiento de comida.
 * (≤100 líneas)
 */

class FeedingBehavior {
    constructor(creature, vision, states) {
        this.creature = creature;
        this.vision = vision;
        this.states = states;
    }

    // Llamado cada frame por el facade
    update(deltaTime) {
        if (window.profiler) profiler.start('FeedingBehavior');
        const currentState = this.states.getCurrentState();

        // Búsqueda sólo en IDLE
        if (currentState === CREATURE_STATES.IDLE) {
            const hungerThreshold = 60;
            if (this.creature.energy < hungerThreshold) {
                this.searchForFood();
            }
        }

        // Verificar llegada al objetivo en SEEKING
        if (currentState === CREATURE_STATES.SEEKING) {
            this.checkTargetReached();
        }

        // Consumir cuando está en EATING
        if (currentState === CREATURE_STATES.EATING) {
            this.checkFoodConsumption();
        }
        if (window.profiler) profiler.end('FeedingBehavior');
    }

    // --- Métodos privados ---------------------------------------------
    searchForFood() {
        if (!window.gameResources) return;
        const foods = window.gameResources.getNearbyFood(this.creature.x, this.creature.y, this.vision.range);
        const nearest = this.vision.getNearestVisibleFood(foods);
        if (nearest) {
            this.states.setState(CREATURE_STATES.SEEKING, nearest);
            window.eventBus?.emit('creature:food_spotted', {
                id: this.creature.id,
                foodId: nearest.id,
                distance: this.vision.getDistance(nearest.x, nearest.y)
            });
        }
    }

    checkTargetReached() {
        const target = this.states.getTarget();
        if (!target) {
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        if (!window.gameResources || !window.gameResources.food.has(target.id)) {
            this.states.setState(CREATURE_STATES.IDLE);
            return;
        }
        const dist = this.vision.getDistance(target.x, target.y);
        if (dist <= CONSTANTS.MOVEMENT.MIN_TARGET_DISTANCE) {
            this.states.setState(CREATURE_STATES.EATING, target);
        }
    }

    checkFoodConsumption() {
        if (!window.gameResources) return;
        const result = gameResources.checkFoodConsumption(this.creature);
        if (result) {
            this.states.setState(CREATURE_STATES.IDLE);
            window.eventBus?.emit('creature:fed', {
                creatureId: this.creature.id,
                foodId: result.foodItem.id,
                energyGained: result.energyGained,
                newEnergy: this.creature.energy
            });
        }
    }

    destroy() {
        this.creature = null;
        this.vision = null;
        this.states = null;
    }
}

// Exponer globalmente
window.FeedingBehavior = FeedingBehavior; 