/**
 * GenAI - Manager de Criaturas
 * CAJA 2 - Fase 2.2: Comida Básica (Refactorizado)
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
        this.factory = null;
        
        // Sistemas modulares
        this.lifecycle = new CreatureLifecycle(this);
        this.stats = new CreatureStats(this);
        
        // 🔧 OPTIMIZACIÓN: SpatialGrid para culling lógico
        this.grid = new SpatialGrid(256);
        
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
        
        // Crear factory
        this.factory = new CreatureFactory();
        this.lifecycle.setFactory(this.factory);
        
        // Spawn inicial de criaturas
        await this.lifecycle.spawnInitialCreatures(this.initialCount);
        
        this.isInitialized = true;
        
        console.log(`CreatureManager: Inicializado con ${this.creatures.size} criaturas`);
        
        if (window.eventBus) {
            eventBus.emit('creatures:initialized', {
                count: this.creatures.size,
                maxCount: this.maxCreatures
            });
        }
    }

    /**
     * Agrega una criatura al manager
     */
    addCreature(creature) {
        if (this.creatures.size >= this.maxCreatures) {
            console.warn('CreatureManager: Máximo de criaturas alcanzado');
            return false;
        }
        
        // Agregar criatura al pool
        this.creatures.set(creature.id, creature);
        
        // Indexar en grid
        this.grid.insert(creature.id, creature.x, creature.y);
        
        // Crear sprite si tenemos stage
        if (this.stage) {
            const sprite = new CreatureSprite(creature);
            this.sprites.set(creature.id, sprite);
            this.stage.addChild(sprite.getContainer());
        }
        
        console.log(`CreatureManager: Criatura ${creature.id} agregada (${this.creatures.size}/${this.maxCreatures})`);
        
        if (window.eventBus) {
            eventBus.emit('creatures:added', {
                id: creature.id,
                count: this.creatures.size
            });
        }
        
        return true;
    }

    /**
     * Remueve una criatura del manager
     */
    removeCreature(creatureId) {
        const creature = this.creatures.get(creatureId);
        if (!creature) return false;
        
        // Remover sprite
        const sprite = this.sprites.get(creatureId);
        if (sprite) {
            this.stage.removeChild(sprite.getContainer());
            sprite.destroy();
            this.sprites.delete(creatureId);
        }
        
        // Quitar de grid
        this.grid.remove(creatureId, creature.x, creature.y);
        
        // Remover criatura
        creature.destroy();
        this.creatures.delete(creatureId);
        
        console.log(`CreatureManager: Criatura ${creatureId} removida (${this.creatures.size}/${this.maxCreatures})`);
        
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
        
        // Determinar zona lógica (viewport ±200)
        let logicIds = this.creatures.keys();
        if (this.camera && this.camera.getViewportRect) {
            const vp = this.camera.getViewportRect();
            const logicZone = { x: vp.x - 200, y: vp.y - 200, width: vp.width + 400, height: vp.height + 400 };
            logicIds = this.grid.queryRect(logicZone).values();
        }

        // Actualizar criaturas visibles en zona
        for (const id of logicIds) {
            const creature = this.creatures.get(id);
            if (creature && creature.isAlive) {
                const oldX = creature.x, oldY = creature.y;
                creature.update(deltaTime);
                // actualizar grid pos
                this.grid.update(id, oldX, oldY, creature.x, creature.y);
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

        // Métricas de culling
        if (window.performanceMonitor) {
            const updated = Array.isArray(logicIds) ? logicIds.length : this._countIterable(logicIds);
            const totalAlive = this.getAliveCount();
            window.performanceMonitor.setCustomStats({ logicUpdated: updated, logicSkipped: totalAlive - updated });
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
     * Crea una nueva criatura con DNA específico - Fase 3.1
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

        try {
            // Crear criatura con DNA específico
            const creature = this.factory.createCreatureWithDNA(x, y, dna);
            
            if (creature && this.addCreature(creature)) {
                console.log(`CreatureManager: Criatura ${creature.id} creada con DNA heredado en (${x}, ${y})`);
                
                if (window.eventBus) {
                    eventBus.emit('creature:spawned_with_dna', {
                        id: creature.id,
                        position: { x, y },
                        dna: dna,
                        parentCount: this.creatures.size
                    });
                }
                
                return creature;
            }
        } catch (error) {
            console.error('CreatureManager: Error creando criatura con DNA:', error);
        }
        
        return null;
    }

    /**
     * Destruye el manager y limpia recursos
     */
    destroy() {
        // Destruir todas las criaturas y sprites
        for (const sprite of this.sprites.values()) {
            sprite.destroy();
        }
        
        for (const creature of this.creatures.values()) {
            creature.destroy();
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
        this.factory = null;
        this.isInitialized = false;
        
        console.log('CreatureManager: Manager destruido');
        
        if (window.eventBus) {
            eventBus.emit('creatures:destroyed');
        }
    }

    _countIterable(it) { let c=0; for (/* eslint-disable-line */ const _ of it) c++; return c; }
}

// Hacer disponible globalmente
window.CreatureManager = CreatureManager; 