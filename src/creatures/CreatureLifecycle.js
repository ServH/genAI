/**
 * GenAI - Gestión del Ciclo de Vida de Criaturas
 * CAJA 2 - Fase 2.1: Energía y Muerte
 * 
 * Gestión de spawn, muerte, respawn y limpieza
 */

class CreatureLifecycle {
    constructor(manager) {
        this.manager = manager;
        this.factory = null;
        this.lastLoggedCount = 0; // Para evitar spam de logs
        this.spawnStats = {
            totalSpawned: 0,
            totalDied: 0,
            totalRespawned: 0
        };
    }
    
    /**
     * Establece la factory de criaturas
     */
    setFactory(factory) {
        this.factory = factory;
    }
    
    /**
     * Spawn inicial de criaturas
     */
    async spawnInitialCreatures(count) {
        console.log(`CreatureLifecycle: Spawning ${count} criaturas iniciales...`);
        
        for (let i = 0; i < count; i++) {
            const creature = this.factory.createCreature();
            this.manager.addCreature(creature);
            this.spawnStats.totalSpawned++;
            
            // Pequeña pausa para evitar bloqueo
            if (i % 3 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        console.log(`CreatureLifecycle: ${count} criaturas spawneadas`);
        
        if (window.eventBus) {
            eventBus.emit('creatures:spawned', {
                count: count,
                initial: true,
                totalSpawned: this.spawnStats.totalSpawned
            });
        }
    }
    
    /**
     * Verifica si necesita respawn automático - DESHABILITADO para permitir evolución
     * Solo respawnea si la población cae a 0 para evitar extinción total
     */
    checkRespawn() {
        const aliveCount = this.manager.getAliveCount();
        
        // Solo respawnear si hay extinción total (0 criaturas)
        if (aliveCount === 0) {
            const emergencySpawn = 2; // Spawn mínimo para recuperación
            console.log(`CreatureLifecycle: ¡EXTINCIÓN! Respawning ${emergencySpawn} criaturas de emergencia`);
            
            for (let i = 0; i < emergencySpawn; i++) {
                const creature = this.factory.createCreature();
                if (creature) {
                    this.manager.addCreature(creature);
                    this.spawnStats.totalSpawned++;
                    this.spawnStats.totalRespawned++;
                }
            }
            
            if (window.eventBus) {
                eventBus.emit('creatures:emergency_respawn', {
                    spawned: emergencySpawn,
                    aliveCount: this.manager.getAliveCount(),
                    totalRespawned: this.spawnStats.totalRespawned
                });
            }
        }
        
        // Log para debug: mostrar población actual sin intervenir
        if (aliveCount > 0 && aliveCount !== this.lastLoggedCount) {
            console.log(`CreatureLifecycle: Población natural: ${aliveCount} criaturas (máx: ${this.manager.maxCreatures})`);
            this.lastLoggedCount = aliveCount;
        }
    }
    
    /**
     * Limpia criaturas muertas
     */
    cleanup() {
        const deadCreatures = [];
        
        for (const [id, creature] of this.manager.creatures) {
            if (!creature.isAlive) {
                deadCreatures.push(id);
            }
        }
        
        for (const id of deadCreatures) {
            this.manager.removeCreature(id);
            this.spawnStats.totalDied++;
        }
        
        if (deadCreatures.length > 0) {
            console.log(`CreatureLifecycle: ${deadCreatures.length} criaturas muertas limpiadas`);
            
            if (window.eventBus) {
                eventBus.emit('creatures:cleaned', {
                    count: deadCreatures.length,
                    totalDied: this.spawnStats.totalDied
                });
            }
        }
        
        return deadCreatures.length;
    }
    
    /**
     * Spawn manual de una criatura
     */
    spawnCreature(x, y) {
        if (!this.factory) return null;
        
        const creature = this.factory.createCreature(x, y);
        if (creature && this.manager.addCreature(creature)) {
            this.spawnStats.totalSpawned++;
            
            if (window.eventBus) {
                eventBus.emit('creature:manually_spawned', {
                    id: creature.id,
                    x: x,
                    y: y
                });
            }
            
            return creature;
        }
        
        return null;
    }
    
    /**
     * Mata una criatura específica
     */
    killCreature(creatureId, cause = 'manual') {
        const creature = this.manager.getCreature(creatureId);
        if (creature && creature.isAlive) {
            creature.die(cause);
            return true;
        }
        return false;
    }
    
    /**
     * Obtiene estadísticas del ciclo de vida
     */
    getStats() {
        return {
            ...this.spawnStats,
            aliveCount: this.manager.getAliveCount(),
            totalCount: this.manager.getCreatureCount(),
            survivalRate: this.spawnStats.totalSpawned > 0 ? 
                (this.spawnStats.totalSpawned - this.spawnStats.totalDied) / this.spawnStats.totalSpawned : 0
        };
    }
    
    /**
     * Reinicia las estadísticas
     */
    resetStats() {
        this.spawnStats = {
            totalSpawned: 0,
            totalDied: 0,
            totalRespawned: 0
        };
    }
    
    /**
     * Limpia el sistema
     */
    destroy() {
        this.manager = null;
        this.factory = null;
        this.resetStats();
    }
}

// Hacer disponible globalmente
window.CreatureLifecycle = CreatureLifecycle; 