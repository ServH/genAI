/**
 * GenAI - Comportamientos de Criaturas
 * CAJA 2 - Fase 2.0: Criatura Mínima
 * 
 * Gestión de movimiento browniano y comportamientos
 */

class CreatureBehavior {
    constructor(creature) {
        this.creature = creature;
        
        // Configuración de movimiento browniano
        this.directionTimer = 1 + Math.random() * 2; // 1-3 segundos
        this.directionChangeRate = 0.5; // Intensidad del cambio
        
        // Estado de movimiento
        this.isMoving = true;
        this.lastPosition = { x: creature.x, y: creature.y };
    }
    
    /**
     * Actualiza el comportamiento de la criatura
     */
    update(deltaTime) {
        if (!this.creature.isAlive) return;
        
        // Verificar si puede comer comida cercana
        this.checkFoodConsumption();
        
        // Actualizar movimiento browniano
        this.updateMovement(deltaTime);
        
        // Mover criatura
        this.move(deltaTime);
        
        // Verificar límites del mundo
        this.checkWorldBounds();
    }
    
    /**
     * Actualiza el movimiento browniano
     */
    updateMovement(deltaTime) {
        // Reducir timer de cambio de dirección
        this.directionTimer -= deltaTime;
        
        // Cambiar dirección aleatoriamente
        if (this.directionTimer <= 0) {
            const directionChange = (Math.random() - 0.5) * Math.PI * this.directionChangeRate;
            this.creature.direction += directionChange;
            this.directionTimer = 1 + Math.random() * 2; // Nuevo timer aleatorio
        }
        
        // Pequeñas variaciones constantes para movimiento más orgánico
        this.creature.direction += (Math.random() - 0.5) * 0.1 * deltaTime;
    }
    
    /**
     * Mueve la criatura según su dirección y velocidad
     */
    move(deltaTime) {
        const oldX = this.creature.x;
        const oldY = this.creature.y;
        
        this.creature.x += Math.cos(this.creature.direction) * this.creature.speed * deltaTime;
        this.creature.y += Math.sin(this.creature.direction) * this.creature.speed * deltaTime;
        
        // Emitir evento si se movió significativamente
        const distance = Math.sqrt((this.creature.x - oldX) ** 2 + (this.creature.y - oldY) ** 2);
        if (distance > 1 && window.eventBus) {
            eventBus.emit('creature:moved', {
                id: this.creature.id,
                x: this.creature.x,
                y: this.creature.y,
                direction: this.creature.direction,
                distance: distance
            });
        }
        
        // Actualizar última posición
        this.lastPosition.x = oldX;
        this.lastPosition.y = oldY;
    }
    
    /**
     * Verifica y maneja los límites del mundo
     */
    checkWorldBounds() {
        const margin = CONSTANTS.CREATURES.WORLD_MARGIN;
        const worldWidth = window.innerWidth;
        const worldHeight = window.innerHeight;
        
        let bounced = false;
        
        // Rebote en bordes horizontales
        if (this.creature.x - this.creature.radius < margin) {
            this.creature.x = margin + this.creature.radius;
            this.creature.direction = Math.PI - this.creature.direction;
            bounced = true;
        } else if (this.creature.x + this.creature.radius > worldWidth - margin) {
            this.creature.x = worldWidth - margin - this.creature.radius;
            this.creature.direction = Math.PI - this.creature.direction;
            bounced = true;
        }
        
        // Rebote en bordes verticales
        if (this.creature.y - this.creature.radius < margin) {
            this.creature.y = margin + this.creature.radius;
            this.creature.direction = -this.creature.direction;
            bounced = true;
        } else if (this.creature.y + this.creature.radius > worldHeight - margin) {
            this.creature.y = worldHeight - margin - this.creature.radius;
            this.creature.direction = -this.creature.direction;
            bounced = true;
        }
        
        if (bounced && window.eventBus) {
            eventBus.emit('creature:bounced', { 
                id: this.creature.id,
                x: this.creature.x,
                y: this.creature.y
            });
        }
    }
    
    /**
     * Calcula la distancia a un punto
     */
    distanceTo(x, y) {
        const dx = this.creature.x - x;
        const dy = this.creature.y - y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Verifica si está cerca de un punto
     */
    isNear(x, y, radius) {
        return this.distanceTo(x, y) <= radius;
    }
    
    /**
     * Obtiene la velocidad actual
     */
    getVelocity() {
        return {
            x: Math.cos(this.creature.direction) * this.creature.speed,
            y: Math.sin(this.creature.direction) * this.creature.speed
        };
    }
    
    /**
     * Detiene el movimiento
     */
    stop() {
        this.isMoving = false;
    }
    
    /**
     * Reanuda el movimiento
     */
    resume() {
        this.isMoving = true;
    }
    
    /**
     * Verifica si puede consumir comida cercana
     */
    checkFoodConsumption() {
        if (!window.gameResources) return;
        
        const result = gameResources.checkFoodConsumption(this.creature);
        if (result) {
            // Emitir evento de alimentación exitosa
            if (window.eventBus) {
                eventBus.emit('creature:fed', {
                    creatureId: this.creature.id,
                    foodId: result.foodItem.id,
                    energyGained: result.energyGained,
                    newEnergy: this.creature.energy
                });
            }
        }
    }
    
    /**
     * Limpia el comportamiento
     */
    destroy() {
        this.creature = null;
    }
}

// Hacer disponible globalmente
window.CreatureBehavior = CreatureBehavior; 