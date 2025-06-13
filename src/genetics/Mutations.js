/**
 * Sistema de Mutaciones - Arquitectura Dual
 * Funcionalidad: Mutación genética simple con probabilidad configurable
 * Performance: Cache de cálculos, throttling de mutaciones, optimización de memoria
 */

import { CONSTANTS } from '../core/Constants.js';
import { gameRandom } from '../utils/Random.js';

class Mutations {
    constructor() {
        // Performance: Cache de mutaciones recientes para evitar recálculos
        this.mutationCache = new Map();
        this.cacheTimeout = 1000; // 1 segundo
        
        // Performance: Throttling de mutaciones para evitar spam
        this.lastMutationTime = 0;
        this.mutationCooldown = 100; // ms mínimo entre mutaciones
        
        // Funcionalidad: Configuración de mutaciones
        this.config = CONSTANTS.MUTATIONS;
    }

    /**
     * Aplica mutaciones a un DNA con arquitectura dual
     * @param {Object} dna - DNA a mutar
     * @returns {Object} { dna: mutatedDNA, hasMutation: boolean }
     */
    mutateDNA(dna) {
        // Performance: Verificar throttling
        const now = Date.now();
        if (now - this.lastMutationTime < this.mutationCooldown) {
            return { dna: { ...dna }, hasMutation: false };
        }

        // Performance: Verificar cache
        const cacheKey = this.generateCacheKey(dna);
        if (this.mutationCache.has(cacheKey)) {
            return this.mutationCache.get(cacheKey);
        }

        // Funcionalidad: Aplicar mutaciones
        const mutatedDNA = { ...dna };
        let hasMutation = false;

        // Iterar sobre todos los genes
        for (const geneType in mutatedDNA) {
            if (this.shouldMutateGene()) {
                mutatedDNA[geneType] = this.mutateGeneValue(mutatedDNA[geneType], geneType);
                hasMutation = true;
            }
        }

        const result = { dna: mutatedDNA, hasMutation };

        // Performance: Guardar en cache con timeout
        this.mutationCache.set(cacheKey, result);
        setTimeout(() => this.mutationCache.delete(cacheKey), this.cacheTimeout);
        
        this.lastMutationTime = now;
        return result;
    }

    /**
     * Determina si un gen debe mutar (10% probabilidad)
     */
    shouldMutateGene() {
        return gameRandom.randomFloat(0, 1) < this.config.PROBABILITY;
    }

    /**
     * Muta el valor de un gen específico (±20% variación)
     */
    mutateGeneValue(currentValue, geneType) {
        const variation = this.config.VARIATION;
        const change = gameRandom.randomFloat(-variation, variation);
        const newValue = currentValue * (1 + change);
        
        // Aplicar límites según tipo de gen
        return this.clampGeneValue(newValue, geneType);
    }

    /**
     * Aplica límites a los valores de genes mutados
     */
    clampGeneValue(value, geneType) {
        const limits = this.config.GENE_LIMITS[geneType];
        if (limits) {
            return Math.max(limits.min, Math.min(limits.max, value));
        }
        return value;
    }

    /**
     * Genera clave de cache para DNA (Performance)
     */
    generateCacheKey(dna) {
        return Object.values(dna).map(v => v.toFixed(2)).join('|');
    }

    /**
     * Limpia cache de mutaciones (Performance)
     */
    clearCache() {
        this.mutationCache.clear();
    }

    /**
     * Obtiene estadísticas del sistema (Debug)
     */
    getStats() {
        return {
            cacheSize: this.mutationCache.size,
            lastMutationTime: this.lastMutationTime,
            cooldownActive: Date.now() - this.lastMutationTime < this.mutationCooldown
        };
    }
}

// Instancia global del sistema de mutaciones
export const gameMutations = new Mutations(); 