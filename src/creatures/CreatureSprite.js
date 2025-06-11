/**
 * GenAI - Sprite de Criatura
 * CAJA 2 - Fase 2.0: Criatura Mínima
 * 
 * Renderizado orgánico con deformación sin/cos
 */

class CreatureSprite {
    constructor(creature) {
        this.creature = creature;
        this.graphics = new PIXI.Graphics();
        this.container = new PIXI.Container();
        
        // Propiedades de deformación orgánica
        this.baseRadius = creature.radius;
        this.deformPoints = CONSTANTS.CREATURES.DEFORM_POINTS;
        this.deformAmount = CONSTANTS.CREATURES.DEFORM_AMOUNT;
        this.animationTime = Math.random() * Math.PI * 2; // Offset aleatorio
        this.animationSpeed = 2.0; // Velocidad de ondulación
        
        // Color y estilo
        this.color = this.hexToNumber(creature.color);
        this.alpha = 0.8;
        
        this.setupSprite();
        this.updateVisuals();
        
        console.log(`CreatureSprite: Sprite creado para criatura ${creature.id}`);
    }

    /**
     * Configura la estructura del sprite
     */
    setupSprite() {
        // Agregar graphics al container
        this.container.addChild(this.graphics);
        
        // Configurar posición inicial
        this.container.x = this.creature.x;
        this.container.y = this.creature.y;
        
        // Configurar punto de anclaje al centro
        this.graphics.pivot.set(0, 0);
    }

    /**
     * Actualiza los visuales del sprite
     */
    update(deltaTime) {
        // Actualizar tiempo de animación
        this.animationTime += this.animationSpeed * deltaTime;
        
        // Sincronizar posición con criatura
        this.container.x = this.creature.x;
        this.container.y = this.creature.y;
        
        // Actualizar opacidad basada en energía
        this.updateEnergyVisuals();
        
        // Redibujar forma orgánica
        this.updateVisuals();
        
        if (window.eventBus) {
            eventBus.emit('creature:rendered', { 
                id: this.creature.id,
                frame: Math.floor(this.animationTime * 10) % 60,
                energy: this.creature.energy
            });
        }
    }

    /**
     * Actualiza los efectos visuales basados en energía
     */
    updateEnergyVisuals() {
        if (!this.creature || typeof this.creature.energy === 'undefined') return;
        
        // Calcular opacidad basada en energía (0-100 -> 0.1-1.0)
        const energyPercentage = this.creature.getEnergyPercentage();
        const minAlpha = 0.1;
        const maxAlpha = 0.8;
        this.alpha = minAlpha + (energyPercentage * (maxAlpha - minAlpha));
        
        // Efecto de pulso cuando energía es crítica (< 20%)
        if (this.creature.energy <= 20 && this.creature.isAlive) {
            const pulseIntensity = Math.sin(this.animationTime * 8) * 0.2;
            this.alpha += pulseIntensity;
        }
        
        // Asegurar que alpha esté en rango válido
        this.alpha = Math.max(0.05, Math.min(1.0, this.alpha));
        
        // Aplicar opacidad al container
        this.container.alpha = this.alpha;
    }

    /**
     * Actualiza la forma visual orgánica
     */
    updateVisuals() {
        this.graphics.clear();
        
        // Crear forma orgánica deformada
        this.createOrganicShape();
    }

    /**
     * Crea la forma orgánica usando deformación sin/cos
     */
    createOrganicShape() {
        const points = [];
        
        // Generar puntos deformados
        for (let i = 0; i < this.deformPoints; i++) {
            const angle = (i / this.deformPoints) * Math.PI * 2;
            
            // Deformación base con sin/cos
            const deform1 = Math.sin(this.animationTime + i * 0.5) * this.deformAmount;
            const deform2 = Math.cos(this.animationTime * 0.7 + i * 0.3) * this.deformAmount * 0.5;
            const totalDeform = deform1 + deform2;
            
            // Radio deformado
            const radius = this.baseRadius * (1 + totalDeform);
            
            // Calcular posición del punto
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            points.push({ x, y });
        }
        
        // Dibujar forma suave conectando los puntos
        this.drawSmoothShape(points);
    }

    /**
     * Dibuja una forma suave conectando los puntos
     */
    drawSmoothShape(points) {
        if (points.length < 3) return;
        
        // Configurar estilo
        this.graphics.beginFill(this.color, this.alpha);
        this.graphics.lineStyle(1, this.color, 0.3);
        
        // Comenzar desde el primer punto
        this.graphics.moveTo(points[0].x, points[0].y);
        
        // Crear curvas suaves entre puntos
        for (let i = 0; i < points.length; i++) {
            const current = points[i];
            const next = points[(i + 1) % points.length];
            const nextNext = points[(i + 2) % points.length];
            
            // Punto de control para curva suave
            const controlX = next.x + (nextNext.x - current.x) * 0.1;
            const controlY = next.y + (nextNext.y - current.y) * 0.1;
            
            // Dibujar curva cuadrática
            this.graphics.quadraticCurveTo(controlX, controlY, next.x, next.y);
        }
        
        // Cerrar la forma
        this.graphics.closePath();
        this.graphics.endFill();
        
        // Agregar punto central sutil para dar profundidad
        this.addCenterPoint();
    }

    /**
     * Agrega un punto central para dar profundidad
     */
    addCenterPoint() {
        const centerRadius = this.baseRadius * 0.3;
        const centerAlpha = 0.4;
        
        // Color más claro para el centro
        const centerColor = this.lightenColor(this.color, 0.3);
        
        this.graphics.beginFill(centerColor, centerAlpha);
        this.graphics.drawCircle(0, 0, centerRadius);
        this.graphics.endFill();
    }

    /**
     * Convierte color hex string a número
     */
    hexToNumber(hex) {
        return parseInt(hex.replace('#', ''), 16);
    }

    /**
     * Aclara un color para efectos
     */
    lightenColor(color, amount) {
        const r = Math.min(255, ((color >> 16) & 0xFF) + amount * 255);
        const g = Math.min(255, ((color >> 8) & 0xFF) + amount * 255);
        const b = Math.min(255, (color & 0xFF) + amount * 255);
        
        return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
    }

    /**
     * Establece un nuevo color
     */
    setColor(colorHex) {
        this.color = this.hexToNumber(colorHex);
        this.updateVisuals();
    }

    /**
     * Obtiene el container para agregar al stage
     */
    getContainer() {
        return this.container;
    }

    /**
     * Destruye el sprite y limpia recursos
     */
    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;
        }
        
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        
        this.creature = null;
    }
}

// Hacer disponible globalmente
window.CreatureSprite = CreatureSprite; 