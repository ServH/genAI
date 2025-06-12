/**
 * GenAI - Criatura Base
 * CAJA 2 - Fase 2.2: Comida Básica (Refactorizada)
 * 
 * Entidad lógica de criatura con sistemas modulares
 */

class Creature {
    constructor(x = 0, y = 0, dna = null) {
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
        
        // Propiedades visuales básicas
        this.radius = CONSTANTS.CREATURES.BASE_RADIUS * (0.8 + Math.random() * 0.4);
        this.color = this.getRandomColor();
        
        // Sistema genético - Fase 3.0
        this.dna = dna;
        this.geneticColor = null;
        this.baseSpeed = this.speed; // Guardar velocidad base para aplicar genes
        
        // Sistema de parentesco - fixfeatures
        this.parents = { mother: null, father: null };
        this.children = [];
        this.generation = 0;
        this.lineageId = null; // Para tracking de familias
        this.birthTime = Date.now();
        
        // Sistemas modulares
        this.energySystem = new CreatureEnergy(this);
        this.behavior = new CreatureBehavior(this);
        this.growth = new CreatureGrowth(this); // fixfeatures
        
        // Inicializar sistemas después de construcción completa
        this.energySystem.init();
        
        console.log(`Creature: Criatura ${this.id} creada en (${Math.round(x)}, ${Math.round(y)}) con ${this.energySystem.getCurrent()} energía`);
        
        if (window.eventBus) {
            eventBus.emit('creature:created', { 
                id: this.id, 
                x: this.x, 
                y: this.y,
                color: this.color,
                energy: this.energySystem.getCurrent()
            });
        }
    }

    /**
     * Actualiza la criatura cada frame
     */
    update(deltaTime) {
        if (!this.isAlive) return;
        
        this.age += deltaTime;
        
        // Actualizar sistemas modulares
        this.behavior.update(deltaTime);
        this.growth.update(deltaTime); // fixfeatures
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
     * Consume energía de la criatura
     */
    consumeEnergy(amount) {
        return this.energySystem.consume(amount);
    }
    
    /**
     * Restaura energía de la criatura
     */
    restoreEnergy(amount) {
        return this.energySystem.restore(amount);
    }
    
    /**
     * Verifica si la criatura está muriendo
     */
    isDying() {
        return this.energySystem.isDying();
    }
    
    /**
     * Obtiene el porcentaje de energía
     */
    getEnergyPercentage() {
        return this.energySystem.getPercentage();
    }
    
    /**
     * Obtiene la energía actual
     */
    get energy() {
        return this.energySystem.getCurrent();
    }
    
    /**
     * Obtiene la energía máxima
     */
    get maxEnergy() {
        return this.energySystem.getMax();
    }
    
    /**
     * Mata la criatura
     */
    die(cause = 'unknown') {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        this.energySystem.set(0);
        
        console.log(`Creature: Criatura ${this.id} murió por ${cause}`);
        
        if (window.eventBus) {
            eventBus.emit('creature:died', { 
                id: this.id,
                cause: cause,
                age: this.age
            });
        }
    }

    /**
     * Destruye la criatura
     */
    destroy() {
        this.die('destroyed');
        
        // Limpiar sistemas modulares
        if (this.energySystem) {
            this.energySystem.destroy();
        }
        if (this.behavior) {
            this.behavior.destroy();
        }
        if (this.growth) {
            this.growth.destroy();
        }
        
        if (window.eventBus) {
            eventBus.emit('creature:destroyed', { id: this.id });
        }
    }
}

// Hacer disponible globalmente
window.Creature = Creature; 