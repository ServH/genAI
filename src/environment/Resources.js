/**
 * GenAI - Sistema de Recursos
 * CAJA 2 - Fase 2.2: Comida Básica
 * 
 * Gestión de comida y recursos del mundo
 */

class Resources {
    constructor() {
        // Pool de recursos
        this.food = new Map(); // ID -> FoodItem
        this.foodSprites = new Map(); // ID -> PIXI.Graphics
        
        // Configuración
        this.maxFood = CONSTANTS.RESOURCES ? CONSTANTS.RESOURCES.MAX_FOOD : 20;
        this.spawnInterval = CONSTANTS.RESOURCES ? CONSTANTS.RESOURCES.SPAWN_INTERVAL : 2000; // 2 segundos
        this.energyValue = CONSTANTS.RESOURCES ? CONSTANTS.RESOURCES.ENERGY_VALUE : 30;
        this.detectionRadius = CONSTANTS.RESOURCES ? CONSTANTS.RESOURCES.DETECTION_RADIUS : 50;
        
        // Referencias del sistema
        this.stage = null;
        this.camera = null;
        
        // Estado
        this.isInitialized = false;
        this.spawnTimer = 0;
        this.totalSpawned = 0;
        this.totalConsumed = 0;
        
        console.log('Resources: Sistema de recursos inicializado');
    }
    
    /**
     * Inicializa el sistema con stage y cámara
     */
    init(stage, camera) {
        this.stage = stage;
        this.camera = camera;
        this.isInitialized = true;
        
        // Spawn inicial de comida
        this.spawnInitialFood();
        
        console.log(`Resources: Sistema inicializado con ${this.food.size} recursos`);
        
        if (window.eventBus) {
            eventBus.emit('resources:initialized', {
                foodCount: this.food.size,
                maxFood: this.maxFood
            });
        }
    }
    
    /**
     * Spawn inicial de comida
     */
    spawnInitialFood() {
        const initialCount = Math.floor(this.maxFood * 0.3); // 30% inicial
        
        for (let i = 0; i < initialCount; i++) {
            this.spawnFood();
        }
        
        console.log(`Resources: ${initialCount} recursos iniciales spawneados`);
    }
    
    /**
     * Actualiza el sistema de recursos
     */
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        // Actualizar timer de spawn
        this.spawnTimer += deltaTime * 1000; // Convertir a ms
        
        // Spawn automático cada intervalo
        if (this.spawnTimer >= this.spawnInterval && this.food.size < this.maxFood) {
            this.spawnFood();
            this.spawnTimer = 0;
        }
        
