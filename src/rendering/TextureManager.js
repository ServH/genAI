/**
 * GenAI - Gestor de Texturas
 * FASE DE OPTIMIZACIÓN 2
 *
 * Se encarga de pre-renderizar las formas de las criaturas a texturas de PixiJS
 * para que puedan ser usadas por Sprites. Esto evita redibujar PIXI.Graphics
 * en cada frame, mejorando masivamente el rendimiento del renderizado.
 */
class TextureManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.creatureTextures = [];
        this.foodTexture = null;
    }

    /**
     * Genera y cachea todas las texturas necesarias para el juego.
     */
    async generateAllTextures() {
        console.log("TextureManager: Iniciando generación de texturas...");
        this.generateCreatureTextures(10); // Generar 10 variaciones de criaturas
        // this.generateFoodTexture(); // TODO: Optimizar comida también
        console.log("TextureManager: Texturas generadas y cacheadas.");
    }

    /**
     * Genera un número de texturas de criaturas con formas orgánicas variadas.
     * @param {number} count - El número de texturas diferentes a generar.
     */
    generateCreatureTextures(count) {
        const graphics = new PIXI.Graphics();
        const colors = [
            CONSTANTS.COLORS.CREATURE_CYAN,
            CONSTANTS.COLORS.CREATURE_PINK,
            CONSTANTS.COLORS.CREATURE_YELLOW
        ];

        for (let i = 0; i < count; i++) {
            graphics.clear();
            const color = colors[i % colors.length];

            // Usamos una lógica de dibujo similar a la de CreatureSprite original
            // pero solo una vez para generar la textura.
            this.drawOrganicShapeToGraphics(graphics, color);

            const texture = this.renderer.generateTexture(graphics);
            this.creatureTextures.push(texture);
        }
        
        graphics.destroy(); // Ya no necesitamos los gráficos
    }
    
    /**
     * Dibuja una forma orgánica en un objeto PIXI.Graphics.
     * Esta es una versión simplificada de la original para generar la textura base.
     * @param {PIXI.Graphics} graphics - El objeto graphics sobre el que dibujar.
     * @param {string} color - El color de la forma.
     */
    drawOrganicShapeToGraphics(graphics, colorHex) {
        const baseRadius = CONSTANTS.CREATURES.BASE_RADIUS;
        const deformPoints = CONSTANTS.CREATURES.DEFORM_POINTS;
        const deformAmount = CONSTANTS.CREATURES.DEFORM_AMOUNT;
        const color = parseInt(colorHex.replace('#', ''), 16);

        const points = [];
        for (let i = 0; i < deformPoints; i++) {
            const angle = (i / deformPoints) * Math.PI * 2;
            const deform = Math.sin(i * 2.5) * deformAmount + Math.cos(i * 1.5) * deformAmount;
            const radius = baseRadius * (1 + deform);
            points.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
            });
        }

        graphics.beginFill(color, 1);
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            graphics.lineTo(p1.x, p2.y);
        }
        graphics.closePath();
        graphics.endFill();
    }


    /**
     * Obtiene una textura de criatura aleatoria del cache.
     * @returns {PIXI.Texture}
     */
    getRandomCreatureTexture() {
        if (this.creatureTextures.length === 0) {
            console.error("TextureManager: No hay texturas de criatura disponibles.");
            return PIXI.Texture.WHITE;
        }
        const index = Math.floor(Math.random() * this.creatureTextures.length);
        return this.creatureTextures[index];
    }
    
    destroy() {
        // Destruir todas las texturas cacheadas para liberar VRAM
        this.creatureTextures.forEach(texture => texture.destroy());
        this.creatureTextures = [];
        
        if (this.foodTexture) {
            this.foodTexture.destroy();
            this.foodTexture = null;
        }
        console.log("TextureManager: Texturas destruidas.");
    }
}

window.TextureManager = TextureManager; 