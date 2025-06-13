/**
 * GenAI - Sistema de Sprite Optimizado para Criaturas
 * RAMA PERFORMANCE - Optimización de Renderizado
 * 
 * Versión optimizada que usa RenderTexture para mejor performance
 */

class CreatureSpriteOptimized {
    constructor(creature) {
        this.creature = creature;
        this.container = new PIXI.Container();
        this.sprite = null;
        this.currentTexture = null;
        this.lastTextureKey = null;
        this.familySymbolSprite = null;
        
        // Referencias a sistemas globales
        this.textureCache = window.gameTextureCache;
        
        // Estado de animación
        this.animationTime = Math.random() * Math.PI * 2;
        this.rotationSpeed = 0.01 + Math.random() * 0.02;
        
        // Configurar sprite inicial
        this.setupOptimizedSprite();
        
        if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            console.log(`CreatureSpriteOptimized: Inicializado para ${creature.id}`);
        }
    }

    /**
     * Configura el sprite optimizado inicial
     */
    setupOptimizedSprite() {
        // Obtener textura del cache
        this.updateTexture();
        
        // Configurar posición inicial
        this.container.x = this.creature.x;
        this.container.y = this.creature.y;
        
        // Configurar símbolo familiar si existe
        this.updateFamilySymbol();
    }

    /**
     * Actualiza la textura del sprite si es necesario
     */
    updateTexture() {
        if (!this.textureCache) return;
        
        const newTextureKey = this.textureCache.generateKey(this.creature);
        
        // Solo actualizar si la clave cambió
        if (newTextureKey !== this.lastTextureKey) {
            const newTexture = this.textureCache.getTexture(this.creature);
            
            if (this.sprite) {
                this.sprite.destroy();
            }
            
            this.sprite = new PIXI.Sprite(newTexture);
            this.sprite.anchor.set(0.5);
            this.container.addChild(this.sprite);
            
            this.currentTexture = newTexture;
            this.lastTextureKey = newTextureKey;
            
            if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
                console.log(`CreatureSpriteOptimized: Textura actualizada para ${this.creature.id}`);
            }
        }
    }

    /**
     * Actualización principal (muy optimizada)
     */
    update(deltaTime) {
        if (!this.creature.isAlive || !this.sprite) return;
        
        // Actualizar posición (operación muy barata)
        this.container.x = this.creature.x;
        this.container.y = this.creature.y;
        
        // Actualizar efectos visuales de energía
        this.updateEnergyVisuals();
        
        // Animación sutil de rotación (opcional)
        this.updateSubtleAnimation(deltaTime);
        
        // Verificar si necesita nueva textura (solo en cambios importantes)
        if (CONSTANTS.PERFORMANCE.REDRAW_ON_STAGE_CHANGE) {
            this.checkForTextureUpdate();
        }
        
        // Actualizar símbolo familiar
        this.updateFamilySymbolPosition();
    }

    /**
     * Actualiza los efectos visuales basados en energía
     */
    updateEnergyVisuals() {
        const energyPercentage = this.creature.getEnergyPercentage();
        
        // Opacidad basada en energía (operación muy barata)
        const minAlpha = 0.1;
        const maxAlpha = 0.8;
        let alpha = minAlpha + (energyPercentage * (maxAlpha - minAlpha));
        
        // Pulso cuando energía crítica
        if (this.creature.energy <= CONSTANTS.ENERGY.PULSE_THRESHOLD) {
            this.animationTime += 0.1;
            const pulseIntensity = Math.sin(this.animationTime * 8) * 0.2;
            alpha = Math.max(0.1, alpha + pulseIntensity);
        }
        
        this.container.alpha = alpha;
    }

    /**
     * Animación sutil para mantener sensación de vida
     */
    updateSubtleAnimation(deltaTime) {
        // Rotación muy sutil
        this.sprite.rotation += this.rotationSpeed * deltaTime;
        
        // Pequeña variación de escala (respiración)
        this.animationTime += deltaTime * 2;
        const breathScale = 1 + Math.sin(this.animationTime) * 0.02;
        this.sprite.scale.set(breathScale);
    }

    /**
     * Verifica si necesita actualizar la textura
     */
    checkForTextureUpdate() {
        // Solo verificar cada cierto tiempo para no sobrecargar
        if (Math.random() < 0.1) { // 10% de probabilidad por frame
            this.updateTexture();
        }
    }

    /**
     * Actualiza el símbolo familiar
     */
    updateFamilySymbol() {
        if (!this.creature.lineageId) return;
        
        const visualId = window.gameVisualId;
        if (!visualId) return;
        
        const symbolInfo = visualId.getVisualInfo(this.creature);
        if (!symbolInfo) return;
        
        // Crear o actualizar símbolo
        if (!this.familySymbolSprite) {
            this.createFamilySymbolSprite(symbolInfo);
        } else {
            this.updateFamilySymbolAppearance(symbolInfo);
        }
    }

    /**
     * Crea el sprite del símbolo familiar
     */
    createFamilySymbolSprite(symbolInfo) {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(symbolInfo.color);
        
        // Dibujar símbolo simple (más eficiente que texto)
        const size = symbolInfo.size;
        graphics.drawCircle(0, 0, size / 2);
        graphics.endFill();
        
        // Convertir a textura para mejor performance
        const texture = PIXI.RenderTexture.create({
            width: size,
            height: size
        });
        
        if (this.textureCache?.renderer) {
            this.textureCache.renderer.render(graphics, { renderTexture: texture });
        }
        
        this.familySymbolSprite = new PIXI.Sprite(texture);
        this.familySymbolSprite.anchor.set(0.5);
        this.container.addChild(this.familySymbolSprite);
        
        graphics.destroy();
    }

    /**
     * Actualiza la apariencia del símbolo familiar
     */
    updateFamilySymbolAppearance(symbolInfo) {
        if (!this.familySymbolSprite) return;
        
        // Solo actualizar propiedades baratas
        this.familySymbolSprite.tint = symbolInfo.color;
        this.familySymbolSprite.scale.set(symbolInfo.size / 20);
    }

    /**
     * Actualiza la posición del símbolo familiar
     */
    updateFamilySymbolPosition() {
        if (!this.familySymbolSprite) return;
        
        const radius = CONSTANTS.CREATURES.BASE_RADIUS;
        const stageScale = this.creature.growthSystem?.getScale() || 1.0;
        const offset = radius * stageScale + 15;
        
        this.familySymbolSprite.x = 0;
        this.familySymbolSprite.y = -offset;
    }

    /**
     * Fuerza la actualización de la textura
     */
    forceTextureUpdate() {
        this.lastTextureKey = null;
        this.updateTexture();
        
        if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            console.log(`CreatureSpriteOptimized: Textura forzada para ${this.creature.id}`);
        }
    }

    /**
     * Maneja cambios de etapa de crecimiento
     */
    onStageChanged() {
        // Forzar actualización de textura en cambios importantes
        this.forceTextureUpdate();
        this.updateFamilySymbol();
        
        if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            console.log(`CreatureSpriteOptimized: Etapa cambiada para ${this.creature.id}`);
        }
    }

    /**
     * Obtiene el contenedor principal
     */
    getContainer() {
        return this.container;
    }

    /**
     * Obtiene estadísticas del sprite
     */
    getStats() {
        return {
            textureKey: this.lastTextureKey,
            hasTexture: !!this.currentTexture,
            hasSymbol: !!this.familySymbolSprite,
            alpha: this.container.alpha,
            rotation: this.sprite?.rotation || 0
        };
    }

    /**
     * Destruye el sprite y libera recursos
     */
    destroy() {
        if (this.familySymbolSprite) {
            this.familySymbolSprite.destroy();
            this.familySymbolSprite = null;
        }
        
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
        
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        
        this.currentTexture = null;
        this.lastTextureKey = null;
        this.creature = null;
        
        if (CONSTANTS.DEBUG.VERBOSE_LOGGING) {
            console.log('CreatureSpriteOptimized: Sprite destruido');
        }
    }
}

// Hacer disponible globalmente
window.CreatureSpriteOptimized = CreatureSpriteOptimized; 