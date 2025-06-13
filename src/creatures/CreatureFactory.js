/**
 * GenAI - Factory de Criaturas
 * CAJA 2 - Fase 2.0: Criatura Mínima
 * 
 * Sistema de creación y spawn de criaturas
 */

class CreatureFactory {
    constructor() {
        // Configuración de spawn
        this.spawnMargin = CONSTANTS.CREATURES.WORLD_MARGIN + CONSTANTS.CREATURES.BASE_RADIUS;
        this.maxAttempts = 50; // Intentos máximos para encontrar posición válida
        
        // Estadísticas
        this.creaturesCreated = 0;
        this.lastSpawnTime = 0;
        
        console.log('CreatureFactory: Factory inicializada');
        
        if (window.eventBus) {
            eventBus.emit('factory:initialized');
        }
    }

    /**
     * Crea una nueva criatura en posición específica o aleatoria
     */
    createCreature(x = null, y = null) {
        let spawnX, spawnY;
        
        if (x !== null && y !== null) {
            // Usar posición específica si es válida
            if (this.isValidPosition(x, y)) {
                spawnX = x;
                spawnY = y;
            } else {
                console.warn('CreatureFactory: Posición específica inválida, usando aleatoria');
                const pos = this.getRandomSpawnPosition();
                spawnX = pos.x;
                spawnY = pos.y;
            }
        } else {
            // Generar posición aleatoria
            const pos = this.getRandomSpawnPosition();
            spawnX = pos.x;
            spawnY = pos.y;
        }
        
        // Crear ADN para la criatura - Sistema de Género
        let dna;
        if (window.gameFounderGenetics && window.gameFounderGenetics.hasFoundersRemaining()) {
            // Usar sistema de fundadores para los primeros 10
            dna = window.gameFounderGenetics.generateFounderDNA();
        } else {
            // DNA aleatorio normal para descendencia
            dna = new DNA();
        }
        
        // Crear criatura con ADN
        const creature = new Creature(spawnX, spawnY, dna);
        
        // Aplicar efectos genéticos
        Genes.applyToCreature(creature, dna);
        
        // Actualizar estadísticas
        this.creaturesCreated++;
        this.lastSpawnTime = performance.now();
        
        const gender = dna.getGender();
        console.log(`CreatureFactory: Criatura ${creature.id} (${gender}) creada en (${Math.round(spawnX)}, ${Math.round(spawnY)})`);
        
        if (window.eventBus) {
            eventBus.emit('factory:creatureSpawned', {
                id: creature.id,
                x: spawnX,
                y: spawnY,
                gender: gender,
                total: this.creaturesCreated
            });
            
            // Emitir evento de nacimiento para estadísticas
            eventBus.emit('creature:born', {
                creature: creature
            });
        }
        
        return creature;
    }

    /**
     * Obtiene una posición aleatoria válida para spawn
     */
    getRandomSpawnPosition() {
        const worldWidth = window.innerWidth;
        const worldHeight = window.innerHeight;
        
        for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
            const x = this.spawnMargin + Math.random() * (worldWidth - this.spawnMargin * 2);
            const y = this.spawnMargin + Math.random() * (worldHeight - this.spawnMargin * 2);
            
            if (this.isValidPosition(x, y)) {
                return { x, y };
            }
        }
        
        // Si no se encuentra posición válida, usar centro de pantalla
        console.warn('CreatureFactory: No se encontró posición válida, usando centro');
        return {
            x: worldWidth / 2,
            y: worldHeight / 2
        };
    }

    /**
     * Valida si una posición es válida para spawn
     */
    isValidPosition(x, y) {
        const worldWidth = window.innerWidth;
        const worldHeight = window.innerHeight;
        
        // Verificar límites básicos
        if (x < this.spawnMargin || x > worldWidth - this.spawnMargin ||
            y < this.spawnMargin || y > worldHeight - this.spawnMargin) {
            return false;
        }
        
        // TODO: Fase futura - verificar colisiones con otras criaturas
        // TODO: Fase futura - verificar zonas prohibidas
        
        return true;
    }

    /**
     * Crea una criatura con DNA específico - Fase 3.1
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {DNA} dna - DNA específico para la criatura
     * @returns {Creature} - Nueva criatura con DNA heredado
     */
    createCreatureWithDNA(x, y, dna) {
        // Validar posición
        if (!this.isValidPosition(x, y)) {
            console.warn('CreatureFactory: Posición inválida para criatura con DNA, ajustando');
            const pos = this.getRandomSpawnPosition();
            x = pos.x;
            y = pos.y;
        }
        
        // Crear criatura con DNA específico
        const creature = new Creature(x, y, dna);
        
        // Aplicar efectos genéticos del DNA heredado
        Genes.applyToCreature(creature, dna);
        
        // Actualizar estadísticas
        this.creaturesCreated++;
        this.lastSpawnTime = performance.now();
        
        console.log(`CreatureFactory: Criatura ${creature.id} creada con DNA heredado en (${Math.round(x)}, ${Math.round(y)})`);
        
        if (window.eventBus) {
            eventBus.emit('factory:creatureWithDNASpawned', {
                id: creature.id,
                x: x,
                y: y,
                dna: dna,
                total: this.creaturesCreated
            });
            
            // Emitir evento de nacimiento para estadísticas
            eventBus.emit('creature:born', {
                creature: creature
            });
        }
        
        return creature;
    }

    /**
     * Crea múltiples criaturas de una vez
     */
    createMultipleCreatures(count) {
        const creatures = [];
        
        for (let i = 0; i < count; i++) {
            const creature = this.createCreature();
            creatures.push(creature);
        }
        
        console.log(`CreatureFactory: ${count} criaturas creadas en lote`);
        
        if (window.eventBus) {
            eventBus.emit('factory:batchSpawned', {
                count: count,
                total: this.creaturesCreated
            });
        }
        
        return creatures;
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
     * Obtiene un tamaño aleatorio dentro del rango
     */
    getRandomSize() {
        const baseRadius = CONSTANTS.CREATURES.BASE_RADIUS;
        const variation = 0.4; // ±40% de variación
        return baseRadius * (0.8 + Math.random() * variation);
    }

    /**
     * Obtiene estadísticas del factory
     */
    getStats() {
        return {
            creaturesCreated: this.creaturesCreated,
            lastSpawnTime: this.lastSpawnTime,
            spawnMargin: this.spawnMargin,
            worldWidth: window.innerWidth,
            worldHeight: window.innerHeight
        };
    }

    /**
     * Reinicia las estadísticas
     */
    resetStats() {
        this.creaturesCreated = 0;
        this.lastSpawnTime = 0;
        
        console.log('CreatureFactory: Estadísticas reiniciadas');
        
        if (window.eventBus) {
            eventBus.emit('factory:statsReset');
        }
    }
}

// Hacer disponible globalmente
window.CreatureFactory = CreatureFactory; 