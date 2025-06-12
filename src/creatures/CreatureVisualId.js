/**
 * GenAI - Sistema de Identificación Visual
 * CAJA 3 - Fase 3.1: fixfeatures
 * 
 * Símbolos y marcas familiares para tracking visual
 */

class CreatureVisualId {
    constructor() {
        this.familySymbols = new Map(); // lineageId -> symbol
        this.availableSymbols = ['♦', '●', '▲', '■', '★', '♠', '♣', '♥', '◆', '▼', '◀', '▶', '⬟', '⬢', '⬡'];
        this.symbolIndex = 0;
        
        console.log('CreatureVisualId: Sistema de identificación visual inicializado');
    }

    /**
     * Obtiene el símbolo para una familia
     */
    getFamilySymbol(lineageId) {
        if (!lineageId) return null;
        
        if (!this.familySymbols.has(lineageId)) {
            // Asignar nuevo símbolo
            const symbol = this.availableSymbols[this.symbolIndex % this.availableSymbols.length];
            this.familySymbols.set(lineageId, symbol);
            this.symbolIndex++;
            
            console.log(`🏷️ VISUAL_ID: Familia ${lineageId} asignada símbolo ${symbol}`);
        }
        
        return this.familySymbols.get(lineageId);
    }

    /**
     * Obtiene el color del símbolo basado en la generación
     */
    getSymbolColor(generation) {
        const colors = [
            '#ffffff', // Gen 0 - Blanco
            '#ffff00', // Gen 1 - Amarillo
            '#ff8000', // Gen 2 - Naranja
            '#ff0000', // Gen 3 - Rojo
            '#ff00ff', // Gen 4 - Magenta
            '#8000ff', // Gen 5+ - Violeta
        ];
        
        const index = Math.min(generation, colors.length - 1);
        return colors[index];
    }

    /**
     * Obtiene información visual completa para una criatura
     */
    getVisualInfo(creature) {
        if (!creature.lineageId) {
            return {
                symbol: null,
                symbolColor: '#ffffff',
                generation: 0,
                hasFamily: false
            };
        }
        
        return {
            symbol: this.getFamilySymbol(creature.lineageId),
            symbolColor: this.getSymbolColor(creature.generation),
            generation: creature.generation,
            hasFamily: true,
            lineageId: creature.lineageId
        };
    }

    /**
     * Obtiene el tamaño del símbolo basado en la etapa de crecimiento
     */
    getSymbolSize(creature) {
        if (!creature.growth) return 12;
        
        const stage = creature.growth.getCurrentStage();
        if (!stage) return 12;
        
        switch (stage.name) {
            case 'baby': return 8;
            case 'juvenile': return 10;
            case 'adult': return 12;
            default: return 12;
        }
    }

    /**
     * Limpia símbolos de familias extintas
     */
    cleanup(activeLineageIds) {
        const toDelete = [];
        
        for (const [lineageId, symbol] of this.familySymbols) {
            if (!activeLineageIds.includes(lineageId)) {
                toDelete.push(lineageId);
            }
        }
        
        for (const lineageId of toDelete) {
            this.familySymbols.delete(lineageId);
            console.log(`🏷️ VISUAL_ID: Símbolo de familia ${lineageId} eliminado (extinta)`);
        }
    }

    /**
     * Obtiene estadísticas del sistema
     */
    getStats() {
        return {
            activeFamilies: this.familySymbols.size,
            symbolsUsed: this.symbolIndex,
            availableSymbols: this.availableSymbols.length,
            symbolsRemaining: Math.max(0, this.availableSymbols.length - this.symbolIndex)
        };
    }

    /**
     * Destruye el sistema
     */
    destroy() {
        this.familySymbols.clear();
        console.log('CreatureVisualId: Sistema destruido');
    }
}

// Hacer disponible globalmente
window.CreatureVisualId = CreatureVisualId; 