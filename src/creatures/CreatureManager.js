/**
 * GenAI - Manager de Criaturas
 * CAJA 2 - Fase 2.0: Criatura Mínima
 * 
 * Gestión del pool de criaturas y sprites
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
        
        // Estado
        this.isInitialized = false;
        this.updateCounter = 0;
        
        console.log('CreatureManager: Manager inicializado');
    }

    /**
     * Inicializa el manager con stage y cámara
     */
    async init(stage, camera) {
        this.stage = stage;
        this.camera = camera;
        
        // Crear factory
        this.factory = new CreatureFactory();
        
        // Spawn inicial de criaturas
        await this.spawnInitialCreatures();
        
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
     * Spawn inicial de criaturas
     */
    async spawnInitialCreatures() {
        console.log(`CreatureManager: Spawning ${this.initialCount} criaturas iniciales...`);
        
        for (let i = 0; i < this.initialCount; i++) {
            const creature = this.factory.createCreature();
            this.addCreature(creature);
            
            // Pequeña pausa para evitar bloqueo
            if (i % 3 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        console.log(`CreatureManager: ${this.creatures.size} criaturas spawneadas`);
        
        if (window.eventBus) {
            eventBus.emit('creatures:spawned', {
                count: this.creatures.size,
                initial: true
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
        
        this.updateCounter++;
        
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
        
        // Emitir evento de actualización cada 60 frames
        if (this.updateCounter % 60 === 0 && window.eventBus) {
            eventBus.emit('creatures:updated', {
                count: this.creatures.size,
                deltaTime: deltaTime,
                frame: this.updateCounter
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
     * Obtiene estadísticas del manager
     */
    getStats() {
        const aliveCount = Array.from(this.creatures.values())
            .filter(c => c.isAlive).length;
        
        return {
            totalCreatures: this.creatures.size,
            aliveCreatures: aliveCount,
            sprites: this.sprites.size,
            maxCreatures: this.maxCreatures,
            updateCounter: this.updateCounter,
            factoryStats: this.factory ? this.factory.getStats() : null
        };
    }

    /**
     * Limpia criaturas muertas
     */
    cleanup() {
        const deadCreatures = [];
        
        for (const [id, creature] of this.creatures) {
            if (!creature.isAlive) {
                deadCreatures.push(id);
            }
        }
        
        for (const id of deadCreatures) {
            this.removeCreature(id);
        }
        
        if (deadCreatures.length > 0) {
            console.log(`CreatureManager: ${deadCreatures.length} criaturas muertas limpiadas`);
        }
        
        return deadCreatures.length;
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
        
        this.stage = null;
        this.camera = null;
        this.factory = null;
        this.isInitialized = false;
        
        console.log('CreatureManager: Manager destruido');
        
        if (window.eventBus) {
            eventBus.emit('creatures:destroyed');
        }
    }
}

// Hacer disponible globalmente
window.CreatureManager = CreatureManager; 