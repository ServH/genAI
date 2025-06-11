/**
 * GenAI - Utilidades de Movimiento de Criaturas
 * CAJA 2 - Fase 2.3: Comportamiento de Búsqueda
 * 
 * Utilidades matemáticas y de configuración para movimiento
 */

class CreatureMovementUtils {
    /**
     * Obtiene la configuración de movimiento desde constantes
     */
    static getConfig() {
        return {
            smoothingFactor: CONSTANTS.MOVEMENT ? CONSTANTS.MOVEMENT.SMOOTHING_FACTOR : 0.1,
            minTargetDistance: CONSTANTS.MOVEMENT ? CONSTANTS.MOVEMENT.MIN_TARGET_DISTANCE : 10,
            directionVariance: CONSTANTS.MOVEMENT ? CONSTANTS.MOVEMENT.DIRECTION_VARIANCE : 0.3,
            brownianChangeInterval: 1000 + Math.random() * 2000 // 1-3 segundos
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
     * Calcula la diferencia angular más corta entre dos ángulos
     */
    static getShortestAngleDiff(currentAngle, targetAngle) {
        const currentDir = this.normalizeAngle(currentAngle);
        const targetDir = this.normalizeAngle(targetAngle);
        
        let angleDiff = targetDir - currentDir;
        if (angleDiff > Math.PI) {
            angleDiff -= 2 * Math.PI;
        } else if (angleDiff < -Math.PI) {
            angleDiff += 2 * Math.PI;
        }
        
        return angleDiff;
    }
    
    /**
     * Obtiene los límites del mundo
     */
    static getWorldBounds() {
        return {
            margin: CONSTANTS.CREATURES ? CONSTANTS.CREATURES.WORLD_MARGIN : 50,
            width: CONSTANTS.WORLD ? CONSTANTS.WORLD.WIDTH : 800,
            height: CONSTANTS.WORLD ? CONSTANTS.WORLD.HEIGHT : 600
        };
    }
    
    /**
     * Verifica y corrige la posición según los límites del mundo
     */
    static checkWorldBounds(creature) {
        const bounds = this.getWorldBounds();
        let bounced = false;
        
        // Rebote en bordes horizontales
        if (creature.x < bounds.margin) {
            creature.x = bounds.margin;
            creature.direction = Math.PI - creature.direction;
            bounced = true;
        } else if (creature.x > bounds.width - bounds.margin) {
            creature.x = bounds.width - bounds.margin;
            creature.direction = Math.PI - creature.direction;
            bounced = true;
        }
        
        // Rebote en bordes verticales
        if (creature.y < bounds.margin) {
            creature.y = bounds.margin;
            creature.direction = -creature.direction;
            bounced = true;
        } else if (creature.y > bounds.height - bounds.margin) {
            creature.y = bounds.height - bounds.margin;
            creature.direction = -creature.direction;
            bounced = true;
        }
        
        return bounced;
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
     * Calcula la dirección hacia un objetivo
     */
    static calculateDirectionToTarget(fromX, fromY, toX, toY) {
        return Math.atan2(toY - fromY, toX - fromX);
    }
}

// Hacer disponible globalmente
window.CreatureMovementUtils = CreatureMovementUtils; 