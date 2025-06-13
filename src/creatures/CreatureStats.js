/**
 * GenAI - Estadísticas de Criaturas
 * CAJA 2 - Fase 2.0: Criatura Mínima
 * 
 * Gestión de estadísticas y métricas del sistema de criaturas
 */

class CreatureStats {
    constructor(manager) {
        this.manager = manager;
        this.updateCounter = 0;
        this.performanceMetrics = {
            avgUpdateTime: 0,
            maxUpdateTime: 0,
            totalUpdates: 0,
            lastUpdateTime: 0
        };
        
        // Métricas de población - fixfeatures
        this.populationMetrics = {
            births: 0,
            deaths: 0,
            totalLifespan: 0,
            startTime: Date.now(),
            generationSum: 0,
            uniqueGenes: new Set(),
            totalGenes: 0
        };
        
        // Configurar event listeners para registrar nacimientos y muertes
        this.setupEventListeners();
    }
    
    /**
     * Configura los event listeners para registrar eventos de población
     */
    setupEventListeners() {
        if (window.eventBus) {
            // Escuchar nacimientos
            window.eventBus.on('creature:offspring_born', (data) => {
                if (data.offspring) {
                    this.recordBirth(data.offspring);
                }
            });
            
            // Escuchar muertes
            window.eventBus.on('creature:died', (data) => {
                if (data.creature) {
                    this.recordDeath(data.creature);
                }
            });
            
            // También escuchar spawns normales (no reproductivos)
            window.eventBus.on('creature:born', (data) => {
                if (data.creature) {
                    this.recordBirth(data.creature);
                }
            });
        }
    }
    
    /**
     * Actualiza las métricas de performance
     */
    updatePerformanceMetrics(updateTime) {
        this.performanceMetrics.lastUpdateTime = updateTime;
        this.performanceMetrics.totalUpdates++;
        
        // Calcular promedio móvil
        const alpha = 0.1; // Factor de suavizado
        this.performanceMetrics.avgUpdateTime = 
            this.performanceMetrics.avgUpdateTime * (1 - alpha) + updateTime * alpha;
        
        // Actualizar máximo
        if (updateTime > this.performanceMetrics.maxUpdateTime) {
            this.performanceMetrics.maxUpdateTime = updateTime;
        }
    }
    
    /**
     * Incrementa el contador de updates
     */
    incrementUpdateCounter() {
        this.updateCounter++;
    }
    
    /**
     * Obtiene el número de criaturas vivas
     */
    getAliveCount() {
        return Array.from(this.manager.creatures.values())
            .filter(c => c.isAlive).length;
    }
    
    /**
     * Obtiene estadísticas básicas
     */
    getBasicStats() {
        const aliveCount = this.getAliveCount();
        
        return {
            totalCreatures: this.manager.creatures.size,
            aliveCreatures: aliveCount,
            sprites: this.manager.sprites.size,
            maxCreatures: this.manager.maxCreatures,
            updateCounter: this.updateCounter
        };
    }
    
    /**
     * Obtiene estadísticas de energía
     */
    getEnergyStats() {
        const creatures = Array.from(this.manager.creatures.values())
            .filter(c => c.isAlive);
        
        if (creatures.length === 0) {
            return {
                avgEnergy: 0,
                minEnergy: 0,
                maxEnergy: 0,
                totalEnergy: 0,
                criticalCount: 0,
                dyingCount: 0
            };
        }
        
        let totalEnergy = 0;
        let minEnergy = Infinity;
        let maxEnergy = -Infinity;
        let criticalCount = 0;
        let dyingCount = 0;
        
        for (const creature of creatures) {
            const energy = creature.energy;
            totalEnergy += energy;
            
            if (energy < minEnergy) minEnergy = energy;
            if (energy > maxEnergy) maxEnergy = energy;
            
            if (creature.energySystem.isCritical()) criticalCount++;
            if (creature.isDying()) dyingCount++;
        }
        
        return {
            avgEnergy: totalEnergy / creatures.length,
            minEnergy: minEnergy === Infinity ? 0 : minEnergy,
            maxEnergy: maxEnergy === -Infinity ? 0 : maxEnergy,
            totalEnergy: totalEnergy,
            criticalCount: criticalCount,
            dyingCount: dyingCount
        };
    }
    
    /**
     * Obtiene estadísticas de movimiento
     */
    getMovementStats() {
        const creatures = Array.from(this.manager.creatures.values())
            .filter(c => c.isAlive);
        
        if (creatures.length === 0) {
            return {
                avgSpeed: 0,
                minSpeed: 0,
                maxSpeed: 0,
                movingCount: 0
            };
        }
        
        let totalSpeed = 0;
        let minSpeed = Infinity;
        let maxSpeed = -Infinity;
        let movingCount = 0;
        
        for (const creature of creatures) {
            const speed = creature.speed;
            totalSpeed += speed;
            
            if (speed < minSpeed) minSpeed = speed;
            if (speed > maxSpeed) maxSpeed = speed;
            
            if (creature.behavior && creature.behavior.isMoving) {
                movingCount++;
            }
        }
        
        return {
            avgSpeed: totalSpeed / creatures.length,
            minSpeed: minSpeed === Infinity ? 0 : minSpeed,
            maxSpeed: maxSpeed === -Infinity ? 0 : maxSpeed,
            movingCount: movingCount
        };
    }
    
