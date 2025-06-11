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
     * Crea efecto de nacimiento en posición específica
     */
    createBirthEffect(x, y) {
        const config = CONSTANTS.EFFECTS.BIRTH;
        
        this.effects.push({
            x: x,
            y: y,
            particles: this.createParticles(x, y, config.PARTICLE_COUNT),
            startTime: Date.now(),
            duration: config.DURATION
        });

        // Emitir evento de nacimiento
        if (window.eventBus) {
            window.eventBus.emit('effects:birth_created', { x, y });
        }
    }

    /**
     * Crea partículas para el efecto
     */
    createParticles(x, y, count) {
        const particles = [];
        const config = CONSTANTS.EFFECTS.BIRTH;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = config.PARTICLE_SPEED;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: config.PARTICLE_DECAY,
                size: config.PARTICLE_SIZE
            });
        }
        
        return particles;
    }

    /**
     * Actualiza todos los efectos de nacimiento
     */
    update(deltaTime) {
        const now = Date.now();
        
        this.effects = this.effects.filter(effect => {
            const elapsed = now - effect.startTime;
            
            // Actualizar partículas del efecto
            this.updateParticles(effect.particles, deltaTime);
            
            // Mantener efecto si no ha expirado
            return elapsed < effect.duration;
        });
    }

    /**
     * Actualiza partículas individuales
     */
    updateParticles(particles, deltaTime) {
        const friction = CONSTANTS.EFFECTS.BIRTH.FRICTION;
        
        particles.forEach(particle => {
            // Actualizar posición
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Reducir vida
            particle.life -= particle.decay;
            
            // Aplicar fricción
            particle.vx *= friction;
            particle.vy *= friction;
            
            // Reducir tamaño gradualmente
            particle.size *= 0.99;
        });
    }

    /**
     * Renderiza todos los efectos de nacimiento
     */
    render(renderer) {
        if (!renderer?.app) return;
        
        for (const effect of this.effects) {
            this.renderEffect(renderer, effect);
        }
    }

    /**
     * Renderiza un efecto específico
     */
    renderEffect(renderer, effect) {
        const config = CONSTANTS.EFFECTS.BIRTH;
        
        for (const particle of effect.particles) {
            if (particle.life <= 0) continue;
            
            const alpha = particle.life * config.ALPHA;
            const size = particle.size * particle.life;
            
            this.createParticleGraphic(renderer, particle, alpha, size);
        }
    }

    /**
     * Crea gráfico de partícula temporal
     */
    createParticleGraphic(renderer, particle, alpha, size) {
        const graphics = new PIXI.Graphics();
        const config = CONSTANTS.EFFECTS.BIRTH;
        
        // Partícula brillante
        graphics.beginFill(config.COLOR, alpha);
        graphics.drawCircle(particle.x, particle.y, size);
        graphics.endFill();
        
        // Glow exterior
        graphics.lineStyle(1, config.GLOW_COLOR, alpha * 0.5);
        graphics.drawCircle(particle.x, particle.y, size * 1.5);
        
        renderer.app.stage.addChild(graphics);
        this.scheduleGraphicRemoval(graphics);
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
     * Obtiene estadísticas de efectos activos
     */
    getStats() {
        const totalParticles = this.effects.reduce((sum, effect) => 
            sum + effect.particles.length, 0);
        
        return {
            activeEffects: this.effects.length,
            totalParticles: totalParticles,
            averageParticlesPerEffect: this.effects.length > 0 ? 
                Math.round(totalParticles / this.effects.length) : 0
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