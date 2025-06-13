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
        
        // Sistema de identificación visual - fixfeatures
        this.symbolText = null;
        this.lastLineageId = null;
        
        // Arquitectura Dual: Sistema de glow de mutación (Fase 3.2)
        this.mutationGlow = null;
        this.mutationGlowStartTime = null;
        this.mutationGlowDuration = CONSTANTS.MUTATIONS.GLOW_DURATION;
        
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
        
        // Actualizar símbolo familiar - fixfeatures
        this.updateFamilySymbol();
        
        // Arquitectura Dual: Actualizar glow de mutación
        this.updateMutationGlow(deltaTime);
        
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
        
        // Efecto de pulso cuando energía es muy baja
        if (this.creature.isDying() && this.creature.isAlive) {
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
        
        // Obtener escala de crecimiento - fixfeatures
        const growthScale = this.creature.growth ? this.creature.growth.getScale() : 1.0;
        
        // Generar puntos deformados
        for (let i = 0; i < this.deformPoints; i++) {
            const angle = (i / this.deformPoints) * Math.PI * 2;
            
            // Deformación base con sin/cos
            const deform1 = Math.sin(this.animationTime + i * 0.5) * this.deformAmount;
            const deform2 = Math.cos(this.animationTime * 0.7 + i * 0.3) * this.deformAmount * 0.5;
            const totalDeform = deform1 + deform2;
            
            // Radio deformado con escala de crecimiento
            const radius = this.baseRadius * (1 + totalDeform) * growthScale;
            
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
        
        // Color genético o color base - Fase 3.0
        const displayColor = this.creature.geneticColor || this.color;
        
        // Configurar estilo
        this.graphics.beginFill(displayColor, this.alpha);
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
        // Obtener escala de crecimiento - fixfeatures
        const growthScale = this.creature.growth ? this.creature.growth.getScale() : 1.0;
        const centerRadius = this.baseRadius * 0.3 * growthScale;
        const centerAlpha = 0.4;
        
        // Color más claro para el centro
        const centerColor = this.lightenColor(this.color, 0.3);
        
        this.graphics.beginFill(centerColor, centerAlpha);
        this.graphics.drawCircle(0, 0, centerRadius);
        this.graphics.endFill();
        
        // Arquitectura Dual: Agregar glow de mutación si está activo
        this.addMutationGlow();
    }

    /**
     * Arquitectura Dual: Actualiza el glow de mutación (Fase 3.2)
     * Funcionalidad: Glow verde que se desvanece en 5 segundos
     * Performance: Solo actualiza si hay glow activo
     */
    updateMutationGlow(deltaTime) {
        // Performance: Solo procesar si hay glow activo
        if (!this.mutationGlowStartTime) return;
        
        const now = Date.now();
        const elapsed = now - this.mutationGlowStartTime;
        
        // Funcionalidad: Remover glow después de duración
        if (elapsed >= this.mutationGlowDuration) {
            this.removeMutationGlow();
        }
    }

    /**
     * Arquitectura Dual: Crea glow de mutación
     * Funcionalidad: Glow verde brillante
     * Performance: Graphics simple, sin efectos complejos
     */
    createMutationGlow() {
        // Performance: Solo crear si no existe
        if (this.mutationGlow) return;
        
        this.mutationGlow = new PIXI.Graphics();
        this.mutationGlowStartTime = Date.now();
        
        // Agregar al container
        this.container.addChild(this.mutationGlow);
        
        console.log(`CreatureSprite: Glow de mutación creado para criatura ${this.creature.id}`);
    }

    /**
     * Arquitectura Dual: Agrega glow visual durante renderizado
     * Performance: Solo si glow está activo
     */
    addMutationGlow() {
        // Performance: Solo procesar si hay glow activo
        if (!this.mutationGlow || !this.mutationGlowStartTime) return;
        
        const now = Date.now();
        const elapsed = now - this.mutationGlowStartTime;
        const progress = elapsed / this.mutationGlowDuration;
        
        // Funcionalidad: Alpha que se desvanece (1.0 → 0.0)
        const alpha = CONSTANTS.MUTATIONS.GLOW_ALPHA * (1 - progress);
        
        if (alpha <= 0) {
            this.removeMutationGlow();
            return;
        }
        
        // Performance: Graphics simple
        this.mutationGlow.clear();
        this.mutationGlow.beginFill(CONSTANTS.MUTATIONS.GLOW_COLOR, alpha);
        
        // Obtener escala de crecimiento
        const growthScale = this.creature.growth ? this.creature.growth.getScale() : 1.0;
        const glowRadius = this.baseRadius * 1.3 * growthScale; // 30% más grande que la criatura
        
        this.mutationGlow.drawCircle(0, 0, glowRadius);
        this.mutationGlow.endFill();
    }

    /**
     * Arquitectura Dual: Remueve glow de mutación
     * Performance: Limpieza completa de memoria
     */
    removeMutationGlow() {
        if (this.mutationGlow) {
            this.container.removeChild(this.mutationGlow);
            this.mutationGlow.destroy();
            this.mutationGlow = null;
        }
        this.mutationGlowStartTime = null;
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
     * Actualiza el símbolo familiar - fixfeatures
     */
    updateFamilySymbol() {
        if (!window.gameVisualId || !this.creature.lineageId) {
            // Si no hay linaje, remover símbolo si existe
            if (this.symbolText) {
                this.container.removeChild(this.symbolText);
                this.symbolText.destroy();
                this.symbolText = null;
            }
            return;
        }
        
        // Solo actualizar si cambió el linaje
        if (this.lastLineageId !== this.creature.lineageId) {
            this.createFamilySymbol();
            this.lastLineageId = this.creature.lineageId;
        }
        
        // Actualizar posición y escala del símbolo
        if (this.symbolText) {
            this.updateSymbolAppearance();
        }
    }

    /**
     * Crea el símbolo familiar - fixfeatures
     */
    createFamilySymbol() {
        // Remover símbolo anterior si existe
        if (this.symbolText) {
            this.container.removeChild(this.symbolText);
            this.symbolText.destroy();
        }
        
        const visualInfo = window.gameVisualId.getVisualInfo(this.creature);
        if (!visualInfo.symbol) return;
        
        // Crear texto del símbolo
        this.symbolText = new PIXI.Text(visualInfo.symbol, {
            fontFamily: 'Arial',
            fontSize: window.gameVisualId.getSymbolSize(this.creature),
            fill: visualInfo.symbolColor,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 1
        });
        
        // Centrar el símbolo
        this.symbolText.anchor.set(0.5, 0.5);
        
        // Posicionar encima de la criatura
        this.updateSymbolAppearance();
        
        // Agregar al container
        this.container.addChild(this.symbolText);
    }

    /**
     * Actualiza la apariencia del símbolo - fixfeatures
     */
    updateSymbolAppearance() {
        if (!this.symbolText || !window.gameVisualId) return;
        
        // Obtener información visual actualizada
        const visualInfo = window.gameVisualId.getVisualInfo(this.creature);
        
        // Actualizar color basado en generación
        this.symbolText.style.fill = visualInfo.symbolColor;
        
        // Actualizar tamaño basado en etapa de crecimiento
        const symbolSize = window.gameVisualId.getSymbolSize(this.creature);
        this.symbolText.style.fontSize = symbolSize;
        
        // Posicionar encima de la criatura
        const scale = this.creature.growth ? this.creature.growth.getScale() : 1.0;
        const offsetY = -(this.baseRadius * scale + symbolSize * 0.5 + 5);
        this.symbolText.position.set(0, offsetY);
        
        // Aplicar escala si la criatura está creciendo
        this.symbolText.scale.set(scale, scale);
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
        // Arquitectura Dual: Limpiar glow de mutación
        this.removeMutationGlow();
        
        // Limpiar símbolo familiar
        if (this.symbolText) {
            this.container.removeChild(this.symbolText);
            this.symbolText.destroy();
            this.symbolText = null;
        }
        
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