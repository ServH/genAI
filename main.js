/**
 * GenAI - Archivo Principal
 * CAJA 1 - Fase 1.0: Setup Inicial
 * 
 * Punto de entrada del juego
 */

// Variable global del engine
let gameEngine = null;

/**
 * Inicializa el juego cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Iniciando GenAI...');
    console.log(`📦 Versión: ${CONSTANTS.VERSION}`);
    console.log(`🔧 Fase: ${CONSTANTS.CURRENT_PHASE}`);
    
    // Verificar que PixiJS esté disponible
    if (typeof PIXI === 'undefined') {
        console.error('❌ PixiJS no está disponible');
        showError('Error: PixiJS no se pudo cargar');
        return;
    }
    
    console.log(`✅ PixiJS ${PIXI.VERSION} cargado correctamente`);
    
    // Inicializar el engine
    try {
        gameEngine = new Engine();
        console.log('🚀 GenAI iniciado exitosamente');
    } catch (error) {
        console.error('❌ Error iniciando el juego:', error);
        showError(`Error iniciando el juego: ${error.message}`);
    }
});

/**
 * Maneja errores críticos mostrándolos al usuario
 */
function showError(message) {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #ff4444;
            font-family: 'Courier New', monospace;
            text-align: center;
            background: #0a0e27;
        ">
            <div>
                <h2>⚠️ Error</h2>
                <p>${message}</p>
                <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                    Revisa la consola para más detalles
                </p>
            </div>
        </div>
    `;
}

/**
 * Limpia recursos al cerrar la página
 */
window.addEventListener('beforeunload', () => {
    if (gameEngine) {
        gameEngine.destroy();
        console.log('🧹 Recursos limpiados');
    }
});

/**
 * Maneja errores no capturados
 */
window.addEventListener('error', (event) => {
    console.error('❌ Error no capturado:', event.error);
});

/**
 * Maneja promesas rechazadas
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promesa rechazada:', event.reason);
});

// Información de debug en consola
console.log(`
🧬 GenAI - Simulador de Vida Emergente
═══════════════════════════════════════
📊 Fase: ${CONSTANTS.CURRENT_PHASE}
🎯 Objetivo: Setup inicial con PixiJS
⌨️  Controles: D = Debug overlay
═══════════════════════════════════════
`); 