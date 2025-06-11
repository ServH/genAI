/**
 * GenAI - Criatura Base
 * CAJA 2 - Fase 2.0: Criatura Mínima
 * 
 * Entidad lógica de criatura con movimiento browniano
 */

class Creature {
    constructor(x = 0, y = 0) {
        // Identificación única
        this.id = this.generateId();
        
        // Posición y movimiento
        this.x = x;
        this.y = y;
        this.direction = Math.random() * Math.PI * 2; // Dirección aleatoria inicial
        this.speed = CONSTANTS.CREATURES.MIN_SPEED + 
                    Math.random() * (CONSTANTS.CREATURES.MAX_SPEED - CONSTANTS.CREATURES.MIN_SPEED);
        
        // Estado
        this.isAlive = true;
        this.age = 0;
        
        // Configuración de movimiento browniano
        this.directionTimer = 1 + Math.random() * 2; // 1-3 segundos
        this.directionChangeRate = 0.5; // Intensidad del cambio
        
        // Propiedades visuales básicas
        this.radius = CONSTANTS.CREATURES.BASE_RADIUS * (0.8 + Math.random() * 0.4);
        this.color = this.getRandomColor();
        
        console.log(`Creature: Criatura ${this.id} creada en (${Math.round(x)}, ${Math.round(y)})`);
        
        if (window.eventBus) {
            eventBus.emit('creature:created', { 
                id: this.id, 
                x: this.x, 
                y: this.y,
                color: this.color
            });
        }
    }

    /**
     * Actualiza la criatura cada frame
     */
    update(deltaTime) {
        if (!this.isAlive) return;
        
        this.age += deltaTime;
        
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
            this.direction += directionChange;
            this.directionTimer = 1 + Math.random() * 2; // Nuevo timer aleatorio
        }
        
        // Pequeñas variaciones constantes para movimiento más orgánico
        this.direction += (Math.random() - 0.5) * 0.1 * deltaTime;
    }

    /**
     * Mueve la criatura según su dirección y velocidad
     */
    move(deltaTime) {
        const oldX = this.x;
        const oldY = this.y;
        
        this.x += Math.cos(this.direction) * this.speed * deltaTime;
        this.y += Math.sin(this.direction) * this.speed * deltaTime;
        
        // Emitir evento si se movió significativamente
        const distance = Math.sqrt((this.x - oldX) ** 2 + (this.y - oldY) ** 2);
        if (distance > 1 && window.eventBus) {
            eventBus.emit('creature:moved', {
                id: this.id,
                x: this.x,
                y: this.y,
                direction: this.direction
            });
        }
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
        if (this.x - this.radius < margin) {
            this.x = margin + this.radius;
            this.direction = Math.PI - this.direction;
            bounced = true;
        } else if (this.x + this.radius > worldWidth - margin) {
            this.x = worldWidth - margin - this.radius;
            this.direction = Math.PI - this.direction;
            bounced = true;
        }
        
        // Rebote en bordes verticales
        if (this.y - this.radius < margin) {
            this.y = margin + this.radius;
            this.direction = -this.direction;
            bounced = true;
        } else if (this.y + this.radius > worldHeight - margin) {
            this.y = worldHeight - margin - this.radius;
            this.direction = -this.direction;
            bounced = true;
        }
        
        if (bounced && window.eventBus) {
            eventBus.emit('creature:bounced', { id: this.id });
        }
    }

    /**
     * Obtiene un color aleatorio de la paleta
     */
    getRandomColor() {
        const colors = [
            CONSTANTS.COLORS.CREATURE_CYAN,
            CONSTANTS.COLORS.CREATURE_PINK,
            CONSTANTS.COLORS.CREATURE_YELLOW
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Genera un ID único para la criatura
     */
    generateId() {
        return 'creature_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }

    /**
     * Obtiene los límites de la criatura
     */
    getBounds() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }

    /**
     * Destruye la criatura
     */
    destroy() {
        this.isAlive = false;
        
        if (window.eventBus) {
            eventBus.emit('creature:destroyed', { id: this.id });
        }
    }
}

// Hacer disponible globalmente
window.Creature = Creature; 