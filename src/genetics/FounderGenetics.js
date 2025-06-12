/**
 * GenAI - Sistema de Genética de Fundadores
 * CAJA 3 - Fase 3.1: Sistema de Género
 * 
 * Genera los 10 fundadores iniciales con 5 machos y 5 hembras
 */

class FounderGenetics {
    constructor() {
        this.foundersGenerated = 0;
        this.malesGenerated = 0;
        this.femalesGenerated = 0;
        this.targetMales = 5;
        this.targetFemales = 5;
        
        console.log('FounderGenetics: Sistema de fundadores inicializado');
    }

    /**
     * Genera DNA para un fundador con género balanceado
     * @returns {DNA} - DNA del fundador
     */
    generateFounderDNA() {
        if (this.foundersGenerated >= 10) {
            console.warn('FounderGenetics: Ya se generaron todos los fundadores');
            return new DNA(); // DNA aleatorio normal
        }

        // Determinar género según balance
        let targetGender;
        if (this.malesGenerated < this.targetMales && this.femalesGenerated < this.targetFemales) {
            // Ambos géneros disponibles, alternar
            targetGender = this.foundersGenerated % 2 === 0 ? 'male' : 'female';
        } else if (this.malesGenerated < this.targetMales) {
            targetGender = 'male';
        } else {
            targetGender = 'female';
        }

        // Generar genes aleatorios
        const genes = {};
        for (const [geneName, config] of Object.entries(CONSTANTS.GENETICS.GENES)) {
            if (geneName === 'GENDER') {
                // Asignar género específico
                genes[geneName.toLowerCase()] = targetGender === 'male' ? 0.25 : 0.75;
            } else {
                // Genes aleatorios normales
                genes[geneName.toLowerCase()] = config.min + Math.random() * (config.max - config.min);
            }
        }

        // Crear DNA con genes específicos
        const dna = new DNA(genes);
        dna.generation = 0; // Fundadores son generación 0
        
        // Actualizar contadores
        this.foundersGenerated++;
        if (targetGender === 'male') {
            this.malesGenerated++;
        } else {
            this.femalesGenerated++;
        }

        console.log(`FounderGenetics: Fundador ${this.foundersGenerated}/10 generado - ${targetGender} (M:${this.malesGenerated}, F:${this.femalesGenerated})`);

        return dna;
    }

    /**
     * Verifica si aún quedan fundadores por generar
     * @returns {boolean}
     */
    hasFoundersRemaining() {
        return this.foundersGenerated < 10;
    }

    /**
     * Obtiene estadísticas de fundadores
     * @returns {Object}
     */
    getStats() {
        return {
            total: this.foundersGenerated,
            males: this.malesGenerated,
            females: this.femalesGenerated,
            remaining: 10 - this.foundersGenerated,
            isComplete: this.foundersGenerated >= 10
        };
    }

    /**
     * Reinicia el sistema de fundadores
     */
    reset() {
        this.foundersGenerated = 0;
        this.malesGenerated = 0;
        this.femalesGenerated = 0;
        console.log('FounderGenetics: Sistema reiniciado');
    }
}

// Crear instancia global
const gameFounderGenetics = new FounderGenetics();

// Hacer disponible globalmente
window.FounderGenetics = FounderGenetics;
window.gameFounderGenetics = gameFounderGenetics; 