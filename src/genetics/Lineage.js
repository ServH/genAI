/**
 * GenAI - Sistema de Linajes y Parentesco
 * CAJA 3 - Fase 3.1: fixfeatures
 * 
 * Gestión de relaciones familiares y prevención de incesto
 */

class Lineage {
    constructor() {
        this.families = new Map(); // lineageId -> family data
        this.nextLineageId = 1;
        
        console.log('Lineage: Sistema de parentesco inicializado');
    }

    /**
     * Establece parentesco para una nueva criatura
     */
    setParentage(offspring, mother, father) {
        if (!offspring || !mother || !father) return;
        
        // Establecer padres
        offspring.parents.mother = mother.id;
        offspring.parents.father = father.id;
        
        // Calcular generación (máxima de los padres + 1)
        offspring.generation = Math.max(mother.generation, father.generation) + 1;
        
        // Determinar linaje (usar el de la madre o crear nuevo si es primera generación)
        if (mother.lineageId) {
            offspring.lineageId = mother.lineageId;
        } else if (father.lineageId) {
            offspring.lineageId = father.lineageId;
        } else {
            offspring.lineageId = this.createNewLineage();
        }
        
        // Agregar hijo a los padres
        if (!mother.children.includes(offspring.id)) {
            mother.children.push(offspring.id);
        }
        if (!father.children.includes(offspring.id)) {
            father.children.push(offspring.id);
        }
        
        // Actualizar datos de familia
        this.updateFamilyData(offspring.lineageId, offspring);
        
        console.log(`👨‍👩‍👧‍👦 LINEAGE: ${offspring.id} Gen${offspring.generation} de familia ${offspring.lineageId}`);
        
        if (window.eventBus) {
            window.eventBus.emit('lineage:offspring_registered', {
                offspring: offspring.id,
                mother: mother.id,
                father: father.id,
                generation: offspring.generation,
                lineageId: offspring.lineageId
            });
        }
    }

    /**
     * Verifica si dos criaturas pueden reproducirse (no son familia cercana)
     */
    canMate(creature1, creature2) {
        if (!creature1 || !creature2) return false;
        if (creature1.id === creature2.id) return false;
        
        // Si no tienen linaje, pueden reproducirse
        if (!creature1.lineageId && !creature2.lineageId) return true;
        if (!creature1.lineageId || !creature2.lineageId) return true;
        
        // Si son de familias diferentes, pueden reproducirse
        if (creature1.lineageId !== creature2.lineageId) return true;
        
        // Si son de la misma familia, verificar parentesco cercano
        return !this.areCloseRelatives(creature1, creature2);
    }

    /**
     * Verifica si son parientes cercanos (padres, hijos, hermanos)
     */
    areCloseRelatives(creature1, creature2) {
        // Verificar si uno es padre del otro
        if (creature1.parents.mother === creature2.id || creature1.parents.father === creature2.id) return true;
        if (creature2.parents.mother === creature1.id || creature2.parents.father === creature1.id) return true;
        
        // Verificar si son hermanos (mismos padres)
        if (creature1.parents.mother && creature2.parents.mother && 
            creature1.parents.mother === creature2.parents.mother) return true;
        if (creature1.parents.father && creature2.parents.father && 
            creature1.parents.father === creature2.parents.father) return true;
        
        return false;
    }

    /**
     * Crea un nuevo linaje
     */
    createNewLineage() {
        const lineageId = `L${this.nextLineageId++}`;
        this.families.set(lineageId, {
            id: lineageId,
            founder: null,
            members: [],
            generations: 0,
            created: Date.now()
        });
        return lineageId;
    }

    /**
     * Actualiza datos de familia
     */
    updateFamilyData(lineageId, creature) {
        if (!this.families.has(lineageId)) return;
        
        const family = this.families.get(lineageId);
        
        // Agregar miembro si no existe
        if (!family.members.includes(creature.id)) {
            family.members.push(creature.id);
        }
        
        // Actualizar generaciones máximas
        family.generations = Math.max(family.generations, creature.generation);
        
        // Establecer fundador si es la primera generación
        if (creature.generation === 0 && !family.founder) {
            family.founder = creature.id;
        }
    }

    /**
     * Obtiene información de linaje de una criatura
     */
    getLineageInfo(creature) {
        if (!creature.lineageId) return null;
        
        const family = this.families.get(creature.lineageId);
        if (!family) return null;
        
        return {
            lineageId: creature.lineageId,
            generation: creature.generation,
            family: family,
            parents: creature.parents,
            children: creature.children,
            siblings: this.getSiblings(creature)
        };
    }

    /**
     * Obtiene hermanos de una criatura
     */
    getSiblings(creature) {
        if (!creature.parents.mother && !creature.parents.father) return [];
        
        const siblings = [];
        const family = this.families.get(creature.lineageId);
        if (!family) return siblings;
        
        // Buscar criaturas con los mismos padres
        for (const memberId of family.members) {
            if (memberId === creature.id) continue;
            
            // Aquí necesitaríamos acceso a otras criaturas para comparar padres
            // Por simplicidad, retornamos array vacío por ahora
        }
        
        return siblings;
    }

    /**
     * Obtiene estadísticas de linajes
     */
    getLineageStats() {
        const stats = {
            totalFamilies: this.families.size,
            totalGenerations: 0,
            avgFamilySize: 0,
            oldestFamily: null,
            largestFamily: null
        };
        
        let totalMembers = 0;
        let maxGenerations = 0;
        let maxMembers = 0;
        let oldestTime = Date.now();
        
        for (const [lineageId, family] of this.families) {
            totalMembers += family.members.length;
            
            if (family.generations > maxGenerations) {
                maxGenerations = family.generations;
                stats.oldestFamily = lineageId;
            }
            
            if (family.members.length > maxMembers) {
                maxMembers = family.members.length;
                stats.largestFamily = lineageId;
            }
            
            if (family.created < oldestTime) {
                oldestTime = family.created;
            }
        }
        
        stats.totalGenerations = maxGenerations;
        stats.avgFamilySize = this.families.size > 0 ? totalMembers / this.families.size : 0;
        
        return stats;
    }

    /**
     * Limpia datos de criaturas muertas
     */
    cleanup(deadCreatureIds) {
        for (const [lineageId, family] of this.families) {
            family.members = family.members.filter(id => !deadCreatureIds.includes(id));
            
            // Eliminar familias vacías
            if (family.members.length === 0) {
                this.families.delete(lineageId);
                console.log(`🏠 LINEAGE: Familia ${lineageId} eliminada (sin miembros)`);
            }
        }
    }

    /**
     * Destruye el sistema
     */
    destroy() {
        this.families.clear();
        console.log('Lineage: Sistema destruido');
    }
}

// Hacer disponible globalmente
window.Lineage = Lineage; 