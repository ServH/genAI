/**
 * GenAI - Sistema de Movimiento de Criaturas
 * CAJA 2 - Fase 2.3: Comportamiento de Búsqueda
 * 
 * Movimiento suave hacia objetivos y browniano
 */

class CreatureMovement {
    constructor(creature) {
        this.creature = creature;
        this.targetDirection = null;
        this.lastDirectionChange = 0;
        
        // Configuración desde utilidades
        this.config = CreatureMovementUtils.getConfig();
        
        console.log(`CreatureMovement: Sistema inicializado para ${creature.id}`);
    }

    /**
     * Actualiza el movimiento según el estado
     */
    update(deltaTime, state, target) {
        switch (state) {
            case CREATURE_STATES.IDLE:
                this.brownianMovement(deltaTime);
                break;
                
            case CREATURE_STATES.SEEKING:
                if (target) {
                    this.moveToTarget(target, deltaTime);
                } else {
                    this.brownianMovement(deltaTime);
                }
                break;
                
            case CREATURE_STATES.EATING:
                // No moverse mientras come
                break;
        }
        
        // Aplicar movimiento
        this.applyMovement(deltaTime);
    }

    /**
     * Movimiento browniano (estado IDLE)
     */
    brownianMovement(deltaTime) {
        const now = Date.now();
        
        // Cambiar dirección periódicamente
        if (now - this.lastDirectionChange > this.config.brownianChangeInterval) {
            const variance = this.config.directionVariance;
            const directionChange = (Math.random() - 0.5) * variance;
            this.creature.direction += directionChange;
            
            this.lastDirectionChange = now;
            this.config.brownianChangeInterval = 1000 + Math.random() * 2000; // Nuevo intervalo
        }
        
        // Pequeñas variaciones constantes
        const microVariance = (Math.random() - 0.5) * 0.05 * deltaTime;
        this.creature.direction += microVariance;
    }

    /**
     * Movimiento suave hacia objetivo
     */
    moveToTarget(target, deltaTime) {
        // Calcular distancia al objetivo
        const distance = CreatureMovementUtils.calculateDistance(
            this.creature.x, this.creature.y, target.x, target.y
        );
        
        // Si está muy cerca, no moverse más
        if (distance < this.config.minTargetDistance) {
            return;
        }
        
        // Calcular dirección objetivo
        const targetDirection = CreatureMovementUtils.calculateDirectionToTarget(
            this.creature.x, this.creature.y, target.x, target.y
        );
        
        // Interpolación suave hacia la dirección objetivo
        this.smoothDirection(targetDirection, deltaTime);
    }

    /**
     * Interpolación suave de dirección
     */
    smoothDirection(targetDirection, deltaTime) {
        // Calcular diferencia angular más corta
        const angleDiff = CreatureMovementUtils.getShortestAngleDiff(
            this.creature.direction, targetDirection
        );
        
        // Aplicar interpolación suave
        const smoothing = this.config.smoothingFactor * deltaTime * 60; // Normalizar por FPS
        this.creature.direction += angleDiff * smoothing;
        
        // Agregar pequeña variación para movimiento orgánico
        const organicVariance = (Math.random() - 0.5) * 0.02 * deltaTime;
        this.creature.direction += organicVariance;
    }

        /**
     * Aplica el movimiento a la posición de la criatura
     */
    applyMovement(deltaTime) {
        const speed = this.creature.speed * deltaTime;
        
        this.creature.x += Math.cos(this.creature.direction) * speed;
        this.creature.y += Math.sin(this.creature.direction) * speed;
        
        // Verificar límites del mundo
        CreatureMovementUtils.checkWorldBounds(this.creature);
    }

    // Limpieza
    destroy() { this.creature = null; }
}

// Hacer disponible globalmente
window.CreatureMovement = CreatureMovement; 