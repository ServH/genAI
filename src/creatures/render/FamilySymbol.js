/**
 * GenAI - FamilySymbol
 * CAJA OPTIMIZACIÓN - Fase O.1
 * 
 * Encapsula la lógica de símbolos familiares para un CreatureSprite (≤100 líneas)
 */

class FamilySymbol {
    constructor(sprite) {
        this.sprite = sprite;
        this.creature = sprite.creature;
        this.text = null;
        this.lastLineageId = null;
    }

    /** Actualiza o crea/elimina símbolo familiar */
    update() {
        const lineageId = this.creature.lineageId;

        // No hay familia => eliminar símbolo existente
        if (!lineageId) {
            this._remove();
            return;
        }

        // Cambió de familia
        if (this.lastLineageId !== lineageId) {
            this._remove();
            this._create(lineageId);
            this.lastLineageId = lineageId;
        }

        // Actualizar apariencia (tamaño/posición/color)
        if (this.text) {
            const visualInfo = window.gameVisualId?.getVisualInfo(this.creature);
            if (visualInfo) {
                this.text.style.fill = visualInfo.symbolColor;
                this.text.style.fontSize = window.gameVisualId.getSymbolSize(this.creature);
            }
            this._updatePosition();
        }
    }

    _create(lineageId) {
        const info = window.gameVisualId?.getVisualInfo(this.creature);
        if (!info || !info.symbol) return;

        this.text = new PIXI.Text(info.symbol, {
            fontFamily: 'Arial',
            fontSize: window.gameVisualId.getSymbolSize(this.creature),
            fill: info.symbolColor,
            align: 'center',
            stroke: '#000',
            strokeThickness: 1
        });
        this.text.anchor.set(0.5);
        this.sprite.container.addChild(this.text);
        this._updatePosition();
    }

    _updatePosition() {
        const symbolSize = this.text.style.fontSize;
        const scale = this.creature.growth ? this.creature.growth.getScale() : 1;
        const offsetY = -(this.creature.radius * scale + symbolSize * 0.5 + 5);
        this.text.position.set(0, offsetY);
        this.text.scale.set(scale);
    }

    _remove() {
        if (this.text) {
            this.sprite.container.removeChild(this.text);
            this.text.destroy();
            this.text = null;
        }
    }

    destroy() {
        this._remove();
        this.sprite = null;
        this.creature = null;
    }
}

// Exponer globalmente
window.FamilySymbol = FamilySymbol; 