/**
 * GenAI - Controles del Motor
 * CAJA 1 - Fase 1.1: Sistema Core
 * 
 * Maneja controles de teclado y eventos del motor
 */

class EngineControls {
    constructor(engineInstance) {
        this.engine = engineInstance;
        this.setupControls();
    }

    /**
     * Configura controles básicos
     */
    setupControls() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
    }

    /**
     * Maneja eventos de teclado
     */
    handleKeyDown(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                if (window.gameTime) {
                    gameTime.togglePause();
                }
                break;
                
            case 'KeyD':
                if (window.debugOverlay) {
                    debugOverlay.toggle();
                }
                break;
        }
    }

    /**
     * Limpia recursos
     */
    destroy() {
        // Los event listeners se limpian automáticamente
        console.log('EngineControls: Destruido');
    }
}

// Hacer disponible globalmente
window.EngineControls = EngineControls; 