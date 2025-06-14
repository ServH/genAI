// CreatureSprite (CAJA 2) - render orgánico deformado

class CreatureSprite {
    constructor(creature) {
        this.creature = creature;
        this.graphics = GraphicsPool.acquire();
        this.container = ContainerPool.acquire();
        
        // 🔧 OPTIMIZACIÓN: delegar forma orgánica a OrganicShapeRenderer
        this.shapeRenderer = null; // se instanciará en setup
        
        // Sistema de identificación visual - fixfeatures
        this.familySymbol = new FamilySymbol(this);
        
        this.setupSprite();
        // Renderizador de forma orgánica
        this.shapeRenderer = new OrganicShapeRenderer(this);
        this.shapeRenderer.update(0);
        this.energyOverlay = new EnergyOverlay(this);
        
        // Intentar usar textura si es adulto
        this.tryConvertToTexture();
        
        console.log(`CreatureSprite: Sprite creado para criatura ${creature.id}`);
    }

    /**
     * Configura la estructura del sprite
     */
    setupSprite() {
        // Agregar graphics al container
        this.container.addChild(this.graphics);
        
        // Configurar posición inicial
        this.container.x = this.creature.x;
        this.container.y = this.creature.y;
        
        // Configurar punto de anclaje al centro
        this.graphics.pivot.set(0, 0);
    }

    /**
     * Actualiza los visuales del sprite
     */
    update(deltaTime) {
        // Actualizar forma orgánica (solo si no hay textura)
        if (this.shapeRenderer) this.shapeRenderer.update(deltaTime);
        else if (!this.spriteTextureApplied) this.tryConvertToTexture();
        
        // Sincronizar posición con criatura
        this.container.x = this.creature.x;
        this.container.y = this.creature.y;
        
        // Culling de visibilidad
        if (window.spriteCuller) spriteCuller.check(this);
        
        // Delegar a módulos
        this.energyOverlay.update(deltaTime);
        this.familySymbol.update();
        
        if (window.eventBus) {
            eventBus.emit('creature:rendered', { 
                id: this.creature.id,
                frame: Math.floor((this.shapeRenderer?.animationTime || 0) * 10) % 60,
                energy: this.creature.energy
            });
        }
    }

    /**
     * Establece un nuevo color
     */
    setColor(colorHex) {
        if (this.shapeRenderer) {
            this.shapeRenderer.color = parseInt(colorHex.replace('#', ''), 16);
        }
    }

    /**
     * Obtiene el container para agregar al stage
     */
    getContainer() {
        return this.container;
    }

    /**
     * Destruye el sprite y limpia recursos
     */
    destroy() {
        // Delegar destrucción a módulos
        if (this.familySymbol) this.familySymbol.destroy();
        if (this.energyOverlay) this.energyOverlay.destroy();
        
        if (this.shapeRenderer) this.shapeRenderer.destroy();
        if (this.graphics) { this.graphics.clear(); GraphicsPool.release(this.graphics); this.graphics = null; }
        
        if (this.container) {
            this.container.removeChildren();
            ContainerPool.release(this.container);
            this.container = null;
        }
        
        this.creature = null;
    }

    tryConvertToTexture() {
        const scale = this.creature.growth ? this.creature.growth.getScale() : 1.0;
        if (this.spriteTextureApplied) return;

        const tex = window.textureFactory?.getTexture(this.creature);
        if (!tex) return;

        const sprite = new PIXI.Sprite(tex);
        sprite.anchor.set(0.5);
        sprite.scale.set(scale);
        // Reemplazar graphics
        this.container.removeChild(this.graphics);
        GraphicsPool.release(this.graphics);
        this.graphics = null;
        this.container.addChildAt(sprite, 0);
        this.spriteTextureApplied = true;
        this.shapeRenderer.destroy();
        this.shapeRenderer = null;
    }
}

// Hacer disponible globalmente
window.CreatureSprite = CreatureSprite; 