/**
 * Genes.js - Definiciones genéticas específicas
 * 
 * Define cómo cada gen afecta las características de las criaturas
 * y proporciona utilidades para aplicar efectos genéticos.
 * 
 * Fase 3.0: Genes básicos (speed, size, vision, color)
 */

class Genes {
    /**
     * Aplica los efectos de los genes a las stats de una criatura
     */
    static applyToCreature(creature, dna) {
        if (!creature || !dna) return;
        
        // Aplicar gen de velocidad
        const speedMultiplier = dna.getGene('speed');
        creature.baseSpeed = creature.baseSpeed * speedMultiplier;
        
        // Aplicar gen de tamaño
        const sizeMultiplier = dna.getGene('size');
        creature.radius = creature.radius * sizeMultiplier;
        
        // Aplicar gen de visión
        const visionRange = dna.getGene('vision');
        if (creature.visionSystem) {
            creature.visionSystem.range = visionRange;
        }
        
        // Aplicar genes de color
        const colorR = dna.getGene('color_r');
        const colorG = dna.getGene('color_g');
        const colorB = dna.getGene('color_b');
        creature.geneticColor = this.generateGeneticColor(colorR, colorG, colorB);
    }
    
    /**
     * Genera color basado en genes RGB
     */
    static generateGeneticColor(r, g, b) {
        // Mapear genes (0-1) a paleta bioluminiscente
        const colors = [
            { base: 0x00fff0, name: 'cyan' },    // Cyan a verde agua
            { base: 0xff00ff, name: 'magenta' }, // Rosa a violeta
            { base: 0xffff00, name: 'yellow' }   // Amarillo a naranja
        ];
        
        // Seleccionar color base según gen R
        const colorIndex = Math.floor(r * colors.length);
        const baseColor = colors[Math.min(colorIndex, colors.length - 1)].base;
        
        // Modificar con genes G y B
        const red = ((baseColor >> 16) & 0xFF) * (0.5 + g * 0.5);
        const green = ((baseColor >> 8) & 0xFF) * (0.5 + b * 0.5);
        const blue = (baseColor & 0xFF) * (0.7 + r * 0.3);
        
        return (Math.floor(red) << 16) | (Math.floor(green) << 8) | Math.floor(blue);
    }
    
    /**
     * Calcula la diferencia genética entre dos ADNs
     */
    static calculateGeneticDistance(dna1, dna2) {
        if (!dna1 || !dna2) return 1.0;
        
        let totalDistance = 0;
        let geneCount = 0;
        
        for (const geneName of Object.keys(CONSTANTS.GENETICS.GENES)) {
            const gene1 = dna1.getGene(geneName);
            const gene2 = dna2.getGene(geneName);
            const config = CONSTANTS.GENETICS.GENES[geneName];
            
            // Normalizar diferencia al rango del gen
            const range = config.max - config.min;
            const distance = Math.abs(gene1 - gene2) / range;
            
            totalDistance += distance;
            geneCount++;
        }
        
        return geneCount > 0 ? totalDistance / geneCount : 1.0;
    }
    
    /**
     * Obtiene descripción legible de un gen
     */
    static getGeneDescription(geneName, value) {
        const descriptions = {
            speed: this.getSpeedDescription(value),
            size: this.getSizeDescription(value),
            vision: this.getVisionDescription(value),
            color_r: 'Componente rojo',
            color_g: 'Componente verde',
            color_b: 'Componente azul'
        };
        
        return descriptions[geneName.toLowerCase()] || 'Gen desconocido';
    }
    
    static getSpeedDescription(value) {
        if (value < 0.7) return 'Muy lenta';
        if (value < 1.0) return 'Lenta';
        if (value < 1.3) return 'Normal';
        if (value < 1.7) return 'Rápida';
        return 'Muy rápida';
    }
    
    static getSizeDescription(value) {
        if (value < 0.8) return 'Muy pequeña';
        if (value < 0.9) return 'Pequeña';
        if (value < 1.1) return 'Normal';
        if (value < 1.2) return 'Grande';
        return 'Muy grande';
    }
    
    static getVisionDescription(value) {
        if (value < 150) return 'Visión corta';
        if (value < 200) return 'Visión normal';
        if (value < 250) return 'Buena visión';
        return 'Visión excelente';
    }
}

// Hacer disponible globalmente
window.Genes = Genes; 