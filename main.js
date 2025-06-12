/**
 * GenAI - Archivo Principal
 * CAJA 1 - Fase 1.0: Setup Inicial
 * 
 * Punto de entrada del juego
 */

// El engine se crea automáticamente en Engine.js

/**
 * Inicializa el juego cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando GenAI...');
    console.log(`Versión: ${CONSTANTS.VERSION}`);
    console.log(`Fase: ${CONSTANTS.CURRENT_PHASE}`);
    
    // El engine se inicializa automáticamente
    console.log('GenAI iniciado exitosamente');
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
                <h2>Error</h2>
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
    if (window.gameEngine) {
        window.gameEngine.destroy();
        console.log('Recursos limpiados');
    }
});

/**
 * Maneja errores no capturados
 */
window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
});

/**
 * Maneja promesas rechazadas
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada:', event.reason);
});

// Información de debug en consola
console.log(`
🔄 GenAI - CAJA 3 Fase 3.1: Sincronización Bidireccional de Reproducción
================================================================
🚨 PROBLEMA CRÍTICO SOLUCIONADO:
- Referencias perdidas: Criaturas llegaban a MATING pero perdían pareja
- Bucles infinitos: Estados MATING "sin pareja" causaban loops
- Falta sincronización: Una criatura tenía target pero la otra no

🔄 SINCRONIZACIÓN BIDIRECCIONAL IMPLEMENTADA:
- Verificación completa antes de reproducción
- Ambas criaturas deben reconocerse mutuamente
- Transición sincronizada a estado MATING
- Limpieza automática de referencias inconsistentes

🛠️ CORRECCIONES TÉCNICAS:
- attemptReproduction(): Verificación bidireccional completa
- synchronizeMatingTransition(): Cambio simultáneo a MATING
- clearMatingReferences(): Reset automático de estados inconsistentes
- Logs diagnósticos: Información clara de sincronización

🎯 REPRODUCCIÓN AHORA FUNCIONAL:
- Referencias bidireccionales verificadas
- Transiciones sincronizadas
- Estados consistentes
- ¡Nacimientos finalmente posibles!

Controles: D = Debug con estadísticas reproducción, G = Grid, Espacio = Pausa
================================================================
`); 