/**
 * Coordinador de Efectos Visuales - CAJA 3 Fase 3.1
 * Responsabilidad: Coordinar sistemas de efectos especializados
 */
class Effects {
    constructor() {
        this.matingEffects = new MatingEffects();
        this.birthEffects = new BirthEffects();
        
        console.log('Effects: Coordinador de efectos inicializado');
    }

    /**
     * Actualiza todos los sistemas de efectos
     */
    update(deltaTime) {
        this.matingEffects.update(deltaTime);
        this.birthEffects.update(deltaTime);
    }

    /**
     * Renderiza todos los efectos
     */
    render(renderer) {
        this.matingEffects.renderSeekingPulses(renderer);
        this.matingEffects.renderConnections(renderer);
        this.birthEffects.render(renderer);
    }

    /**
     * Inicia pulso de búsqueda de pareja
     */
    startSeekingPulse(creature) {
        this.matingEffects.startSeekingPulse(creature);
    }

    /**
     * Inicia conexión de apareamiento
     */
    startMatingConnection(creature1, creature2) {
        this.matingEffects.startConnection(creature1, creature2);
    }

    /**
     * Crea efecto de nacimiento
     */
    createBirthEffect(x, y) {
        this.birthEffects.createBirthEffect(x, y);
    }

    /**
     * Obtiene estadísticas de todos los efectos
     */
    getStats() {
        const birthStats = this.birthEffects.getStats();
        
        return {
            mating: {
                connections: this.matingEffects.connections.size,
                seekingPulses: this.matingEffects.seekingPulses.size
            },
            birth: birthStats
        };
    }

    /**
     * Limpia todos los efectos
     */
    clear() {
        this.matingEffects.clear();
        this.birthEffects.clear();
    }

    /**
     * Destruye todos los sistemas
     */
    destroy() {
        this.matingEffects.destroy();
        this.birthEffects.destroy();
        console.log('Effects: Coordinador destruido');
    }
}

// Exportar globalmente
window.Effects = Effects; 