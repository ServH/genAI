/**
 * GenAI - OrganicShapeRenderer
 * CAJA OPTIMIZACIÓN - Fase O.1
 *
 * Genera y actualiza la forma orgánica deformada de una criatura utilizando
 * sin/cos y parámetros del gen. (≤100 líneas)
 */

class OrganicShapeRenderer {
    constructor(sprite) {
        this.sprite = sprite;              // CreatureSprite
        this.creature = sprite.creature;   // Modelo de datos
        this.graphics = sprite.graphics;   // PIXI.Graphics a dibujar
        
        // Parámetros de deformación
        this.baseRadius = this.creature.radius;
        this.deformPoints = CONSTANTS.CREATURES.DEFORM_POINTS;
        this.deformAmount = CONSTANTS.CREATURES.DEFORM_AMOUNT;
        this.animationTime = Math.random() * Math.PI * 2;
        this.animationSpeed = 2.0;
        
        // Color
        this.color = this._hexToNumber(this.creature.color);
        this.alpha = 0.8;
    }

    /** Actualiza la animación y redibuja la forma */
    update(deltaTime) {
        this.animationTime += this.animationSpeed * deltaTime;
        this._drawShape();
    }

    _drawShape() {
        const points = [];
        const growthScale = this.creature.growth ? this.creature.growth.getScale() : 1.0;
        
        // Calcular puntos deformados
        for (let i = 0; i < this.deformPoints; i++) {
            const angle = (i / this.deformPoints) * Math.PI * 2;
            const deform = Math.sin(this.animationTime + i * 0.5) * this.deformAmount +
                           Math.cos(this.animationTime * 0.7 + i * 0.3) * this.deformAmount * 0.5;
            const radius = this.baseRadius * (1 + deform) * growthScale;
            points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        }

        // Dibujar con curvas suaves
        const gfx = this.graphics;
        gfx.clear();
        const displayColor = this.creature.geneticColor || this.color;
        gfx.beginFill(displayColor, this.alpha).lineStyle(1, this.color, 0.3);
        gfx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length; i++) {
            const cur = points[i], nxt = points[(i + 1) % points.length], nxt2 = points[(i + 2) % points.length];
            gfx.quadraticCurveTo(nxt.x + (nxt2.x - cur.x) * 0.1, nxt.y + (nxt2.y - cur.y) * 0.1, nxt.x, nxt.y);
        }
        gfx.closePath().endFill();
        this._drawCenter(growthScale);
    }

    _drawCenter(scale) {
        const centerRadius = this.baseRadius * 0.3 * scale;
        const centerColor = this._lightenColor(this.color, 0.3);
        this.graphics.beginFill(centerColor, 0.4).drawCircle(0, 0, centerRadius).endFill();
    }

    _hexToNumber(hex) { return parseInt(hex.replace('#', ''), 16); }

    _lightenColor(color, amt) {
        const r = Math.min(255, ((color >> 16) & 0xFF) + amt * 255);
        const g = Math.min(255, ((color >> 8) & 0xFF) + amt * 255);
        const b = Math.min(255, (color & 0xFF) + amt * 255);
        return (r << 16) | (g << 8) | b;
    }

    destroy() { this.graphics = this.creature = this.sprite = null; }
}

window.OrganicShapeRenderer = OrganicShapeRenderer; 