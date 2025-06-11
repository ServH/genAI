/**
 * GenAI - Sistema de Energía de Criaturas
 * CAJA 2 - Fase 2.1: Energía y Muerte
 * 
 * Gestión de energía específica para criaturas individuales
 */

class CreatureEnergy {
    constructor(creature) {
        this.creature = creature;
        this.energy = CONSTANTS.ENERGY ? CONSTANTS.ENERGY.INITIAL : 100;
        this.maxEnergy = this.energy;
        
        // Nota: El registro en gameEnergy se hace después de la construcción completa
    }
    
    /**
     * Inicializa el sistema de energía (llamar después del constructor)
     */
    init() {
        // Registrar en sistema global de energía
        if (window.gameEnergy) {
            gameEnergy.registerCreature(this.creature);
        }
    }
    
    /**
     * Consume energía de la criatura
     */
    consume(amount) {
        if (!this.creature.isAlive) return;
        
        this.energy = Math.max(0, this.energy - amount);
        
        if (window.eventBus) {
            eventBus.emit('creature:energy_consumed', {
                id: this.creature.id,
                amount: amount,
                currentEnergy: this.energy
            });
        }
    }
    
    /**
     * Restaura energía de la criatura
     */
    restore(amount) {
        if (!this.creature.isAlive) return;
        
        const previousEnergy = this.energy;
        this.energy = Math.min(this.maxEnergy, this.energy + amount);
        const actualGain = this.energy - previousEnergy;
        
        if (window.eventBus) {
            eventBus.emit('creature:energy_restored', {
                id: this.creature.id,
                amount: actualGain,
                currentEnergy: this.energy
            });
        }
        
        return actualGain;
    }
    
    /**
     * Verifica si la criatura está muriendo
     */
    isDying() {
        const threshold = CONSTANTS.ENERGY ? CONSTANTS.ENERGY.PULSE_THRESHOLD : 5;
        return this.energy <= threshold;
    }
    
    /**
     * Verifica si la criatura está en estado crítico
     */
    isCritical() {
        const threshold = CONSTANTS.ENERGY ? CONSTANTS.ENERGY.CRITICAL_THRESHOLD : 15;
        return this.energy <= threshold;
    }
    
    /**
     * Obtiene el porcentaje de energía
     */
    getPercentage() {
        return this.energy / this.maxEnergy;
    }
    
    /**
     * Obtiene la energía actual
     */
    getCurrent() {
        return this.energy;
    }
    
    /**
     * Obtiene la energía máxima
     */
    getMax() {
        return this.maxEnergy;
    }
    
    /**
     * Establece la energía directamente (para casos especiales)
     */
    set(amount) {
        this.energy = Math.max(0, Math.min(this.maxEnergy, amount));
    }
    
    /**
     * Verifica si puede comer (tiene hambre)
     */
    canEat() {
        return this.energy < this.maxEnergy;
    }
    
    /**
     * Limpia el sistema de energía
     */
    destroy() {
        // Desregistrar del sistema global
        if (window.gameEnergy) {
            gameEnergy.unregisterCreature(this.creature);
        }
        
        this.creature = null;
    }
}

// Hacer disponible globalmente
window.CreatureEnergy = CreatureEnergy; 