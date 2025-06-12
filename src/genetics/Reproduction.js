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
        this.rejectionCooldowns = new Map(); // male.id -> timestamp (machos rechazados)
        this.femaleSelections = new Map(); // female.id -> {suitors: [], selectedMale: null}
        
        this.stats = {
            totalReproductions: 0,
            successfulMatings: 0,
            failedCompatibility: 0,
            averageGeneticDistance: 0,
            maleRejections: 0,
            femaleSelections: 0
        };
        
        // 🔍 DIAGNÓSTICO: Sistema de logs agregados
        this.diagnostics = {
            lastSummary: Date.now(),
            summaryInterval: 5000, // 5 segundos
            activeCourting: new Set(),
            activeMating: new Set(),
            distanceFailures: 0,
            energyFailures: 0
        };
        
        console.log('Reproduction: Sistema con género inicializado');
    }

    /**
     * Busca pareja para una criatura (solo machos buscan)
     * @param {Creature} creature - Criatura que busca pareja
     * @param {Array} allCreatures - Todas las criaturas disponibles
     * @returns {Creature|null} - Hembra encontrada o null
     */
    findMate(creature, allCreatures) {
        // Solo los machos buscan pareja
        if (!creature.dna || !creature.dna.isMale()) {
            return null;
        }

        // Verificar si puede reproducirse
        if (!this.canReproduce(creature)) {
            return null;
        }

        // Verificar cooldown de rechazo
        if (this.isRejected(creature)) {
            return null;
        }

        // Buscar hembras disponibles
        const availableFemales = allCreatures.filter(other => {
            // No puede reproducirse consigo misma
            if (other.id === creature.id) return false;
            
            // Debe ser hembra
            if (!other.dna || !other.dna.isFemale()) return false;
            
            // La hembra también debe poder reproducirse
            if (!this.canReproduce(other)) return false;
            
            // Verificar distancia física
            const distance = this.calculateDistance(creature, other);
            if (distance > this.config.searchRadius) return false;
            
            // Verificar parentesco (prevenir incesto)
            if (window.gameLineage && !window.gameLineage.canMate(creature, other)) {
                return false;
            }
            
            // Verificar que la hembra no tenga demasiados pretendientes
            const selection = this.femaleSelections.get(other.id);
            if (selection && selection.suitors.length >= CONSTANTS.REPRODUCTION.GENDER.MAX_SUITORS) {
                return false;
            }
            
            return true;
        });

        // Encontrar la hembra más cercana
        if (availableFemales.length === 0) {
            return null;
        }

        const closestFemale = availableFemales.reduce((closest, female) => {
            const distanceToFemale = this.calculateDistance(creature, female);
            const distanceToClosest = this.calculateDistance(creature, closest);
            return distanceToFemale < distanceToClosest ? female : closest;
        });

        // Verificar si ya fue seleccionado por esta hembra
        const selectedMale = this.getSelectedMale(closestFemale);
        if (selectedMale && selectedMale.id === creature.id) {
            // Ya fue seleccionado, devolver la hembra para que pueda cortejar
            return closestFemale;
        }

        // Registrar al macho como pretendiente
        this.addSuitor(closestFemale, creature);

        // Verificar si fue seleccionado después de addSuitor
        const newSelectedMale = this.getSelectedMale(closestFemale);
        if (newSelectedMale && newSelectedMale.id === creature.id) {
            // Fue seleccionado, puede empezar cortejo
            return closestFemale;
        }

        // No fue seleccionado, no devolver hembra (no puede cortejar aún)
        return null;
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
        
        // Verificar madurez (solo adultos) - fixfeatures
        if (creature.growth && !creature.growth.canReproduce()) {
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
     * Ejecuta la reproducción entre macho y hembra
     * @param {Creature} male - Macho
     * @param {Creature} female - Hembra
     * @returns {Object|null} - Información del offspring o null si falla
     */
    reproduce(male, female) {
        // 🔄 SINCRONIZACIÓN BIDIRECCIONAL: Verificar antes de proceder
        return this.attemptReproduction(male, female);
    }

    /**
     * 🔄 NUEVO: Intenta reproducción con verificación bidireccional
     * @param {Creature} male - Macho
     * @param {Creature} female - Hembra
     * @returns {Object|null} - Información del offspring o null si falla
     */
    attemptReproduction(male, female) {
        // Verificar géneros correctos
        if (!male.dna || !female.dna || !male.dna.isMale() || !female.dna.isFemale()) {
            return null;
        }

        // Verificar que ambos pueden reproducirse
        if (!this.canReproduce(male) || !this.canReproduce(female)) {
            return null;
        }

        // 🔄 VERIFICACIÓN BIDIRECCIONAL: Ambos deben reconocerse mutuamente
        const maleTarget = male.behavior?.states?.getTarget();
        const femaleTarget = female.behavior?.states?.getTarget();
        
        // Verificar referencias bidireccionales
        if (!maleTarget || maleTarget.id !== female.id) {
            this.clearMatingReferences(male, female);
            return null;
        }
        
        if (!femaleTarget || femaleTarget.id !== male.id) {
            this.clearMatingReferences(male, female);
            return null;
        }

        // 🔄 VERIFICAR ESTADOS CORRECTOS: Ambos deben estar en MATING
        const maleState = male.behavior?.states?.getCurrentState();
        const femaleState = female.behavior?.states?.getCurrentState();
        
        if (maleState !== CREATURE_STATES.MATING || femaleState !== CREATURE_STATES.MATING) {
            this.clearMatingReferences(male, female);
            return null;
        }

        // 🔄 VERIFICAR DISTANCIA MÍNIMA
        const distance = this.calculateDistance(male, female);
        if (distance > CONSTANTS.REPRODUCTION.MATING_DISTANCE) {
            return null;
        }

        // ✅ TODAS LAS VERIFICACIONES PASADAS - PROCEDER CON REPRODUCCIÓN
        return this.performReproduction(male, female);
    }

    /**
     * 🔄 NUEVO: Ejecuta la reproducción después de todas las verificaciones
     * @param {Creature} male - Macho verificado
     * @param {Creature} female - Hembra verificada
     * @returns {Object} - Información del offspring
     */
    performReproduction(male, female) {
        // Calcular distancia genética para estadísticas
        const geneticDistance = GeneticUtils.calculateGeneticDistance(male.dna, female.dna);
        
        // Mezclar genes (50/50)
        const offspringDNA = this.mixGenes(male.dna, female.dna);
        
        // Consumir energía de los padres
        male.energySystem.consume(this.config.energyCost);
        female.energySystem.consume(this.config.energyCost);
        
        // Establecer cooldown
        const now = Date.now();
        this.reproductionCooldowns.set(male.id, now);
        this.reproductionCooldowns.set(female.id, now);

        // Limpiar selección femenina
        this.clearFemaleSelection(female);
        
        // 🔄 LIMPIAR REFERENCIAS BIDIRECCIONALES (después de reproducción exitosa)
        this.clearMatingReferences(male, female, true);
        
        // Actualizar estadísticas
        this.stats.totalReproductions++;
        this.stats.successfulMatings++;
        this.stats.averageGeneticDistance = 
            (this.stats.averageGeneticDistance * (this.stats.successfulMatings - 1) + geneticDistance) / 
            this.stats.successfulMatings;

        // Calcular posición del offspring (punto medio)
        const offspringX = (male.x + female.x) / 2;
        const offspringY = (male.y + female.y) / 2;
        
        // Emitir evento
        if (window.eventBus) {
            eventBus.emit('reproduction:successful', {
                parent1: male.id,
                parent2: female.id,
                geneticDistance,
                offspringDNA,
                parentageData: { parent1: male, parent2: female } // Para establecer parentesco después
            });
        }

        return {
            dna: offspringDNA,
            x: offspringX,
            y: offspringY,
            energy: this.config.offspringEnergy,
            parents: [male, female]
        };
    }

    /**
     * 🔄 NUEVO: Sincroniza transición bidireccional a estado MATING
     * @param {Creature} male - Macho que inicia transición
     * @param {Creature} female - Hembra comprometida
     * @returns {boolean} - true si la transición fue exitosa
     */
    synchronizeMatingTransition(male, female) {
        // Verificar que la hembra esté en estado COMMITTED con este macho
        const femaleState = female.behavior?.states?.getCurrentState();
        const femaleTarget = female.behavior?.states?.getTarget();
        
        if (femaleState !== CREATURE_STATES.COMMITTED || !femaleTarget || femaleTarget.id !== male.id) {
            return false;
        }
        
        // Verificar distancia para transición
        const distance = this.calculateDistance(male, female);
        if (distance > CONSTANTS.REPRODUCTION.MATING_DISTANCE) {
            return false;
        }
        
        // ✅ TRANSICIÓN SINCRONIZADA: Ambos a MATING simultáneamente
        const maleSuccess = male.behavior.states.setState(CREATURE_STATES.MATING, female);
        const femaleSuccess = female.behavior.states.setState(CREATURE_STATES.MATING, male);
        
        if (maleSuccess && femaleSuccess) {
            return true;
        } else {
            // Limpiar estados inconsistentes
            this.clearMatingReferences(male, female);
            return false;
        }
    }

    /**
     * 🔄 NUEVO: Limpia referencias de apareamiento inconsistentes
     * @param {Creature} creature1 - Primera criatura
     * @param {Creature} creature2 - Segunda criatura
     * @param {boolean} isSuccessfulReproduction - Si es después de reproducción exitosa
     */
    clearMatingReferences(creature1, creature2, isSuccessfulReproduction = false) {
        // Solo aplicar cooldown si NO es después de reproducción exitosa
        // (porque performReproduction ya estableció el cooldown correcto)
        if (!isSuccessfulReproduction) {
            const cooldownTime = 2000; // 2 segundos para fallos
            const now = Date.now();
            
            this.reproductionCooldowns.set(creature1.id, now);
            this.reproductionCooldowns.set(creature2.id, now);
        }
        
        // Resetear ambas criaturas a IDLE si están en MATING
        if (creature1.behavior?.states?.isInState(CREATURE_STATES.MATING)) {
            creature1.behavior.states.setState(CREATURE_STATES.IDLE);
        }
        
        if (creature2.behavior?.states?.isInState(CREATURE_STATES.MATING)) {
            creature2.behavior.states.setState(CREATURE_STATES.IDLE);
        }
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
     * 🔍 DIAGNÓSTICO: Actualiza y muestra resumen de reproducción
     */
    updateDiagnostics() {
        const now = Date.now();
        if (now - this.diagnostics.lastSummary >= this.diagnostics.summaryInterval) {
            // Contar estados actuales
            let courtingPairs = 0;
            let matingPairs = 0;
            
            if (window.gameEngine && window.gameEngine.creatureManager) {
                const creatures = window.gameEngine.creatureManager.getAllCreatures().filter(c => c.isAlive);
                courtingPairs = creatures.filter(c => 
                    c.behavior?.states?.isInState?.(CREATURE_STATES.COURTING)
                ).length;
                matingPairs = creatures.filter(c => 
                    c.behavior?.states?.isInState?.(CREATURE_STATES.MATING)
                ).length;
            }
            
            // Diagnóstico silencioso - información disponible en debug overlay
            
            this.diagnostics.lastSummary = now;
            // Reset contadores para próximo período
            this.diagnostics.distanceFailures = 0;
        }
    }

    /**
     * Obtiene estadísticas del sistema
     * @returns {Object}
     */
    getStats() {
        // Actualizar diagnósticos
        this.updateDiagnostics();
        
        return {
            ...this.stats,
            activeCooldowns: this.reproductionCooldowns.size,
            rejectedMales: this.rejectionCooldowns.size,
            activeFemaleSelections: this.femaleSelections.size
        };
    }

    /**
     * Agrega un macho como pretendiente de una hembra
     * @param {Creature} female - Hembra
     * @param {Creature} male - Macho pretendiente
     */
    addSuitor(female, male) {
        if (!this.femaleSelections.has(female.id)) {
            this.femaleSelections.set(female.id, {
                suitors: [],
                selectedMale: null,
                selectionTime: null
            });
        }

        const selection = this.femaleSelections.get(female.id);
        
        // Agregar macho si no está ya en la lista
        if (!selection.suitors.find(s => s.id === male.id)) {
            selection.suitors.push(male);
        }

        // Si es el primer pretendiente o han pasado 2 segundos, hacer selección
        if (selection.suitors.length === 1 || 
            (selection.selectionTime && Date.now() - selection.selectionTime > 2000)) {
            this.performFemaleSelection(female);
        }
    }

    /**
     * La hembra selecciona al mejor macho
     * @param {Creature} female - Hembra que selecciona
     */
    performFemaleSelection(female) {
        const selection = this.femaleSelections.get(female.id);
        if (!selection || selection.suitors.length === 0) return;

        // Calcular puntuación para cada pretendiente
        const scoredSuitors = selection.suitors.map(male => {
            const distance = this.calculateDistance(female, male);
            const factors = CONSTANTS.REPRODUCTION.GENDER.SELECTION_FACTORS;
            
            // Normalizar valores (0-1, mayor es mejor)
            const distanceScore = Math.max(0, 1 - (distance / this.config.searchRadius));
            const speedScore = (male.dna.getGene('SPEED') - 0.5) / 1.5; // 0.5-2.0 -> 0-1
            const sizeScore = (male.dna.getGene('SIZE') - 0.7) / 0.6;   // 0.7-1.3 -> 0-1
            const visionScore = (male.dna.getGene('VISION') - 100) / 200; // 100-300 -> 0-1
            
            const totalScore = 
                distanceScore * factors.DISTANCE +
                speedScore * factors.SPEED +
                sizeScore * factors.SIZE +
                visionScore * factors.VISION;

            return { male, score: totalScore, distance };
        });

        // Seleccionar al mejor macho
        const bestSuitor = scoredSuitors.reduce((best, current) => 
            current.score > best.score ? current : best
        );

        selection.selectedMale = bestSuitor.male;
        selection.selectionTime = Date.now();

        // Rechazar a los otros machos
        const rejectedMales = selection.suitors.filter(male => male.id !== bestSuitor.male.id);
        rejectedMales.forEach(male => this.rejectMale(male));

        // Limpiar lista de pretendientes, mantener solo el elegido
        selection.suitors = [bestSuitor.male];

        // 🔄 NUEVO: Poner hembra en estado COMMITTED con el macho seleccionado
        const commitSuccess = female.behavior?.states?.setState(CREATURE_STATES.COMMITTED, bestSuitor.male);
        
        if (commitSuccess) {
            this.stats.femaleSelections++;
        } else {
            // Limpiar selección si falló el compromiso
            this.clearFemaleSelection(female);
        }
    }

    /**
     * Rechaza un macho y aplica cooldown
     * @param {Creature} male - Macho rechazado
     */
    rejectMale(male) {
        this.rejectionCooldowns.set(male.id, Date.now());
        this.stats.maleRejections++;
    }

    /**
     * Verifica si un macho está en cooldown de rechazo
     * @param {Creature} male - Macho a verificar
     * @returns {boolean}
     */
    isRejected(male) {
        const rejectionTime = this.rejectionCooldowns.get(male.id);
        if (!rejectionTime) return false;

        const timeSince = Date.now() - rejectionTime;
        if (timeSince >= CONSTANTS.REPRODUCTION.GENDER.REJECTION_COOLDOWN) {
            this.rejectionCooldowns.delete(male.id);
            return false;
        }

        return true;
    }

    /**
     * Obtiene el macho seleccionado por una hembra
     * @param {Creature} female - Hembra
     * @returns {Creature|null} - Macho seleccionado o null
     */
    getSelectedMale(female) {
        const selection = this.femaleSelections.get(female.id);
        return selection ? selection.selectedMale : null;
    }

    /**
     * Verifica si una hembra tiene pretendientes activos
     * @param {Creature} female - Hembra
     * @returns {boolean} - True si tiene pretendientes
     */
    hasSuitors(female) {
        const selection = this.femaleSelections.get(female.id);
        return selection && selection.suitors.length > 0;
    }

    /**
     * Obtiene el número de pretendientes de una hembra
     * @param {Creature} female - Hembra
     * @returns {number} - Número de pretendientes
     */
    getSuitorCount(female) {
        const selection = this.femaleSelections.get(female.id);
        return selection ? selection.suitors.length : 0;
    }

    /**
     * Limpia selección de una hembra (después de reproducirse)
     * @param {Creature} female - Hembra
     */
    clearFemaleSelection(female) {
        this.femaleSelections.delete(female.id);
    }

    /**
     * Limpia cooldowns de criaturas muertas
     * @param {Array} aliveCreatureIds - IDs de criaturas vivas
     */
    cleanupCooldowns(aliveCreatureIds) {
        const aliveSet = new Set(aliveCreatureIds);
        
        // Limpiar cooldowns de reproducción
        for (const [creatureId] of this.reproductionCooldowns) {
            if (!aliveSet.has(creatureId)) {
                this.reproductionCooldowns.delete(creatureId);
            }
        }

        // Limpiar cooldowns de rechazo
        for (const [creatureId] of this.rejectionCooldowns) {
            if (!aliveSet.has(creatureId)) {
                this.rejectionCooldowns.delete(creatureId);
            }
        }

        // Limpiar selecciones femeninas
        for (const [femaleId] of this.femaleSelections) {
            if (!aliveSet.has(femaleId)) {
                this.femaleSelections.delete(femaleId);
            }
        }
    }
}

// Crear instancia global
const gameReproduction = new Reproduction();

// Hacer disponible globalmente
window.Reproduction = Reproduction;
window.gameReproduction = gameReproduction; 