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
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Verifica si un punto está dentro del cono de visión
     */
    static isInVisionCone(creatureX, creatureY, creatureDirection, targetX, targetY, range, angleRad) {
        // Calcular distancia
        const distance = this.calculateDistance(creatureX, creatureY, targetX, targetY);
        if (distance > range) {
            return false;
        }
        
        // Calcular ángulo hacia el objetivo
        const angleToTarget = Math.atan2(targetY - creatureY, targetX - creatureX);
        
        // Normalizar ángulos
        const creatureDir = this.normalizeAngle(creatureDirection);
        const targetDir = this.normalizeAngle(angleToTarget);
        
        // Calcular diferencia angular
        let angleDiff = Math.abs(targetDir - creatureDir);
        if (angleDiff > Math.PI) {
            angleDiff = 2 * Math.PI - angleDiff;
        }
        
        const halfAngle = angleRad / 2;
        const isVisible = angleDiff <= halfAngle;
        
        // Verificar si está dentro del cono
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