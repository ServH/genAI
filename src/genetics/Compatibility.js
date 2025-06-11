/**
 * Sistema de Compatibilidad Genética - CAJA 3 Fase 3.1
 * Calcula compatibilidad entre criaturas para reproducción
 */
class Compatibility {
    constructor() {
        this.config = {
            maxGeneticDistance: 0.8,    // máxima distancia permitida (más permisivo)
            minGeneticDistance: 0.05,   // mínima distancia (evita clones, más permisivo)
            compatibilityThreshold: 0.5, // umbral de compatibilidad general
            geneWeights: {              // peso de cada gen en compatibilidad
                SPEED: 1.0,
                SIZE: 1.0,
                VISION: 1.0,
                COLOR_R: 0.5,
                COLOR_G: 0.5,
                COLOR_B: 0.5
            }
        };
        
        this.stats = {
            totalChecks: 0,
            compatiblePairs: 0,
            incompatiblePairs: 0,
            averageDistance: 0
        };
        
        console.log('Compatibility: Sistema inicializado');
    }

    /**
     * Verifica si dos criaturas son genéticamente compatibles
     * @param {DNA} dna1 - DNA de la primera criatura
     * @param {DNA} dna2 - DNA de la segunda criatura
     * @returns {boolean} - true si son compatibles
     */
    areCompatible(dna1, dna2) {
        if (!dna1 || !dna2) return false;
        
        const distance = this.calculateGeneticDistance(dna1, dna2);
        
        // Actualizar estadísticas
        this.stats.totalChecks++;
        this.stats.averageDistance = 
            (this.stats.averageDistance * (this.stats.totalChecks - 1) + distance) / 
            this.stats.totalChecks;
        
        // Compatibilidad basada en distancia genética
        const isCompatible = distance >= this.config.minGeneticDistance && 
                           distance <= this.config.maxGeneticDistance;
        
        if (isCompatible) {
            this.stats.compatiblePairs++;
        } else {
            this.stats.incompatiblePairs++;
        }
        
        return isCompatible;
    }

    /**
     * Calcula la distancia genética entre dos DNA
     * @param {DNA} dna1 - Primer DNA
     * @param {DNA} dna2 - Segundo DNA
     * @returns {number} - Distancia genética (0-1)
     */
    calculateGeneticDistance(dna1, dna2) {
        if (!dna1 || !dna2 || !dna1.genes || !dna2.genes) return 1.0;
        
        let totalDistance = 0;
        let totalWeight = 0;
        
        // Calcular distancia ponderada para cada gen
        Object.keys(this.config.geneWeights).forEach(geneName => {
            if (dna1.genes[geneName] !== undefined && dna2.genes[geneName] !== undefined) {
                const weight = this.config.geneWeights[geneName];
                const geneDistance = this.calculateGeneDistance(
                    dna1.genes[geneName], 
                    dna2.genes[geneName], 
                    geneName
                );
                
                totalDistance += geneDistance * weight;
                totalWeight += weight;
            }
        });
        
        return totalWeight > 0 ? totalDistance / totalWeight : 1.0;
    }

    /**
     * Calcula la distancia entre dos valores de un gen específico
     * @param {number} value1 - Valor del primer gen
     * @param {number} value2 - Valor del segundo gen
     * @param {string} geneName - Nombre del gen
     * @returns {number} - Distancia normalizada (0-1)
     */
    calculateGeneDistance(value1, value2, geneName) {
        // Obtener rango del gen desde Constants
        const geneConfig = CONSTANTS.GENETICS.GENES[geneName];
        if (!geneConfig) return 0;
        
        const range = geneConfig.max - geneConfig.min;
        const distance = Math.abs(value1 - value2);
        
        // Normalizar la distancia al rango [0, 1]
        return range > 0 ? distance / range : 0;
    }