        // Actualizar sprites de comida (animación)
        for (const sprite of this.foodSprites.values()) {
            this.updateFoodSprite(sprite, deltaTime);
        }
    }
    
    /**
     * Spawna una nueva comida
     */
    spawnFood() {
        if (this.food.size >= this.maxFood) return null;
        
        const foodItem = this.createFoodItem();
        this.food.set(foodItem.id, foodItem);
        
        // Crear sprite visual
        if (this.stage) {
            const sprite = this.createFoodSprite(foodItem);
            this.foodSprites.set(foodItem.id, sprite);
            this.stage.addChild(sprite);
        }
        
        this.totalSpawned++;
        
        console.log(`Resources: Comida ${foodItem.id} spawneada en (${Math.round(foodItem.x)}, ${Math.round(foodItem.y)})`);
        
        if (window.eventBus) {
            eventBus.emit('food:spawned', {
                id: foodItem.id,
                x: foodItem.x,
                y: foodItem.y,
                energyValue: foodItem.energyValue
            });
        }
        
        return foodItem;
    }
    
    /**
     * Crea un item de comida
     */
    createFoodItem() {
        const margin = 100;
        const worldWidth = window.innerWidth - margin * 2;
        const worldHeight = window.innerHeight - margin * 2;
        
        return {
            id: this.generateId(),
            x: margin + Math.random() * worldWidth,
            y: margin + Math.random() * worldHeight,
            energyValue: this.energyValue,
            radius: 8 + Math.random() * 4, // 8-12px
            color: CONSTANTS.COLORS ? CONSTANTS.COLORS.FOOD : 0xFFD700,
            age: 0,
            pulsePhase: Math.random() * Math.PI * 2 // Para animación
        };
    }
    
    /**
     * Crea el sprite visual de comida
     */
    createFoodSprite(foodItem) {
        const graphics = new PIXI.Graphics();
        
        // Círculo dorado con glow
        graphics.beginFill(foodItem.color, 0.8);
        graphics.drawCircle(0, 0, foodItem.radius);
        graphics.endFill();
        
        // Borde brillante
        graphics.lineStyle(2, 0xFFFFFF, 0.6);
        graphics.drawCircle(0, 0, foodItem.radius);
        
        // Posición
        graphics.x = foodItem.x;
        graphics.y = foodItem.y;
        
        // Datos del item
        graphics.foodData = foodItem;
        
        return graphics;
    }
    
    /**
     * Actualiza la animación del sprite de comida
     */
    updateFoodSprite(sprite, deltaTime) {
        if (!sprite.foodData) return;
        
        // Actualizar edad
        sprite.foodData.age += deltaTime;
        sprite.foodData.pulsePhase += deltaTime * 3; // Velocidad de pulso
        
        // Efecto de pulso
        const pulse = 1 + Math.sin(sprite.foodData.pulsePhase) * 0.2;
        sprite.scale.set(pulse);
        
        // Rotación lenta
        sprite.rotation += deltaTime * 0.5;
    }
    
    /**
     * Verifica si una criatura puede comer comida cercana
     */
    checkFoodConsumption(creature) {
        if (!creature.isAlive) {
            console.log(`Resources: Criatura ${creature.id} no está viva`);
            return null;
        }
        
        if (!creature.energySystem.canEat()) {
            console.log(`Resources: Criatura ${creature.id} no puede comer (energía llena: ${creature.energy}/${creature.maxEnergy})`);
            return null;
        }
        
        let nearestFood = null;
        let nearestDistance = Infinity;
        
        console.log(`Resources: Verificando consumo para ${creature.id} en (${creature.x.toFixed(1)}, ${creature.y.toFixed(1)})`);
        console.log(`Resources: Comida disponible: ${this.food.size} items`);
        
        // Buscar comida más cercana en rango
        for (const foodItem of this.food.values()) {
            const distance = this.calculateDistance(creature.x, creature.y, foodItem.x, foodItem.y);
            console.log(`Resources: Distancia a ${foodItem.id}: ${distance.toFixed(1)}px (límite: ${this.detectionRadius}px)`);
            
            if (distance <= this.detectionRadius && distance < nearestDistance) {
                nearestDistance = distance;
                nearestFood = foodItem;
            }
        }
        
        // Consumir si encontró comida
        if (nearestFood) {
            console.log(`Resources: Comida más cercana encontrada: ${nearestFood.id} a ${nearestDistance.toFixed(1)}px`);
            return this.consumeFood(nearestFood.id, creature);
        } else {
            console.log(`Resources: No hay comida en rango para ${creature.id}`);
        }
        
        return null;
    }
    
    /**
     * Consume una comida específica
     */
    consumeFood(foodId, creature) {
        const foodItem = this.food.get(foodId);
        if (!foodItem) return null;
        
        // Restaurar energía a la criatura
        const energyGained = creature.restoreEnergy(foodItem.energyValue);
        
        // Remover comida
        this.removeFood(foodId);
        
        this.totalConsumed++;
        
        console.log(`Resources: Criatura ${creature.id} consumió comida ${foodId} (+${energyGained} energía)`);
        
        if (window.eventBus) {
            eventBus.emit('food:consumed', {
                foodId: foodId,
                creatureId: creature.id,
                energyGained: energyGained,
                creatureEnergy: creature.energy
            });
        }
        
        return {
            foodItem: foodItem,
            energyGained: energyGained
        };
    }
    
    /**
     * Remueve una comida del sistema
     */
    removeFood(foodId) {
        // Remover sprite
        const sprite = this.foodSprites.get(foodId);
        if (sprite && this.stage) {
            this.stage.removeChild(sprite);
            sprite.destroy();
            this.foodSprites.delete(foodId);
        }
        
        // Remover item
        this.food.delete(foodId);
        
        return true;
    }
    
    /**
     * Calcula distancia entre dos puntos
     */
    calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Genera ID único
     */
    generateId() {
        return 'food_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    
    /**
     * Obtiene toda la comida disponible
     */
    getAllFood() {
        return this.food;
    }
    
    /**
     * Obtiene estadísticas del sistema
     */
    getStats() {
        return {
            currentFood: this.food.size,
            maxFood: this.maxFood,
            totalSpawned: this.totalSpawned,
            totalConsumed: this.totalConsumed,
            spawnTimer: this.spawnTimer,
            spawnInterval: this.spawnInterval,
            energyValue: this.energyValue,
            detectionRadius: this.detectionRadius
        };
    }
    
    /**
     * Destruye el sistema de recursos
     */
    destroy() {
        // Limpiar sprites
        for (const sprite of this.foodSprites.values()) {
            if (this.stage) {
                this.stage.removeChild(sprite);
            }
            sprite.destroy();
        }
        
        this.food.clear();
        this.foodSprites.clear();
        
        this.stage = null;
        this.camera = null;
        this.isInitialized = false;
        
        console.log('Resources: Sistema destruido');
        
        if (window.eventBus) {
            eventBus.emit('resources:destroyed');
        }
    }
}

// Hacer disponible globalmente
window.Resources = Resources; 