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
        this.courtingRadius = null; // Radio dinámico para cortejo
        
        // Configuración desde utilidades
        this.config = CreatureMovementUtils.getConfig();
        
        console.log(`CreatureMovement: Sistema inicializado para ${creature.id}`);
    }

    /**
     * Establece el radio de cortejo dinámico
     */
    setCourtingRadius(radius) {
        this.courtingRadius = radius;
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
                
            case CREATURE_STATES.COURTING:
                if (target) {
                    this.courtingMovement(target, deltaTime);
                } else {
                    this.brownianMovement(deltaTime);
                }
                break;
                
            case CREATURE_STATES.MATING:
                if (target) {
                    this.moveToTarget(target, deltaTime);
                } else {
                    this.brownianMovement(deltaTime);
                }
                break;
                
            case CREATURE_STATES.NURSING:
                // Movimiento muy lento o estático mientras cuida
                this.nursingMovement(deltaTime);
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
     * Movimiento circular de cortejo con acercamiento gradual - fixfeatures
     */
    courtingMovement(target, deltaTime) {
        // Calcular distancia al objetivo
        const distance = CreatureMovementUtils.calculateDistance(
            this.creature.x, this.creature.y, target.x, target.y
        );
        
        // Usar radio dinámico si está disponible, sino usar el por defecto
        const courtingRadius = this.courtingRadius || CONSTANTS.REPRODUCTION.COURTING_RADIUS || 80;
        
        if (distance > courtingRadius * 1.2) {
            // Si está muy lejos, acercarse primero
            this.moveToTarget(target, deltaTime);
        } else {
            // Movimiento circular alrededor de la pareja con acercamiento gradual
            const centerX = target.x;
            const centerY = target.y;
            
            // Calcular ángulo actual respecto al centro
            const currentAngle = Math.atan2(this.creature.y - centerY, this.creature.x - centerX);
            
            // Incrementar ángulo para movimiento circular
            const angularSpeed = 2.0 * deltaTime; // velocidad angular
            const newAngle = currentAngle + angularSpeed;
            
            // Calcular nueva posición en círculo con radio que se reduce gradualmente
            const targetRadius = Math.min(courtingRadius, distance * 0.9); // Acercarse gradualmente
            const newX = centerX + Math.cos(newAngle) * targetRadius;
            const newY = centerY + Math.sin(newAngle) * targetRadius;
            
            // Calcular dirección hacia nueva posición
            const targetDirection = Math.atan2(newY - this.creature.y, newX - this.creature.x);
            this.smoothDirection(targetDirection, deltaTime);
        }
    }

    /**
     * Movimiento lento durante cuidado maternal - fixfeatures
     */
    nursingMovement(deltaTime) {
        // Movimiento muy lento y suave
        const now = Date.now();
        
        if (now - this.lastDirectionChange > 5000) { // Cambiar dirección cada 5 segundos
            const variance = 0.1; // Muy poca variación
            const directionChange = (Math.random() - 0.5) * variance;
            this.creature.direction += directionChange;
            this.lastDirectionChange = now;
        }
    }

        /**
     * Aplica el movimiento a la posición de la criatura
     */
    applyMovement(deltaTime) {
        let speed = this.creature.speed * deltaTime;
        
        // Reducir velocidad durante nursing
        if (this.creature.behavior && this.creature.behavior.states && 
            this.creature.behavior.states.isInState(CREATURE_STATES.NURSING)) {
            speed *= 0.3; // 30% de velocidad normal
        }
        
        // Reducir velocidad de hembras cuando tienen pretendientes
        if (this.creature.dna && this.creature.dna.isFemale() && window.gameReproduction) {
            if (window.gameReproduction.hasSuitors(this.creature)) {
                const reduction = CONSTANTS.REPRODUCTION.GENDER.FEMALE_MOVEMENT_REDUCTION;
                speed *= reduction; // 40% de velocidad normal
                
                // Log ocasional para debug
                if (Math.random() < 0.01) { // 1% chance por frame
                    const suitorCount = window.gameReproduction.getSuitorCount(this.creature);
                    console.log(`🚶‍♀️ FEMALE MOVEMENT: Hembra ${this.creature.id} reduce velocidad (${suitorCount} pretendientes)`);
                }
            }
        }
        
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