    /**
     * Calcula un score de compatibilidad más detallado
     * @param {DNA} dna1 - Primer DNA
     * @param {DNA} dna2 - Segundo DNA
     * @returns {Object} - {score, details}
     */
    calculateCompatibilityScore(dna1, dna2) {
        if (!dna1 || !dna2) {
            return { score: 0, details: {} };
        }
        
        const details = {};
        let totalScore = 0;
        let geneCount = 0;
        
        Object.keys(this.config.geneWeights).forEach(geneName => {
            if (dna1.genes[geneName] !== undefined && dna2.genes[geneName] !== undefined) {
                const distance = this.calculateGeneDistance(
                    dna1.genes[geneName], 
                    dna2.genes[geneName], 
                    geneName
                );
                
                // Convertir distancia a score de compatibilidad (1 - distance)
                const geneScore = 1 - distance;
                details[geneName] = {
                    value1: dna1.genes[geneName],
                    value2: dna2.genes[geneName],
                    distance: distance,
                    score: geneScore,
                    weight: this.config.geneWeights[geneName]
                };
                
                totalScore += geneScore * this.config.geneWeights[geneName];
                geneCount += this.config.geneWeights[geneName];
            }
        });
        
        const finalScore = geneCount > 0 ? totalScore / geneCount : 0;
        
        return {
            score: finalScore,
            details: details,
            isCompatible: this.areCompatible(dna1, dna2)
        };
    }

    /**
     * Encuentra las mejores parejas para una criatura
     * @param {DNA} targetDNA - DNA de la criatura objetivo
     * @param {Array} candidateDNAs - Array de DNA candidatos
     * @param {number} maxResults - Máximo número de resultados
     * @returns {Array} - Array de {dna, score, distance}
     */
    findBestMatches(targetDNA, candidateDNAs, maxResults = 5) {
        if (!targetDNA || !candidateDNAs) return [];
        
        const matches = candidateDNAs
            .filter(dna => dna && this.areCompatible(targetDNA, dna))
            .map(dna => {
                const distance = this.calculateGeneticDistance(targetDNA, dna);
                const score = this.calculateCompatibilityScore(targetDNA, dna);
                return {
                    dna: dna,
                    distance: distance,
                    score: score.score,
                    details: score.details
                };
            })
            .sort((a, b) => b.score - a.score) // Ordenar por mejor score
            .slice(0, maxResults);
        
        return matches;
    }

    /**
     * Predice las características de la descendencia
     * @param {DNA} parent1DNA - DNA del primer padre
     * @param {DNA} parent2DNA - DNA del segundo padre
     * @returns {Object} - Predicción de características
     */
    predictOffspring(parent1DNA, parent2DNA) {
        if (!parent1DNA || !parent2DNA) return null;
        
        const prediction = {
            minValues: {},
            maxValues: {},
            averageValues: {},
            variance: {}
        };
        
        Object.keys(CONSTANTS.GENETICS.GENES).forEach(geneName => {
            if (parent1DNA.genes[geneName] !== undefined && parent2DNA.genes[geneName] !== undefined) {
                const val1 = parent1DNA.genes[geneName];
                const val2 = parent2DNA.genes[geneName];
                
                prediction.minValues[geneName] = Math.min(val1, val2);
                prediction.maxValues[geneName] = Math.max(val1, val2);
                prediction.averageValues[geneName] = (val1 + val2) / 2;
                prediction.variance[geneName] = Math.abs(val1 - val2) / 2;
            }
        });
        
        return prediction;
    }

    /**
     * Obtiene estadísticas del sistema
     * @returns {Object}
     */
    getStats() {
        return {
            ...this.stats,
            compatibilityRate: this.stats.totalChecks > 0 ? 
                this.stats.compatiblePairs / this.stats.totalChecks : 0
        };
    }

    /**
     * Reinicia las estadísticas
     */
    resetStats() {
        this.stats = {
            totalChecks: 0,
            compatiblePairs: 0,
            incompatiblePairs: 0,
            averageDistance: 0
        };
    }
}

// Crear instancia global
const gameCompatibility = new Compatibility();

// Hacer disponible globalmente
window.Compatibility = Compatibility;
window.gameCompatibility = gameCompatibility; 