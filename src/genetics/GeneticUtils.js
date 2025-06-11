/**
 * GeneticUtils.js - Utilidades para cálculos genéticos
 * 
 * Funciones auxiliares para trabajar con ADN y genes.
 * Validaciones, conversiones y cálculos genéticos.
 * 
 * Fase 3.0: Utilidades básicas para genes fundamentales
 */

class GeneticUtils {
    /**
     * Valida si un valor de gen está dentro del rango permitido
     */
    static isValidGeneValue(geneName, value) {
        const config = CONSTANTS.GENETICS.GENES[geneName.toUpperCase()];
        if (!config) return false;
        
        return value >= config.min && value <= config.max;
    }
    
    /**
     * Normaliza un valor de gen al rango 0-1
     */
    static normalizeGeneValue(geneName, value) {
        const config = CONSTANTS.GENETICS.GENES[geneName.toUpperCase()];
        if (!config) return 0.5;
        
        return (value - config.min) / (config.max - config.min);
    }
    
    /**
     * Desnormaliza un valor 0-1 al rango del gen
     */
    static denormalizeGeneValue(geneName, normalizedValue) {
        const config = CONSTANTS.GENETICS.GENES[geneName.toUpperCase()];
        if (!config) return 1.0;
        
        return config.min + normalizedValue * (config.max - config.min);
    }
    
    /**
     * Clamp un valor de gen a su rango válido
     */
    static clampGeneValue(geneName, value) {
        const config = CONSTANTS.GENETICS.GENES[geneName.toUpperCase()];
        if (!config) return value;
        
        return Math.max(config.min, Math.min(config.max, value));
    }
    
    /**
     * Genera un valor aleatorio para un gen específico
     */
    static randomGeneValue(geneName) {
        const config = CONSTANTS.GENETICS.GENES[geneName.toUpperCase()];
        if (!config) return 1.0;
        
        return config.min + Math.random() * (config.max - config.min);
    }
    
    /**
     * Calcula la diversidad genética de una población
     */
    static calculatePopulationDiversity(dnaArray) {
        if (!dnaArray || dnaArray.length < 2) return 0;
        
        let totalDistance = 0;
        let comparisons = 0;
        
        for (let i = 0; i < dnaArray.length; i++) {
            for (let j = i + 1; j < dnaArray.length; j++) {
                totalDistance += this.calculateGeneticDistance(dnaArray[i], dnaArray[j]);
                comparisons++;
            }
        }
        
        return comparisons > 0 ? totalDistance / comparisons : 0;
    }
    
    /**
     * Calcula distancia genética entre dos ADNs
     */
    static calculateGeneticDistance(dna1, dna2) {
        if (!dna1 || !dna2) return 1.0;
        
        let totalDistance = 0;
        let geneCount = 0;
        
        for (const geneName of Object.keys(CONSTANTS.GENETICS.GENES)) {
            const value1 = dna1.getGene(geneName);
            const value2 = dna2.getGene(geneName);
            
            const normalized1 = this.normalizeGeneValue(geneName, value1);
            const normalized2 = this.normalizeGeneValue(geneName, value2);
            
            totalDistance += Math.abs(normalized1 - normalized2);
            geneCount++;
        }
        
        return geneCount > 0 ? totalDistance / geneCount : 1.0;
    }
    
    /**
     * Obtiene estadísticas de un gen en una población
     */
    static getGeneStats(dnaArray, geneName) {
        if (!dnaArray || dnaArray.length === 0) {
            return { min: 0, max: 0, avg: 0, count: 0 };
        }
        
        const values = dnaArray.map(dna => dna.getGene(geneName));
        
        return {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((sum, val) => sum + val, 0) / values.length,
            count: values.length
        };
    }
    
    /**
     * Convierte genes a formato legible para debug
     */
    static formatGenesForDebug(dna) {
        if (!dna) return {};
        
        const formatted = {};
        
        for (const geneName of Object.keys(CONSTANTS.GENETICS.GENES)) {
            const value = dna.getGene(geneName);
            formatted[geneName] = {
                value: Math.round(value * 1000) / 1000,
                normalized: Math.round(this.normalizeGeneValue(geneName, value) * 100) / 100
            };
        }
        
        return formatted;
    }
}

// Hacer disponible globalmente
window.GeneticUtils = GeneticUtils; 