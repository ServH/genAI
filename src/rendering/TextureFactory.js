/**
 * GenAI - TextureFactory
 * CAJA OPTIMIZACIÓN - Fase O.4
 * Genera y cachea texturas para criaturas según radio, color y etapa de crecimiento.
 */

class TextureFactory {
    constructor() {
        this.cache = new Map(); // key -> PIXI.Texture
    }

    _key(radius, colorHex) { return `${radius}|${colorHex}`; }

    /**
     * Devuelve una textura reutilizable para la criatura.
     * Genera si no existe usando OrganicShapeRenderer.
     */
    getTexture(creature) {
        const radius = Math.round(creature.radius);
        const colorHex = creature.geneticColor || creature.color;
        const key = this._key(radius, colorHex);
        if (this.cache.has(key)) return this.cache.get(key);

        const renderer = window.gameEngine?.renderer?.getRenderer?.();
        if (!renderer) return null;

        // Crear gráfico temporal
        const gfx = GraphicsPool.acquire();
        const dummySprite = { creature: creature, graphics: gfx };
        const osr = new OrganicShapeRenderer(dummySprite);
        osr.update(0); // dibujar forma

        const texture = renderer.generateTexture({
            source: gfx,
            region: new PIXI.Rectangle(-radius, -radius, radius * 2, radius * 2)
        });

        gfx.clear();
        GraphicsPool.release(gfx);
        osr.destroy();

        this.cache.set(key, texture);
        return texture;
    }
}

window.textureFactory = new TextureFactory(); 