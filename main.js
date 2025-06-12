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
🧬 GenAI - CAJA 3 Fase 3.1: Sistema de Género COMPLETADO
========================================================
✅ SISTEMA DE GÉNERO IMPLEMENTADO:
- Género en ADN: 0=macho, 1=hembra
- 5 machos + 5 hembras fundadores balanceados
- Solo machos buscan pareja activamente
- Hembras seleccionan entre pretendientes
- Selección por genes superiores (velocidad, tamaño, visión)
- Cooldown para machos rechazados (5s)
- Máximo 3 pretendientes por hembra

🎮 COMPORTAMIENTOS OBSERVABLES:
- Machos cortejan a hembras cercanas
- Hembras evalúan y eligen al mejor macho
- Solo parejas seleccionadas pueden reproducirse
- Hembras cuidan bebés (NURSING), machos vuelven a buscar

Controles: D = Debug con estadísticas género, G = Grid, Espacio = Pausa
========================================================
`); 