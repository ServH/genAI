/**
 * Efectos Visuales de Nacimiento - CAJA 3 Fase 3.1
 * Responsabilidad: Partículas y efectos de crías recién nacidas
 */
class BirthEffects {
    constructor() {
        this.effects = []; // Array de efectos activos
        
        console.log('BirthEffects: Sistema de efectos de nacimiento inicializado');
    }

    /**
     * Crea efecto de nacimiento simple en posición específica
     */
    createBirthEffect(x, y) {
        const config = CONSTANTS.EFFECTS.BIRTH;
        
        this.effects.push({
            x: x,
            y: y,
            startTime: Date.now(),
            duration: config.DURATION,
            scale: 0,
            alpha: 1
        });

        // Emitir evento de nacimiento
        if (window.eventBus) {
            window.eventBus.emit('effects:birth_created', { x, y });
        }
    }



    /**
     * Actualiza todos los efectos de nacimiento
     */
    update(deltaTime) {
        const now = Date.now();
        
        this.effects = this.effects.filter(effect => {
            const elapsed = now - effect.startTime;
            const progress = elapsed / effect.duration;
            
            // Animación simple: scale 0→1.5→1 y alpha 1→0.5
            if (progress < 0.5) {
                effect.scale = progress * 3; // 0 a 1.5
                effect.alpha = 1;
            } else {
                effect.scale = 1.5 - (progress - 0.5) * 1; // 1.5 a 1
                effect.alpha = 1 - (progress - 0.5) * 1; // 1 a 0.5
            }
            
            // Mantener efecto si no ha expirado
            return elapsed < effect.duration;
        });
    }



    /**
     * Renderiza todos los efectos de nacimiento
     */
    render(renderer) {
        if (!renderer?.app) return;
        
        for (const effect of this.effects) {
            this.renderSimpleEffect(renderer, effect);
        }
    }

    /**
     * Renderiza un efecto simple de nacimiento
     */
    renderSimpleEffect(renderer, effect) {
        const graphics = GraphicsPool.acquire();
        const config = CONSTANTS.EFFECTS.BIRTH;
        
        // Círculo simple con fade y scale
        graphics.beginFill(config.COLOR, effect.alpha * 0.8);
        graphics.drawCircle(effect.x, effect.y, 5 * effect.scale);
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
            graphics.clear();
            GraphicsPool.release(graphics);
        }, 16);
    }

    /**
     * Obtiene estadísticas de efectos activos
     */
    getStats() {
        return {
            activeEffects: this.effects.length,
            totalParticles: this.effects.length, // Ahora cada efecto es un círculo simple
            averageParticlesPerEffect: 1 // Siempre 1 por efecto
        };
    }

    /**
     * Limpia todos los efectos
     */
    clear() {
        this.effects = [];
    }

    /**
     * Destruye el sistema
     */
    destroy() {
        this.clear();
        console.log('BirthEffects: Sistema destruido');
    }
}

// Exportar globalmente
window.BirthEffects = BirthEffects; 