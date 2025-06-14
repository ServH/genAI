/**
 * GenAI - ReproductionBehavior
 * CAJA OPTIMIZACIÓN - Fase O.1
 * Maneja búsqueda de pareja, cortejo, committed, mating y nursing (compactado ≤100 líneas)
 */

class ReproductionBehavior {
    constructor(creature, vision, states, movement) {
        this.c = creature;
        this.v = vision;
        this.s = states;
        this.m = movement;
    }

    update(delta) {
        if (window.profiler) profiler.start('ReproductionBehavior');
        const st = this.s.getCurrentState();
        // IDLE: buscar madre o pareja
        if (st === CREATURE_STATES.IDLE) {
            if (this._followMother()) return;
            if (this.c.energy >= CONSTANTS.REPRODUCTION.ENERGY_THRESHOLD) {
                this._searchMate();
            }
        }
        // Estados secuenciales
        if (st === CREATURE_STATES.COURTING) this._courting(delta);
        if (st === CREATURE_STATES.COMMITTED) this._committed();
        if (st === CREATURE_STATES.MATING) this._mating();
        if (st === CREATURE_STATES.NURSING) this._nursing(delta);
        if (window.profiler) profiler.end('ReproductionBehavior');
    }

    /* ----------------- PRIVATE ---------------------------------------- */
    _searchMate() {
        if (!this.c.dna?.isMale() || !window.gameReproduction) return;
        if (!gameReproduction.canReproduce(this.c)) return;
        const female = gameReproduction.findMate(this.c, window.gameEngine.creatureManager.getAllCreatures());
        if (female) {
            this.s.setState(CREATURE_STATES.COURTING, female);
            window.eventBus?.emit('creature:mate_found', {id:this.c.id,mateId:female.id});
            window.gameEffects?.startSeekingPulse(this.c);
        }
    }

    _courting(dt) {
        const mate = this.s.getTarget();
        if (!mate?.isAlive) { this.s.setState(CREATURE_STATES.IDLE); return; }
        const dist = this._dist(mate);
        const md = CONSTANTS.REPRODUCTION.MATING_DISTANCE;
        if (dist <= md) { this._syncMating(mate); return; }
        this.m.setCourtingRadius((CONSTANTS.REPRODUCTION.COURTING_RADIUS||80));
        window.gameEffects?.startMatingConnection(this.c, mate);
    }

    _committed() {
        const male = this.s.getTarget();
        const ok = male?.behavior?.states?.isInState(CREATURE_STATES.COURTING) &&
                   male.behavior.states.getTarget()?.id === this.c.id;
        if (!ok) this.s.setState(CREATURE_STATES.IDLE);
    }

    _mating() {
        const partner = this.s.getTarget();
        if (!partner?.isAlive) { this.s.setState(CREATURE_STATES.IDLE); return; }
        const dist=this._dist(partner);
        if (dist>CONSTANTS.REPRODUCTION.MATING_DISTANCE) return;
        if (!partner.behavior.states.isInState(CREATURE_STATES.MATING)) { this._syncMating(partner); return; }
        const male=this.c.dna.isMale()?this.c:partner;
        const female=this.c.dna.isFemale()?this.c:partner;
        const info=gameReproduction.reproduce(male,female);
        if (!info) { this.s.setState(CREATURE_STATES.IDLE); return; }
        const baby=window.gameEngine.creatureManager.spawnCreatureWithDNA(info.x,info.y,info.dna);
        if (baby) {
            window.gameLineage?.setParentage(baby,male,female);
            window.gameVisualId?.getVisualInfo(baby); // fuerza init
            window.gameEffects?.createBirthEffect(info.x,info.y);
            eventBus?.emit('creature:offspring_born',{parent1:male.id,parent2:female.id,offspring:baby.id});
            if (this.c.dna.isFemale()) this.s.setState(CREATURE_STATES.NURSING,baby);
            else this.s.setState(CREATURE_STATES.IDLE);
        }
    }

    _nursing(dt) {
        const baby=this.s.getTarget();
        if (!baby?.isAlive||baby.parents?.mother!==this.c.id){this.s.setState(CREATURE_STATES.IDLE);return;}
        const rate=CONSTANTS.REPRODUCTION.ENERGY_TRANSFER_RATE||0.3;
        const e=rate*dt;
        if (this.c.energy>e+15){this.c.energySystem.consume(e);baby.energySystem.restore(e);}else{this.s.setState(CREATURE_STATES.IDLE);}    }

    _syncMating(mate){ if(this.c.dna.isMale()) gameReproduction.synchronizeMatingTransition(this.c,mate);}    

    _followMother(){ if(!this.c.parents?.mother) return false; const mom=window.gameEngine.creatureManager.getAllCreatures().find(cr=>cr.id===this.c.parents.mother&&cr.isAlive); if(mom){this.s.setState(CREATURE_STATES.SEEKING,mom);return true;} return false; }

    _dist(t){const dx=this.c.x-t.x,dy=this.c.y-t.y;return Math.hypot(dx,dy);}    

    destroy(){this.c=this.v=this.s=this.m=null;}
}

window.ReproductionBehavior = ReproductionBehavior; 