/**
 * GenAI - Sistema de Energía
 * CAJA 2 - Fase 2.1: Energía y Muerte
 * 
 * Sistema central que gestiona la energía de las criaturas
 */

class Energy {
    constructor() {
        this.creatures = new Set();
        this.totalEnergyLost = 0;
        this.totalDeaths = 0;
        this.averageEnergy = 100;
        this.lastUpdateTime = 0;
        
        // Configuración desde Constants
        this.config = {
            initial: 100,
            drainRate: 1.0,
            criticalThreshold: 15,
            pulseThreshold: 5,
            deathThreshold: 0
        };
        
        // Cargar configuración cuando esté disponible
        this.loadConfig();
        
        console.log('Energy: Sistema de energía inicializado');
    }
    
    /**
     * Carga la configuración desde Constants
     */
    loadConfig() {
        if (window.CONSTANTS && CONSTANTS.ENERGY) {
            this.config = { ...this.config, ...CONSTANTS.ENERGY };
        }
    }
    
    /**
     * Registra una criatura en el sistema de energía
     */
    registerCreature(creature) {
        if (!creature) return;
        
        // Verificar que la criatura tenga sistema de energía
        if (!creature.energySystem) {
            console.warn('Energy: Criatura sin sistema de energía, ignorando registro');
            return;
        }
        
        this.creatures.add(creature);
        
        // Emitir evento
        if (window.eventBus) {
            eventBus.emit('energy:creature_registered', { creature });
        }
    }
    
    /**
     * Desregistra una criatura del sistema
     */
    unregisterCreature(creature) {
        if (!creature) return;
        
        this.creatures.delete(creature);
        
        // Emitir evento
        if (window.eventBus) {
            eventBus.emit('energy:creature_unregistered', { creature });
        }
    }
    
    /**
     * Actualiza el sistema de energía
     */
    update(deltaTime) {
        if (this.creatures.size === 0) return;
        
        const energyDrain = this.config.drainRate * deltaTime;
        let totalEnergy = 0;
        const dyingCreatures = [];
        
        // Procesar cada criatura
        for (const creature of this.creatures) {
            if (!creature.isAlive || !creature.energySystem) continue;
            
            // Drenar energía usando el sistema modular
            const previousEnergy = creature.energy;
            creature.energySystem.consume(energyDrain);
            const currentEnergy = creature.energy;
            
            // Actualizar estadísticas
            this.totalEnergyLost += (previousEnergy - currentEnergy);
            totalEnergy += currentEnergy;
            
            // Verificar estados críticos
            this.checkEnergyStates(creature, previousEnergy);
            
            // Marcar para muerte si energía = 0
            if (currentEnergy <= this.config.deathThreshold && creature.isAlive) {
                dyingCreatures.push(creature);
            }
        }
        
        // Procesar muertes
        this.processDyingCreatures(dyingCreatures);
        
        // Actualizar energía promedio
        const aliveCount = this.getAliveCreatureCount();
        this.averageEnergy = aliveCount > 0 ? totalEnergy / aliveCount : 0;
    }
    
    /**
     * Verifica estados críticos de energía
     */
    checkEnergyStates(creature, previousEnergy) {
        const currentEnergy = creature.energy;
        
        // Energía crítica (primera vez)
        if (previousEnergy > this.config.criticalThreshold && 
            currentEnergy <= this.config.criticalThreshold) {
            
            if (window.eventBus) {
                eventBus.emit('energy:critical', { 
                    creature, 
                    energy: currentEnergy 
                });
            }
        }
        
        // Energía muy baja (pulso visual)
        if (previousEnergy > this.config.pulseThreshold && 
            currentEnergy <= this.config.pulseThreshold) {
            if (window.eventBus) {
                eventBus.emit('energy:pulse_threshold', { 
                    creature, 
                    energy: currentEnergy 
                });
            }
        }
    }
    
    /**
     * Procesa las criaturas que deben morir
     */
    processDyingCreatures(dyingCreatures) {
        for (const creature of dyingCreatures) {
            this.killCreature(creature);
        }
    }
    
    /**
     * Mata una criatura por falta de energía
     */
    killCreature(creature) {
        if (!creature.isAlive) return;
        
        // Usar el método die de la criatura
        creature.die('starvation');
        
        // Actualizar estadísticas
        this.totalDeaths++;
        
        // Emitir eventos
        if (window.eventBus) {
            eventBus.emit('energy:death', { 
                creature,
                cause: 'starvation',
                totalDeaths: this.totalDeaths
            });
        }
        
        console.log(`Energy: Criatura ${creature.id} murió por falta de energía`);
    }
    
    /**
     * Obtiene el número de criaturas vivas
     */
    getAliveCreatureCount() {
        let count = 0;
        for (const creature of this.creatures) {
            if (creature.isAlive) count++;
        }
        return count;
    }
    
    /**
     * Obtiene estadísticas del sistema
     */
    getStats() {
        return {
            totalCreatures: this.creatures.size,
            aliveCreatures: this.getAliveCreatureCount(),
            averageEnergy: Math.round(this.averageEnergy * 10) / 10,
            totalEnergyLost: Math.round(this.totalEnergyLost * 10) / 10,
            totalDeaths: this.totalDeaths,
            drainRate: this.config.drainRate
        };
    }
    
    /**
     * Obtiene la energía de una criatura como porcentaje
     */
    getEnergyPercentage(creature) {
        if (!creature || !creature.energySystem) return 1.0;
        return creature.getEnergyPercentage();
    }
    
    /**
     * Verifica si una criatura está en estado crítico
     */
    isCritical(creature) {
        if (!creature || !creature.energySystem) return false;
        return creature.energySystem.isCritical();
    }
    
    /**
     * Verifica si una criatura está muriendo
     */
    isDying(creature) {
        if (!creature || !creature.energySystem) return false;
        return creature.energySystem.isDying();
    }
    
    /**
     * Limpia el sistema
     */
    destroy() {
        this.creatures.clear();
        this.totalEnergyLost = 0;
        this.totalDeaths = 0;
        this.averageEnergy = 100;
        
        console.log('Energy: Sistema destruido');
    }
}

// Crear instancia global
const gameEnergy = new Energy();

// Hacer disponible globalmente
window.Energy = Energy;
window.gameEnergy = gameEnergy; 