/** SpriteCuller - desactiva render de sprites fuera de viewport (≤120 líneas) */
class SpriteCuller {
    constructor(camera, margin = 100) {
        this.camera = camera;
        this.margin = margin;
        this.resetFrame();
    }

    resetFrame() { this.total = 0; this.visible = 0; }

    _viewport() {
        return this.camera?.getViewportRect?.() || { x: 0, y: 0, width: 1920, height: 1080 };
    }

    check(sprite) {
        this.total++;
        const vp = this._viewport();
        const x = sprite.creature.x, y = sprite.creature.y;
        const inside = x >= vp.x - this.margin && x <= vp.x + vp.width + this.margin &&
                       y >= vp.y - this.margin && y <= vp.y + vp.height + this.margin;
        sprite.getContainer().visible = inside;
        if (inside) this.visible++;
    }

    getStats() { return { spritesVisible: this.visible, spritesCulled: this.total - this.visible }; }
}

window.SpriteCuller = SpriteCuller; 