    /**
     * Obtiene estadísticas de comportamiento (Fase 2.3 + 3.1)
     */
    getBehaviorStats() {
        const creatures = Array.from(this.manager.creatures.values())
            .filter(c => c.isAlive);
        
        if (creatures.length === 0) {
            return {
                idleCount: 0,
                seekingCount: 0,
                eatingCount: 0,
                matingCount: 0,
                totalWithBehavior: 0
            };
        }
        
        let idleCount = 0;
        let seekingCount = 0;
        let eatingCount = 0;
        let matingCount = 0;
        let totalWithBehavior = 0;
        
        for (const creature of creatures) {
            if (creature.behavior && creature.behavior.states) {
                totalWithBehavior++;
                const state = creature.behavior.states.getCurrentState();
                
                switch (state) {
                    case 'idle':
                        idleCount++;
                        break;
                    case 'seeking':
                        seekingCount++;
                        break;
                    case 'eating':
                        eatingCount++;
                        break;
                    case 'mating':
                        matingCount++;
                        break;
                }
            }
        }
        
        return {
            idleCount,
            seekingCount,
            eatingCount,
            matingCount,
            totalWithBehavior
        };
    }
    
    /**
     * Obtiene estadísticas completas
     */
    getCompleteStats() {
        const basic = this.getBasicStats();
        const energy = this.getEnergyStats();
        const movement = this.getMovementStats();
        const behavior = this.getBehaviorStats();
        const lifecycle = this.manager.lifecycle ? this.manager.lifecycle.getStats() : null;
        const factory = this.manager.factory ? this.manager.factory.getStats() : null;
        const globalEnergy = window.gameEnergy ? gameEnergy.getStats() : null;
        
        return {
            basic,
            energy,
            movement,
            behavior,
            lifecycle,
            factory,
            globalEnergy,
            performance: { ...this.performanceMetrics }
        };
    }
    
    /**
     * Obtiene estadísticas para debug overlay
     */
    getDebugStats() {
        const basic = this.getBasicStats();
        const energy = this.getEnergyStats();
        
        return {
            'Criaturas Activas': `${basic.aliveCreatures}/${basic.totalCreatures}`,
            'Sprites': basic.sprites,
            'Updates': basic.updateCounter,
            'Energía Promedio': energy.avgEnergy.toFixed(1),
            'Críticas': energy.criticalCount,
            'Muriendo': energy.dyingCount,
            'Update Time': `${this.performanceMetrics.avgUpdateTime.toFixed(2)}ms`
        };
    }
    
    /**
     * Reinicia las métricas de performance
     */
    resetPerformanceMetrics() {
        this.performanceMetrics = {
            avgUpdateTime: 0,
            maxUpdateTime: 0,
            totalUpdates: 0,
            lastUpdateTime: 0
        };
    }
    
    /**
     * Registra un nacimiento - fixfeatures
     */
    recordBirth(creature) {
        this.populationMetrics.births++;
        
        // Registrar generación si está disponible
        if (creature.generation !== undefined && creature.generation !== null) {
            this.populationMetrics.generationSum += creature.generation;
        } else {
            // Si no tiene generación, asumir generación 0 (fundador)
            this.populationMetrics.generationSum += 0;
        }
        
        // Registrar información genética si está disponible
        if (creature.dna) {
            this.populationMetrics.totalGenes++;
            // Crear hash simple del DNA para diversidad
            const geneHash = JSON.stringify(creature.dna.genes);
            this.populationMetrics.uniqueGenes.add(geneHash);
        }
        
        console.log(`📊 STATS: Nacimiento registrado - Total: ${this.populationMetrics.births}, Gen: ${creature.generation || 0}`);
    }

    /**
     * Registra una muerte - fixfeatures
     */
    recordDeath(creature) {
        this.populationMetrics.deaths++;
        
        // Registrar edad/tiempo de vida si está disponible
        if (creature.age !== undefined && creature.age !== null) {
            this.populationMetrics.totalLifespan += creature.age;
        } else if (creature.birthTime) {
            // Calcular edad basada en tiempo de nacimiento
            const age = (Date.now() - creature.birthTime) / 1000; // segundos
            this.populationMetrics.totalLifespan += age;
        }
        
        console.log(`💀 STATS: Muerte registrada - Total: ${this.populationMetrics.deaths}, Edad: ${creature.age || 'N/A'}`);
    }

    /**
     * Obtiene métricas de población - fixfeatures
     */
    getPopulationMetrics() {
        const timeElapsed = (Date.now() - this.populationMetrics.startTime) / 1000; // segundos
        const aliveCount = this.getAliveCount();
        
        return {
            birthRate: timeElapsed > 0 ? this.populationMetrics.births / timeElapsed : 0,
            deathRate: timeElapsed > 0 ? this.populationMetrics.deaths / timeElapsed : 0,
            avgLifespan: this.populationMetrics.deaths > 0 ? 
                this.populationMetrics.totalLifespan / this.populationMetrics.deaths : 0,
            avgGeneration: this.populationMetrics.births > 0 ? 
                this.populationMetrics.generationSum / this.populationMetrics.births : 0,
            geneticDiversity: this.populationMetrics.totalGenes > 0 ? 
                this.populationMetrics.uniqueGenes.size / this.populationMetrics.totalGenes : 0,
            sustainabilityIndex: this.populationMetrics.deathRate > 0 ? 
                (this.populationMetrics.births / timeElapsed) / (this.populationMetrics.deaths / timeElapsed) : 1,
            totalBirths: this.populationMetrics.births,
            totalDeaths: this.populationMetrics.deaths,
            currentPopulation: aliveCount,
            timeElapsed: Math.round(timeElapsed)
        };
    }

    /**
     * Limpia el sistema de estadísticas
     */
    destroy() {
        this.manager = null;
        this.updateCounter = 0;
        this.populationMetrics = null;
        this.resetPerformanceMetrics();
    }
}

// Hacer disponible globalmente
window.CreatureStats = CreatureStats; 