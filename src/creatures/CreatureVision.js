/**
 * GenAI - Sistema de Visión de Criaturas
 * CAJA 2 - Fase 2.3: Comportamiento de Búsqueda
 * 
 * Sistema de visión en cono para detección de comida
 */

class CreatureVision {
    constructor(creature) {
        this.creature = creature;
        
        // Configuración desde utilidades
        const config = CreatureVisionUtils.getConfig();
        this.angle = config.angle;
        this.range = config.range;
        this.angleRad = config.angleRad;
        
        console.log(`CreatureVision: Sistema inicializado para ${creature.id} - Ángulo: ${this.angle}°, Alcance: ${this.range}px`);
    }

    /**
     * Detecta toda la comida visible en el cono de visión
     */
    detectFood(foods) {
        if (!foods || foods.size === 0) return [];
        
        const visibleFood = [];
        
        for (const food of foods) {
            if (this.isInVisionCone(food.x, food.y)) {
                const distance = CreatureVisionUtils.calculateDistance(
                    this.creature.x, this.creature.y, food.x, food.y
                );
                visibleFood.push({
                    food: food,
                    distance: distance
                });
            }
        }
        
        // Ordenar por distancia (más cercana primero)
        return CreatureVisionUtils.sortFoodByDistance(visibleFood);
    }

    /**
     * Obtiene la comida más cercana visible
     */
    getNearestVisibleFood(foods) {
        const visibleFood = this.detectFood(foods);
        return visibleFood.length > 0 ? visibleFood[0].food : null;
    }

        /**
     * Verifica si un punto está dentro del cono de visión
     */
    isInVisionCone(x, y) {
        return CreatureVisionUtils.isInVisionCone(
            this.creature.x, this.creature.y, this.creature.direction,
            x, y, this.range, this.angleRad
        );
    }
    
    /**
     * Calcula la distancia a un punto
     */
    getDistance(x, y) {
        return CreatureVisionUtils.calculateDistance(
            this.creature.x, this.creature.y, x, y
        );
    }

    /**
     * Obtiene información de debug de la visión
     */
    getDebugInfo() {
        return {
            angle: this.angle,
            range: this.range,
            direction: this.creature.direction,
            x: this.creature.x,
            y: this.creature.y
        };
    }

    /**
     * Limpia el sistema de visión
     */
    destroy() {
        this.creature = null;
    }
}

// Hacer disponible globalmente
window.CreatureVision = CreatureVision; 