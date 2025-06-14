/**
 * GenAI - SpatialGrid
 * CAJA OPTIMIZACIÓN - Fase O.3
 * Grid fija para indexar posiciones 2D y realizar queries rápidas.
 * Diseñado para ≤150 líneas.
 */

class SpatialGrid {
    constructor(cellSize = 256) {
        this.cell = cellSize;
        this.map = new Map(); // key -> Set of ids
    }

    _key(cx, cy) { return `${cx},${cy}`; }

    _cellCoord(value) { return Math.floor(value / this.cell); }

    /** Inserta id en celda correspondiente */
    insert(id, x, y) {
        const key = this._key(this._cellCoord(x), this._cellCoord(y));
        let set = this.map.get(key);
        if (!set) { set = new Set(); this.map.set(key, set); }
        set.add(id);
    }

    /** Elimina id de la celda donde estaba */
    remove(id, x, y) {
        const key = this._key(this._cellCoord(x), this._cellCoord(y));
        const set = this.map.get(key);
        if (set) { set.delete(id); if (set.size === 0) this.map.delete(key); }
    }

    /** Actualiza posición de un id */
    update(id, oldX, oldY, newX, newY) {
        const oldKey = this._key(this._cellCoord(oldX), this._cellCoord(oldY));
        const newKey = this._key(this._cellCoord(newX), this._cellCoord(newY));
        if (oldKey === newKey) return;
        const oldSet = this.map.get(oldKey);
        if (oldSet) { oldSet.delete(id); if (oldSet.size === 0) this.map.delete(oldKey); }
        let newSet = this.map.get(newKey);
        if (!newSet) { newSet = new Set(); this.map.set(newKey, newSet); }
        newSet.add(id);
    }

    /** Devuelve ids dentro de rectángulo {x,y,width,height} */
    queryRect(rect) {
        const ids = new Set();
        const cx1 = this._cellCoord(rect.x - 1), cy1 = this._cellCoord(rect.y - 1);
        const cx2 = this._cellCoord(rect.x + rect.width + 1), cy2 = this._cellCoord(rect.y + rect.height + 1);
        for (let cx = cx1; cx <= cx2; cx++) {
            for (let cy = cy1; cy <= cy2; cy++) {
                const set = this.map.get(this._key(cx, cy));
                if (set) set.forEach(id => ids.add(id));
            }
        }
        return ids;
    }

    clear() { this.map.clear(); }
}

window.SpatialGrid = SpatialGrid; 