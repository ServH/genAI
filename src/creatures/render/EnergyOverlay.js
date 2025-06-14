/**
 * GenAI - EnergyOverlay
 * CAJA OPTIMIZACIÓN - Fase O.1
 * 
 * Responsable de asignar opacidad y pulso visual a un CreatureSprite
 * según su nivel de energía. (≤100 líneas)
 */

class EnergyOverlay {
    constructor(sprite) {
        this.sprite = sprite;              // Instancia de CreatureSprite
        this.creature = sprite.creature;   // Modelo de datos
        this.animationTime = 0;
    }

    /**
     * Actualiza alpha del contenedor en función de la energía.
     * @param {number} deltaTime - Delta en segundos
     */
    update(deltaTime) {
        if (!this.creature) return;
        this.animationTime += deltaTime;

        // 1. Calcular alpha base (0.1-0.8 proporcional a energía)
        const energyPct = this.creature.getEnergyPercentage();
        const baseAlpha = 0.1 + energyPct * 0.7; // rango 0.1-0.8

        // 2. Pulso cuando está muriendo
        let alpha = baseAlpha;
        if (this.creature.isDying()) {
            alpha += Math.sin(this.animationTime * 8) * 0.2; // pulso 8 Hz
        }
        alpha = Math.max(0.05, Math.min(1, alpha));

        this.sprite.container.alpha = alpha;
    }

    destroy() {
        this.sprite = null;
        this.creature = null;
    }
}

// Exponer globalmente
window.EnergyOverlay = EnergyOverlay; 