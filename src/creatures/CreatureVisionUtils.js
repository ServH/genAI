/**
 * GenAI - Utilidades de Visión de Criaturas
 * CAJA 2 - Fase 2.3: Comportamiento de Búsqueda
 * 
 * Utilidades matemáticas para el sistema de visión
 */

class CreatureVisionUtils {
    /**
     * Obtiene la configuración de visión desde constantes
     */
    static getConfig() {
        return {
            angle: CONSTANTS.VISION ? CONSTANTS.VISION.ANGLE : 120, // grados
            range: CONSTANTS.VISION ? CONSTANTS.VISION.RANGE : 200, // pixels
            angleRad: ((CONSTANTS.VISION ? CONSTANTS.VISION.ANGLE : 120) * Math.PI) / 180
        };
    }
    
    /**
     * Normaliza un ángulo al rango [0, 2π]
     */
    static normalizeAngle(angle) {
        while (angle < 0) angle += 2 * Math.PI;
        while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
        return angle;
    }
    
    /**
     * Calcula la distancia entre dos puntos
     */
    static calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(mathLUT.dist2(x1, y1, x2, y2));
    }
    
    /**
     * Verifica si un punto está dentro del cono de visión
     */
    static isInVisionCone(creatureX, creatureY, creatureDirection, targetX, targetY, range, angleRad) {
        // Calcular distancia² y comparar con rango² para evitar sqrt
        if (mathLUT.dist2(creatureX, creatureY, targetX, targetY) > range * range) {
            return false;
        }
        // Calcular ángulo usando producto punto (sin atan2)
        const dx = targetX - creatureX;
        const dy = targetY - creatureY;
        const len = Math.sqrt(dx*dx + dy*dy);
        const nx = dx / len;
        const ny = dy / len;
        const dirX = Math.cos(creatureDirection);
        const dirY = Math.sin(creatureDirection);
        const dot = nx * dirX + ny * dirY;
        const isVisible = dot >= Math.cos(angleRad / 2);
        return isVisible;
    }
    
    /**
     * Ordena una lista de comida por distancia
     */
    static sortFoodByDistance(visibleFood) {
        return visibleFood.sort((a, b) => a.distance - b.distance);
    }
}

// Hacer disponible globalmente
window.CreatureVisionUtils = CreatureVisionUtils; 