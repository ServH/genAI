/**
 * Sistema de Reproducción - CAJA 3 Fase 3.1
 * Maneja la reproducción sexual básica con genética
 */
class Reproduction {
    constructor() {
        // Usar configuración de Constants.js
        this.config = {
            energyThreshold: CONSTANTS.REPRODUCTION.ENERGY_THRESHOLD,
            searchRadius: CONSTANTS.REPRODUCTION.SEARCH_RADIUS,
            geneticCompatibility: CONSTANTS.REPRODUCTION.GENETIC_COMPATIBILITY,
            energyCost: CONSTANTS.REPRODUCTION.ENERGY_COST,
            cooldown: CONSTANTS.REPRODUCTION.COOLDOWN,
            offspringEnergy: CONSTANTS.REPRODUCTION.OFFSPRING_ENERGY
        };
        
        this.reproductionCooldowns = new Map(); // creature.id -> timestamp
        this.stats = {
            totalReproductions: 0,
            successfulMatings: 0,
            failedCompatibility: 0,
            averageGeneticDistance: 0
        };
        
        console.log('Reproduction: Sistema inicializado');
    }

    /**
     * Busca pareja para una criatura
     * @param {Creature} creature - Criatura que busca pareja
     * @param {Array} allCreatures - Todas las criaturas disponibles
     * @returns {Creature|null} - Pareja encontrada o null
     */
    findMate(creature, allCreatures) {
        // Verificar si puede reproducirse
        if (!this.canReproduce(creature)) {
            return null;
        }

        const potentialMates = allCreatures.filter(other => {
            // No puede reproducirse consigo misma
            if (other.id === creature.id) return false;
            
            // Ambas deben tener DNA
            if (!other.dna || !creature.dna) return false;
            
            // La pareja también debe poder reproducirse
            if (!this.canReproduce(other)) return false;
            
            // Verificar distancia física
            const distance = this.calculateDistance(creature, other);
            if (distance > this.config.searchRadius) return false;
            
            // Para test: todas las parejas son compatibles
            return true;
        });

        // Encontrar la pareja más cercana físicamente
        if (potentialMates.length === 0) {
            return null;
        }

        return potentialMates.reduce((closest, mate) => {
            const distanceToMate = this.calculateDistance(creature, mate);
            const distanceToClosest = this.calculateDistance(creature, closest);
            return distanceToMate < distanceToClosest ? mate : closest;
        });
    }

    /**
     * Verifica si una criatura puede reproducirse
     * @param {Creature} creature - Criatura a verificar
     * @returns {boolean}
     */
    canReproduce(creature) {
        // Verificar energía
        if (creature.energy < this.config.energyThreshold) {
            return false;
        }
        
        // Verificar DNA
        if (!creature.dna) {
            return false;
        }
        
        // Verificar cooldown
        const lastReproduction = this.reproductionCooldowns.get(creature.id);
        if (lastReproduction) {
            const timeSince = Date.now() - lastReproduction;
            if (timeSince < this.config.cooldown) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Ejecuta la reproducción entre dos criaturas
     * @param {Creature} parent1 - Primer padre
     * @param {Creature} parent2 - Segundo padre
     * @returns {DNA|null} - DNA de la cría o null si falla
     */
    reproduce(parent1, parent2) {
        // Verificar que ambos pueden reproducirse
        if (!this.canReproduce(parent1) || !this.canReproduce(parent2)) {
            return null;
        }

        // Calcular distancia genética para estadísticas
        const geneticDistance = GeneticUtils.calculateGeneticDistance(parent1.dna, parent2.dna);
        
        // Mezclar genes (50/50)
        const offspringDNA = this.mixGenes(parent1.dna, parent2.dna);
        
        // Consumir energía de los padres
        parent1.energySystem.consume(this.config.energyCost);
        parent2.energySystem.consume(this.config.energyCost);
        
        // Establecer cooldown
        const now = Date.now();
        this.reproductionCooldowns.set(parent1.id, now);
        this.reproductionCooldowns.set(parent2.id, now);
        
        // Actualizar estadísticas
        this.stats.totalReproductions++;
        this.stats.successfulMatings++;
        this.stats.averageGeneticDistance = 
            (this.stats.averageGeneticDistance * (this.stats.successfulMatings - 1) + geneticDistance) / 
            this.stats.successfulMatings;
        
        // Emitir evento
        if (window.eventBus) {
            eventBus.emit('reproduction:successful', {
                parent1: parent1.id,
                parent2: parent2.id,
                geneticDistance,
                offspringDNA
            });
        }
        
        return offspringDNA;
    }

    /**
     * Mezcla los genes de dos padres (50/50)
     * @param {DNA} dna1 - DNA del primer padre
     * @param {DNA} dna2 - DNA del segundo padre
     * @returns {DNA} - DNA de la cría
     */
    mixGenes(dna1, dna2) {
        const offspringDNA = new DNA();
        
        // Mezclar cada gen (50% probabilidad de cada padre)
        Object.keys(dna1.genes).forEach(geneName => {
            if (Math.random() < 0.5) {
                offspringDNA.genes[geneName] = dna1.genes[geneName];
            } else {
                offspringDNA.genes[geneName] = dna2.genes[geneName];
            }
        });
        
        return offspringDNA;
    }

    /**
     * Calcula distancia física entre dos criaturas
     * @param {Creature} creature1 
     * @param {Creature} creature2 
     * @returns {number}
     */
    calculateDistance(creature1, creature2) {
        const dx = creature1.x - creature2.x;
        const dy = creature1.y - creature2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calcula posición para spawn de cría (punto medio entre padres)
     * @param {Creature} parent1 
     * @param {Creature} parent2 
     * @returns {Object} - {x, y}
     */
    calculateOffspringPosition(parent1, parent2) {
        return {
            x: (parent1.x + parent2.x) / 2,
            y: (parent1.y + parent2.y) / 2
        };
    }

    /**
     * Obtiene estadísticas del sistema
     * @returns {Object}
     */
    getStats() {
        return {
            ...this.stats,
            activeCooldowns: this.reproductionCooldowns.size
        };
    }

    /**
     * Limpia cooldowns de criaturas muertas
     * @param {Array} aliveCreatureIds - IDs de criaturas vivas
     */
    cleanupCooldowns(aliveCreatureIds) {
        const aliveSet = new Set(aliveCreatureIds);
        for (const [creatureId] of this.reproductionCooldowns) {
            if (!aliveSet.has(creatureId)) {
                this.reproductionCooldowns.delete(creatureId);
            }
        }
    }
}

// Crear instancia global
const gameReproduction = new Reproduction();

// Hacer disponible globalmente
window.Reproduction = Reproduction;
window.gameReproduction = gameReproduction; 