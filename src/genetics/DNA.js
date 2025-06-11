/**
 * DNA.js - Estructura del ADN de las criaturas
 * 
 * Representa el código genético de cada criatura con genes básicos
 * que afectan sus características físicas y comportamentales.
 * 
 * Fase 3.0: Genes básicos (speed, size, vision, color)
 */

class DNA {
    constructor(genes = null) {
        this.id = this.generateId();
        this.generation = 0;
        this.parentIds = [];
        this.createdAt = Date.now();
        
        // Inicializar genes
        if (genes) {
            this.genes = { ...genes };
        } else {
            this.genes = this.generateRandomGenes();
        }
        
        // Validar genes
        this.validateGenes();
        
        if (window.eventBus) {
            eventBus.emit('dna:created', { dna: this });
        }
    }
    
    /**
     * Genera genes aleatorios dentro de los rangos válidos
     */
    generateRandomGenes() {
        const genes = {};
        
        for (const [geneName, config] of Object.entries(CONSTANTS.GENETICS.GENES)) {
            genes[geneName.toLowerCase()] = this.randomInRange(config.min, config.max);
        }
        
        return genes;
    }
    
    /**
     * Valida que todos los genes estén dentro de rangos válidos
     */
    validateGenes() {
        for (const [geneName, config] of Object.entries(CONSTANTS.GENETICS.GENES)) {
            const geneKey = geneName.toLowerCase();
            const value = this.genes[geneKey];
            
            if (value < config.min || value > config.max) {
                console.warn(`Gen ${geneKey} fuera de rango: ${value}`);
                this.genes[geneKey] = Math.max(config.min, Math.min(config.max, value));
            }
        }
    }
    
    /**
     * Obtiene el valor de un gen específico
     */
    getGene(geneName) {
        return this.genes[geneName.toLowerCase()] || CONSTANTS.GENETICS.GENES[geneName.toUpperCase()]?.default || 1.0;
    }
    
    /**
     * Establece el valor de un gen específico
     */
    setGene(geneName, value) {
        const geneKey = geneName.toLowerCase();
        const config = CONSTANTS.GENETICS.GENES[geneName.toUpperCase()];
        
        if (config) {
            this.genes[geneKey] = Math.max(config.min, Math.min(config.max, value));
        }
    }
    
    /**
     * Genera un ID único para el ADN
     */
    generateId() {
        return 'dna_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Genera número aleatorio en rango
     */
    randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }
    
    /**
     * Clona el ADN actual
     */
    clone() {
        const clonedDNA = new DNA(this.genes);
        clonedDNA.generation = this.generation;
        clonedDNA.parentIds = [...this.parentIds];
        return clonedDNA;
    }
    
    /**
     * Obtiene información del ADN para debug
     */
    getInfo() {
        return {
            id: this.id,
            generation: this.generation,
            genes: { ...this.genes },
            parentIds: [...this.parentIds],
            age: Date.now() - this.createdAt
        };
    }
}

// Hacer disponible globalmente
window.DNA = DNA; 