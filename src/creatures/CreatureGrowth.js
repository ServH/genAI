/**
 * GenAI - Sistema de Crecimiento de Criaturas
 * CAJA 3 - Fase 3.1: fixfeatures
 * 
 * Gestión de etapas de vida y crecimiento visual
 */

class CreatureGrowth {
    constructor(creature) {
        this.creature = creature;
        this.currentStage = null;
        this.baseScale = 1.0;
        
        // Determinar etapa inicial basada en edad
        this.updateGrowthStage();
        
        console.log(`CreatureGrowth: Sistema inicializado para ${creature.id}`);
    }

    /**
     * Actualiza la etapa de crecimiento basada en la edad
     */
    update(deltaTime) {
        if (!this.creature.isAlive) return;
        
        const previousStage = this.currentStage;
        this.updateGrowthStage();
        
        // Si cambió de etapa, emitir evento
        if (previousStage && this.currentStage && 
            previousStage.name !== this.currentStage.name) {
            this.onStageChanged(previousStage, this.currentStage);
        }
    }

    /**
     * Determina la etapa actual basada en la edad
     */
    updateGrowthStage() {
        const ageInSeconds = this.creature.age;
        const stages = CONSTANTS.ENERGY.GROWTH_STAGES;
        
        // Encontrar la etapa apropiada (la última que cumple el requisito de edad)
        let currentStage = stages[0]; // Por defecto, bebé
        
        for (const stage of stages) {
            if (ageInSeconds >= stage.age) {
                currentStage = stage;
            } else {
                break;
            }
        }
        
        this.currentStage = currentStage;
        this.baseScale = currentStage.scale;
    }

    /**
     * Obtiene el factor de escala actual
     */
    getScale() {
        return this.baseScale;
    }

    /**
     * Obtiene la etapa actual
     */
    getCurrentStage() {
        return this.currentStage;
    }

    /**
     * Verifica si puede reproducirse (solo adultos)
     */
    canReproduce() {
        if (!this.currentStage) return false;
        
        // Solo adultos pueden reproducirse
        if (this.currentStage.name !== 'adult') return false;
        
        // Verificar tiempo mínimo desde nacimiento
        const timeSinceBirth = Date.now() - this.creature.birthTime;
        return timeSinceBirth >= CONSTANTS.ENERGY.REPRODUCTION_RECOVERY;
    }

    /**
     * Obtiene información de crecimiento para debug
     */
    getGrowthInfo() {
        return {
            stage: this.currentStage ? this.currentStage.name : 'unknown',
            age: Math.round(this.creature.age),
            scale: this.baseScale,
            canReproduce: this.canReproduce(),
            timeSinceBirth: Date.now() - this.creature.birthTime
        };
    }

    /**
     * Maneja el cambio de etapa
     */
    onStageChanged(previousStage, newStage) {
        console.log(`🌱 GROWTH: ${this.creature.id} creció de ${previousStage.name} a ${newStage.name}`);
        
        if (window.eventBus) {
            window.eventBus.emit('creature:stage_changed', {
                creatureId: this.creature.id,
                previousStage: previousStage.name,
                newStage: newStage.name,
                age: this.creature.age,
                scale: this.baseScale
            });
        }
    }

    /**
     * Destruye el sistema
     */
    destroy() {
        this.creature = null;
        this.currentStage = null;
    }
}

// Hacer disponible globalmente
window.CreatureGrowth = CreatureGrowth; 