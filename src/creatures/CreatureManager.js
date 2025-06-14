/**
 * GenAI - Manager de Criaturas
 * CAJA 2 - Fase 2.2: Comida Básica (Refactorizado con Pooling)
 * 
 * Gestión del pool de criaturas y sprites con sistemas modulares
 */

class CreatureManager {
    constructor() {
        // Pool de criaturas y sprites
        this.creatures = new Map(); // ID -> Creature
        this.sprites = new Map();   // ID -> CreatureSprite
        
        // Configuración
        this.maxCreatures = CONSTANTS.CREATURES.MAX_COUNT || 50;
        this.initialCount = CONSTANTS.CREATURES.INITIAL_COUNT || 10;
        
        // Referencias del sistema
        this.stage = null;
        this.camera = null;
        
        // Sistemas modulares
        this.pool = null; // OPTIMIZATION: El pool gestionará los objetos
        this.lifecycle = new CreatureLifecycle(this);
        this.stats = new CreatureStats(this);
        
        // Estado
        this.isInitialized = false;
        
        console.log('CreatureManager: Manager inicializado con sistemas modulares');
    }

    /**
     * Inicializa el manager con stage y cámara
     */
    async init(stage, camera) {
        this.stage = stage;
        this.camera = camera;
        
        // Crear factory y pool
        const factory = new CreatureFactory();
        this.pool = new CreaturePool(factory, this.stage);
        
        // Pre-calentar el pool con el número máximo de criaturas
        this.pool.prewarm(this.maxCreatures);
        
        this.lifecycle.setFactory(factory);
        
        // Spawn inicial de criaturas usando el pool
        await this.lifecycle.spawnInitialCreatures(this.initialCount);
        
        this.isInitialized = true;
        
        console.log(`CreatureManager: Inicializado con ${this.creatures.size} criaturas activas. Pool listo.`);
        
        if (window.eventBus) {
            eventBus.emit('creatures:initialized', {
                count: this.creatures.size,
                maxCount: this.maxCreatures
            });
        }
    }

    /**
     * Activa una criatura del pool. No crea nuevos objetos.
     * @param {Creature} creature - La criatura a activar.
     */
    activateCreature(creature, sprite) {
        if (this.creatures.size >= this.maxCreatures) {
            console.warn('CreatureManager: Máximo de criaturas alcanzado');
            return false;
        }
        
        // Agregar al mapa de activos
        this.creatures.set(creature.id, creature);
        this.sprites.set(creature.id, sprite);

        // El sprite ya está en el stage, solo se hace visible por el pool
        
        if (window.eventBus) {
            eventBus.emit('creatures:added', {
                id: creature.id,
                count: this.creatures.size
            });
        }
        
        return true;
    }

    /**
     * Libera una criatura de vuelta al pool. No la destruye.
     * @param {string} creatureId - El ID de la criatura a liberar.
     */
    releaseCreature(creatureId) {
        const creature = this.creatures.get(creatureId);
        if (!creature) return false;
        
        // Devolver al pool
        this.pool.release(creature);
        
        // Remover de los mapas activos
        this.creatures.delete(creatureId);
        this.sprites.delete(creatureId);
        
        if (window.eventBus) {
            eventBus.emit('creatures:removed', {
                id: creatureId,
                count: this.creatures.size
            });
        }
        
        return true;
    }

    /**
     * Actualiza todas las criaturas
     */
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        const startTime = performance.now();
        
        this.stats.incrementUpdateCounter();
        
        // Actualizar sistema de energía
        if (window.gameEnergy) {
            gameEnergy.update(deltaTime);
        }
        
        // Actualizar criaturas
        for (const creature of this.creatures.values()) {
            if (creature.isAlive) {
                creature.update(deltaTime);
            }
        }
        
        // Actualizar sprites
        for (const sprite of this.sprites.values()) {
            sprite.update(deltaTime);
        }
        
        // Limpiar criaturas muertas cada 2 segundos
        if (this.stats.updateCounter % 120 === 0) {
            this.lifecycle.cleanup();
            this.lifecycle.checkRespawn();
        }
        
        // Actualizar métricas de performance
        const updateTime = performance.now() - startTime;
        this.stats.updatePerformanceMetrics(updateTime);
        
        // Emitir evento de actualización cada 60 frames
        if (this.stats.updateCounter % 60 === 0 && window.eventBus) {
            eventBus.emit('creatures:updated', {
                count: this.creatures.size,
                aliveCount: this.stats.getAliveCount(),
                deltaTime: deltaTime,
                frame: this.stats.updateCounter
            });
        }
    }

    /**
     * Obtiene el número de criaturas activas
     */
    getCreatureCount() {
        return this.creatures.size;
    }

    /**
     * Obtiene una criatura por ID
     */
    getCreature(id) {
        return this.creatures.get(id);
    }

    /**
     * Obtiene todas las criaturas
     */
    getAllCreatures() {
        return Array.from(this.creatures.values());
    }

    /**
     * Obtiene el número de criaturas vivas
     */
    getAliveCount() {
        return this.stats.getAliveCount();
    }

    /**
     * Obtiene estadísticas del manager
     */
    getStats() {
        return this.stats.getCompleteStats();
    }

    /**
     * Crea una nueva criatura con DNA específico usando el pool.
     * @param {number} x - Posición X
     * @param {number} y - Posición Y  
     * @param {DNA} dna - DNA para la nueva criatura
     * @returns {Creature|null} - Nueva criatura o null si falla
     */
    spawnCreatureWithDNA(x, y, dna) {
        if (this.creatures.size >= this.maxCreatures) {
            console.warn('CreatureManager: No se puede crear criatura, máximo alcanzado');
            return null;
        }

        const pooledObjects = this.pool.acquire();
        if (!pooledObjects) {
            return null; // El pool está vacío
        }

        const { creature, sprite } = pooledObjects;

        try {
            // Resetear y activar la criatura del pool
            creature.reset(x, y, dna);
            sprite.reset(creature);
            
            // Activarla directamente en los mapas
            this.creatures.set(creature.id, creature);
            this.sprites.set(creature.id, sprite);

            console.log(`CreatureManager: Criatura ${creature.id} reutilizada con DNA heredado en (${x}, ${y})`);
            
            if (window.eventBus) {
                eventBus.emit('creature:spawned_with_dna', {
                    id: creature.id,
                    position: { x, y },
                    dna: dna,
                    parentCount: this.creatures.size
                });
            }
            
            return creature;
        } catch (error) {
            console.error('CreatureManager: Error reutilizando criatura con DNA:', error);
            // Si algo falla, devolver los objetos al pool
            this.pool.release(creature);
        }
        
        return null;
    }

    /**
     * Destruye el manager y limpia recursos
     */
    destroy() {
        // Destruir el pool se encarga de todos los objetos (activos e inactivos)
        if (this.pool) {
            this.pool.destroy();
        }
        
        this.creatures.clear();
        this.sprites.clear();
        
        // Limpiar sistemas modulares
        if (this.lifecycle) {
            this.lifecycle.destroy();
        }
        if (this.stats) {
            this.stats.destroy();
        }
        
        this.stage = null;
        this.camera = null;
        
        this.isInitialized = false;
        
        console.log('CreatureManager: Manager destruido');
        
        if (window.eventBus) {
            eventBus.emit('creatures:destroyed');
        }
    }
}

// Hacer disponible globalmente
window.CreatureManager = CreatureManager; 