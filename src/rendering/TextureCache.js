/**
 * GenAI - Sistema de Cache de Texturas
 * RAMA PERFORMANCE - Optimización de Renderizado
 * 
 * Cache inteligente de RenderTextures para criaturas
 */

class TextureCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = CONSTANTS.PERFORMANCE.TEXTURE_CACHE_SIZE;
        this.renderer = null;
        this.stats = {
            hits: 0,
            misses: 0,
            created: 0,
            evicted: 0
        };
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('TextureCache: Sistema inicializado');
        }
    }

    /**
     * Inicializa el cache con el renderer de PIXI
     */
    init(renderer) {
        this.renderer = renderer;
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('TextureCache: Renderer configurado');
        }
    }

    /**
     * Genera una clave única para la textura basada en características
     */
    generateKey(creature) {
        const dna = creature.dna;
        const stage = creature.growthSystem?.getCurrentStage()?.name || 'adult';
        const energyLevel = this.getEnergyLevel(creature);
        
        return `${stage}_${energyLevel}_${dna?.genes?.COLOR_R || 0.5}_${dna?.genes?.COLOR_G || 0.5}_${dna?.genes?.COLOR_B || 0.5}_${dna?.genes?.SIZE || 1.0}`;
    }

    /**
     * Obtiene el nivel de energía discreto para cache
     */
    getEnergyLevel(creature) {
        const percentage = creature.getEnergyPercentage();
        if (percentage > 0.8) return 'high';
        if (percentage > 0.5) return 'medium';
        if (percentage > 0.2) return 'low';
        return 'critical';
    }

    /**
     * Obtiene o crea una textura para la criatura
     */
    getTexture(creature) {
        const key = this.generateKey(creature);
        
        if (this.cache.has(key)) {
            this.stats.hits++;
            return this.cache.get(key);
        }
        
        this.stats.misses++;
        const texture = this.createTexture(creature);
        this.setTexture(key, texture);
        
        return texture;
    }

    /**
     * Crea una nueva RenderTexture para la criatura
     */
    createTexture(creature) {
        if (!this.renderer) {
            throw new Error('TextureCache: Renderer no inicializado');
        }

        const size = this.calculateTextureSize(creature);
        const renderTexture = PIXI.RenderTexture.create({
            width: size,
            height: size,
            resolution: 1
        });

        // Crear el gráfico temporal para renderizar
        const graphics = this.createCreatureGraphics(creature);
        
        // Renderizar a la textura
        this.renderer.render(graphics, { renderTexture });
        
        // Limpiar el gráfico temporal
        graphics.destroy();
        
        this.stats.created++;
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log(`TextureCache: Textura creada para ${creature.id}`);
        }
        
        return renderTexture;
    }

    /**
     * Calcula el tamaño necesario para la textura
     */
    calculateTextureSize(creature) {
        const baseRadius = CONSTANTS.CREATURES.BASE_RADIUS;
        const sizeMultiplier = creature.dna?.genes?.SIZE || 1.0;
        const stageScale = creature.growthSystem?.getScale() || 1.0;
        
        return Math.ceil((baseRadius * sizeMultiplier * stageScale + 10) * 2);
    }

    /**
     * Crea los gráficos de la criatura para renderizar
     */
    createCreatureGraphics(creature) {
        // Reutilizar la lógica existente de CreatureSprite
        const graphics = new PIXI.Graphics();
        const baseRadius = CONSTANTS.CREATURES.BASE_RADIUS;
        const sizeMultiplier = creature.dna?.genes?.SIZE || 1.0;
        const stageScale = creature.growthSystem?.getScale() || 1.0;
        const radius = baseRadius * sizeMultiplier * stageScale;
        
        // Aplicar color genético
        const color = this.getCreatureColor(creature);
        graphics.beginFill(color, 0.8);
        
        // Crear forma orgánica
        this.drawOrganicShape(graphics, radius);
        
        graphics.endFill();
        
        return graphics;
    }

    /**
     * Obtiene el color de la criatura
     */
    getCreatureColor(creature) {
        if (creature.dna?.genes) {
            const r = Math.floor(creature.dna.genes.COLOR_R * 255);
            const g = Math.floor(creature.dna.genes.COLOR_G * 255);
            const b = Math.floor(creature.dna.genes.COLOR_B * 255);
            return (r << 16) | (g << 8) | b;
        }
        return 0x00fff0; // Color por defecto
    }

    /**
     * Dibuja la forma orgánica de la criatura
     */
    drawOrganicShape(graphics, radius) {
        const points = CONSTANTS.CREATURES.DEFORM_POINTS;
        const deformAmount = CONSTANTS.CREATURES.DEFORM_AMOUNT;
        
        const shapePoints = [];
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const deformation = Math.sin(angle * 3) * deformAmount;
            const currentRadius = radius * (1 + deformation);
            
            shapePoints.push({
                x: Math.cos(angle) * currentRadius,
                y: Math.sin(angle) * currentRadius
            });
        }
        
        // Dibujar forma suave
        graphics.moveTo(shapePoints[0].x, shapePoints[0].y);
        for (let i = 1; i < shapePoints.length; i++) {
            const current = shapePoints[i];
            const next = shapePoints[(i + 1) % shapePoints.length];
            const controlX = (current.x + next.x) / 2;
            const controlY = (current.y + next.y) / 2;
            graphics.quadraticCurveTo(current.x, current.y, controlX, controlY);
        }
        graphics.closePath();
    }

    /**
     * Almacena una textura en el cache
     */
    setTexture(key, texture) {
        // Verificar límite de cache
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }
        
        this.cache.set(key, texture);
    }

    /**
     * Elimina la textura más antigua del cache
     */
    evictOldest() {
        const firstKey = this.cache.keys().next().value;
        const texture = this.cache.get(firstKey);
        
        if (texture) {
            texture.destroy();
            this.cache.delete(firstKey);
            this.stats.evicted++;
            
            if (CONSTANTS.DEBUG.MODE) {
                console.log(`TextureCache: Textura evicted: ${firstKey}`);
            }
        }
    }

    /**
     * Limpia el cache completamente
     */
    clear() {
        for (const texture of this.cache.values()) {
            texture.destroy();
        }
        this.cache.clear();
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('TextureCache: Cache limpiado');
        }
    }

    /**
     * Obtiene estadísticas del cache
     */
    getStats() {
        return {
            ...this.stats,
            size: this.cache.size,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
        };
    }

    /**
     * Destruye el sistema
     */
    destroy() {
        this.clear();
        this.renderer = null;
        
        if (CONSTANTS.DEBUG.MODE) {
            console.log('TextureCache: Sistema destruido');
        }
    }
}

// Hacer disponible globalmente
window.TextureCache = TextureCache; 