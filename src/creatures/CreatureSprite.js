/**
 * GenAI - Sprite de Criatura (Optimizado con Sprites/Texturas)
 * FASE DE OPTIMIZACIÓN 2
 * 
 * Renderizado eficiente usando PIXI.Sprite con texturas pre-cacheadas.
 */

class CreatureSprite {
    constructor(creature, initialTexture) {
        this.creature = creature;
        this.container = new PIXI.Container();
        
        // OPTIMIZATION: Usar un PIXI.Sprite en lugar de PIXI.Graphics
        this.sprite = new PIXI.Sprite(initialTexture);
        this.sprite.anchor.set(0.5); // Anclar al centro

        // Animación
        this.animationTime = Math.random() * Math.PI * 2;
        this.animationSpeed = 1.5 + Math.random() * 1.0; // Velocidad de ondulación y rotación

        // Sistema de identificación visual
        this.symbolText = null;
        this.lastLineageId = null;
        
        this.setupSprite();
        this.update(0); // Forzar una actualización inicial
        
        // console.log(`CreatureSprite: Sprite optimizado creado para criatura ${creature.id}`);
    }

    /**
     * Resetea un sprite para ser reutilizado con una nueva criatura y textura.
     * @param {Creature} newCreature - La nueva criatura a la que este sprite representará.
     * @param {PIXI.Texture} newTexture - La nueva textura base.
     */
    reset(newCreature, newTexture) {
        this.creature = newCreature;
        this.sprite.texture = newTexture;
        
        this.animationTime = Math.random() * Math.PI * 2;
        this.lastLineageId = null;
        
        this.update(0);
    }

    /**
     * Configura la estructura del sprite
     */
    setupSprite() {
        this.container.addChild(this.sprite);
        this.container.x = this.creature.x;
        this.container.y = this.creature.y;
    }

    /**
     * Actualiza los visuales del sprite (ahora mucho más ligero)
     */
    update(deltaTime) {
        if (!this.creature || !this.creature.isAlive) {
            this.container.visible = false;
            return;
        }
        
        this.container.visible = true;

        this.animationTime += this.animationSpeed * deltaTime;
        
        this.container.x = this.creature.x;
        this.container.y = this.creature.y;
        
        // Aplicar efectos visuales optimizados
        this.updateOptimizedVisuals();
        
        this.updateFamilySymbol();
    }

    /**
     * Actualiza los efectos visuales de forma performante.
     */
    updateOptimizedVisuals() {
        // 1. Color genético (usando tint, operación de GPU)
        this.sprite.tint = this.creature.geneticColor || 0xFFFFFF;

        // 2. Opacidad por energía
        const energyPercentage = this.creature.getEnergyPercentage();
        let alpha = 0.1 + (energyPercentage * 0.9);
        if (this.creature.isDying()) {
            alpha = Math.max(0.1, alpha + Math.sin(this.animationTime * 8) * 0.5);
        }
        this.sprite.alpha = alpha;

        // 3. Escala por crecimiento
        const growthScale = this.creature.growth ? this.creature.growth.getScale() : 1.0;
        
        // 4. Animación de "ondulación" (usando escala, muy barato)
        const pulse = Math.sin(this.animationTime) * 0.05;
        this.sprite.scale.set(growthScale * (1 + pulse), growthScale * (1 - pulse));
        
        // 5. Rotación sutil
        this.sprite.rotation += Math.cos(this.animationTime * 0.5) * 0.001;
    }

    /**
     * Actualiza el símbolo familiar - se mantiene igual pero se posiciona sobre el nuevo sprite
     */
    updateFamilySymbol() {
        if (!window.gameVisualId || !this.creature.lineageId) {
            if (this.symbolText) {
                this.symbolText.visible = false;
            }
            return;
        }
        
        if (!this.symbolText) {
            this.createFamilySymbol();
        }
        this.symbolText.visible = true;
        
        this.updateSymbolAppearance();
    }

    /**
     * Crea el símbolo familiar
     */
    createFamilySymbol() {
        if (this.symbolText) return;

        const visualInfo = window.gameVisualId.getVisualInfo(this.creature);
        if (!visualInfo.symbol) return;
        
        this.symbolText = new PIXI.Text(visualInfo.symbol, {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: visualInfo.symbolColor,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        this.symbolText.anchor.set(0.5, 0.5);
        this.container.addChild(this.symbolText);
    }

    /**
     * Actualiza la apariencia del símbolo
     */
    updateSymbolAppearance() {
        if (!this.symbolText || !window.gameVisualId) return;
        
        const visualInfo = window.gameVisualId.getVisualInfo(this.creature);
        this.symbolText.style.fill = visualInfo.symbolColor;
        
        const scale = this.creature.growth ? this.creature.growth.getScale() : 1.0;
        this.symbolText.scale.set(scale * 0.8);
        
        const offsetY = -(this.sprite.height / 2 + 5);
        this.symbolText.position.set(0, offsetY);
    }

    getContainer() {
        return this.container;
    }

    destroy() {
        if (this.symbolText) {
            this.symbolText.destroy();
            this.symbolText = null;
        }
        
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
        
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        
        this.creature = null;
    }
}

window.CreatureSprite = CreatureSprite; 