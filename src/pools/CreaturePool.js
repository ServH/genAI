/**
 * GenAI - Pool de Objetos de Criaturas
 * FASE DE OPTIMIZACIÓN 1
 * 
 * Gestiona la reutilización de objetos Creature y CreatureSprite para evitar
 * la creación/destrucción constante y reducir la carga del Garbage Collector.
 */
class CreaturePool {
    constructor(factory, stage) {
        this.factory = factory;
        this.stage = stage;

        this.creaturePool = [];
        this.spritePool = [];

        this.activeCreatures = new Map();
        this.activeSprites = new Map();
    }

    /**
     * Pre-calienta el pool con un número inicial de objetos.
     * @param {number} size - El número de criaturas a pre-crear.
     */
    prewarm(size) {
        for (let i = 0; i < size; i++) {
            // Se crea una criatura temporal solo para instanciar el sprite
            const tempCreature = this.factory.createCreature();
            const sprite = new CreatureSprite(tempCreature);
            
            // El sprite se añade al stage pero se mantiene invisible
            sprite.getContainer().visible = false;
            this.stage.addChild(sprite.getContainer());
            
            // Guardamos el sprite y una criatura 'en blanco' en el pool
            this.spritePool.push(sprite);
            this.creaturePool.push(tempCreature);
        }
        console.log(`CreaturePool: Pre-calentado con ${size} criaturas y sprites.`);
    }

    /**
     * Adquiere una criatura y un sprite del pool.
     * @returns {{creature: Creature, sprite: CreatureSprite}|null} - El par de objetos o null si el pool está vacío.
     */
    acquire() {
        if (this.creaturePool.length === 0 || this.spritePool.length === 0) {
            // Opcional: expandir el pool si se necesita. Por ahora, seremos estrictos.
            console.warn("CreaturePool: ¡El pool está vacío! No se pudo adquirir una nueva criatura.");
            return null;
        }

        const creature = this.creaturePool.pop();
        const sprite = this.spritePool.pop();

        this.activeCreatures.set(creature.id, creature);
        this.activeSprites.set(creature.id, sprite);

        // Reactivar el sprite
        sprite.getContainer().visible = true;

        console.log(`CreaturePool: Objeto ${creature.id} adquirido. Pool: ${this.creaturePool.length}`);
        return { creature, sprite };
    }

    /**
     * Devuelve una criatura y su sprite al pool para ser reutilizados.
     * @param {Creature} creature - La criatura a liberar.
     */
    release(creature) {
        if (!creature || !this.activeCreatures.has(creature.id)) {
            return;
        }

        const sprite = this.activeSprites.get(creature.id);

        // Desactivar y ocultar el sprite
        if (sprite) {
            sprite.getContainer().visible = false;
            this.spritePool.push(sprite);
            this.activeSprites.delete(creature.id);
        }

        // Devolver la criatura al pool
        // La criatura no necesita ser modificada, solo se vuelve a meter al pool
        this.creaturePool.push(creature);
        this.activeCreatures.delete(creature.id);

        console.log(`CreaturePool: Objeto ${creature.id} liberado. Pool: ${this.creaturePool.length}`);
    }
    
    /**
     * Obtiene el número de objetos activos.
     */
    getActiveCount() {
        return this.activeCreatures.size;
    }

    /**
     * Limpia todos los pools y objetos activos.
     */
    destroy() {
        // Destruir sprites activos que no fueron liberados
        for (const sprite of this.activeSprites.values()) {
            this.stage.removeChild(sprite.getContainer());
            sprite.destroy();
        }
        this.activeSprites.clear();
        this.activeCreatures.clear();

        // Destruir objetos en el pool
        for (const sprite of this.spritePool) {
            this.stage.removeChild(sprite.getContainer());
            sprite.destroy();
        }
        this.spritePool = [];
        this.creaturePool = [];

        console.log("CreaturePool: Pool destruido.");
    }
}

window.CreaturePool = CreaturePool; 