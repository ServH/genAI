/**
 * Efectos Visuales de Apareamiento - CAJA 3 Fase 3.1
 * Responsabilidad: Conexiones y pulsos de búsqueda de pareja
 */
class MatingEffects {
    constructor() {
        this.connections = new Map(); // connectionId -> {creature1, creature2, startTime}
        this.seekingPulses = new Map(); // creatureId -> {creature, pulseTime}
        
        console.log('MatingEffects: Sistema de efectos de apareamiento inicializado');
    }

    /**
     * Inicia pulso de búsqueda de pareja
     */
    startSeekingPulse(creature) {
        if (!creature || !creature.id) return;
        
        this.seekingPulses.set(creature.id, {
            creature: creature,
            pulseTime: 0
        });
    }

    /**
     * Inicia conexión visual entre parejas
     */
    startConnection(creature1, creature2) {
        if (!creature1 || !creature2) return;
        
        const connectionId = `${creature1.id}_${creature2.id}`;
        this.connections.set(connectionId, {
            creature1: creature1,
            creature2: creature2,
            startTime: Date.now()
        });
    }

    /**
     * Actualiza todos los efectos de apareamiento
     */
    update(deltaTime) {
        this.updateSeekingPulses(deltaTime);
        this.updateConnections();
    }

    /**
     * Actualiza pulsos de búsqueda
     */
    updateSeekingPulses(deltaTime) {
        const pulseDuration = CONSTANTS.EFFECTS.SEEKING_PULSE_DURATION;
        
        for (const [creatureId, pulse] of this.seekingPulses) {
            pulse.pulseTime += deltaTime * 1000;
            
            if (pulse.pulseTime >= pulseDuration) {
                this.seekingPulses.delete(creatureId);
            }
        }
    }

    /**
     * Actualiza conexiones de apareamiento
     */
    updateConnections() {
        const now = Date.now();
        const connectionDuration = CONSTANTS.STATES.MATING_DURATION;
        
        for (const [connectionId, connection] of this.connections) {
            const elapsed = now - connection.startTime;
            
            if (elapsed >= connectionDuration) {
                this.connections.delete(connectionId);
            }
        }
    }

    /**
     * Renderiza pulsos de búsqueda
     */
    renderSeekingPulses(renderer) {
        if (!renderer?.app) return;
        
        const config = CONSTANTS.EFFECTS.SEEKING_PULSE;
        
        for (const [creatureId, pulse] of this.seekingPulses) {
            const creature = pulse.creature;
            if (!creature?.isAlive) continue;
            
            const progress = pulse.pulseTime / CONSTANTS.EFFECTS.SEEKING_PULSE_DURATION;
            const radius = config.BASE_RADIUS + (progress * config.GROWTH);
            const alpha = config.ALPHA * (1 - progress);
            
            this.createPulseGraphic(renderer, creature.x, creature.y, radius, alpha);
        }
    }

    /**
     * Renderiza conexiones de apareamiento
     */
    renderConnections(renderer) {
        if (!renderer?.app) return;
        
        const config = CONSTANTS.EFFECTS.MATING_CONNECTION;
        
        for (const [connectionId, connection] of this.connections) {
            const { creature1, creature2 } = connection;
            if (!creature1?.isAlive || !creature2?.isAlive) continue;
            
            const elapsed = Date.now() - connection.startTime;
            const progress = elapsed / CONSTANTS.STATES.MATING_DURATION;
            const alpha = config.ALPHA * (1 - progress * 0.5);
            
            this.createConnectionGraphic(renderer, creature1, creature2, alpha, elapsed);
        }
    }

    /**
     * Crea gráfico de pulso temporal
     */
    createPulseGraphic(renderer, x, y, radius, alpha) {
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(2, CONSTANTS.EFFECTS.SEEKING_PULSE.COLOR, alpha);
        graphics.drawCircle(x, y, radius);
        
        // Usar worldContainer en lugar de stage para que se mueva con la cámara
        const worldContainer = this.getWorldContainer(renderer);
        if (worldContainer) {
            worldContainer.addChild(graphics);
        } else {
            renderer.app.stage.addChild(graphics); // Fallback
        }
        this.scheduleGraphicRemoval(graphics);
    }

    /**
     * Crea gráfico de conexión temporal
     */
    createConnectionGraphic(renderer, creature1, creature2, alpha, elapsed) {
        const graphics = new PIXI.Graphics();
        const config = CONSTANTS.EFFECTS.MATING_CONNECTION;
        
        // Línea de conexión
        graphics.lineStyle(3, config.COLOR, alpha);
        graphics.moveTo(creature1.x, creature1.y);
        graphics.lineTo(creature2.x, creature2.y);
        
        // Pulso central
        const centerX = (creature1.x + creature2.x) / 2;
        const centerY = (creature1.y + creature2.y) / 2;
        const pulseSize = config.PULSE_SIZE + Math.sin(elapsed * 0.01) * 3;
        
        graphics.beginFill(config.COLOR, alpha);
        graphics.drawCircle(centerX, centerY, pulseSize);
        graphics.endFill();
        
        // Usar worldContainer en lugar de stage para que se mueva con la cámara
        const worldContainer = this.getWorldContainer(renderer);
        if (worldContainer) {
            worldContainer.addChild(graphics);
        } else {
            renderer.app.stage.addChild(graphics); // Fallback
        }
        this.scheduleGraphicRemoval(graphics);
    }

    /**
     * Obtiene el worldContainer del engine
     */
    getWorldContainer(renderer) {
        if (window.gameEngine && window.gameEngine.worldContainer) {
            return window.gameEngine.worldContainer;
        }
        return null;
    }

    /**
     * Programa eliminación de gráfico en próximo frame
     */
    scheduleGraphicRemoval(graphics) {
        setTimeout(() => {
            if (graphics.parent) {
                graphics.parent.removeChild(graphics);
            }
        }, 16);
    }

    /**
     * Limpia todos los efectos
     */
    clear() {
        this.connections.clear();
        this.seekingPulses.clear();
    }

    /**
     * Destruye el sistema
     */
    destroy() {
        this.clear();
        console.log('MatingEffects: Sistema destruido');
    }
}

// Exportar globalmente
window.MatingEffects = MatingEffects; 