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
GenAI - Simulador de Vida Emergente
===================================
Fase: ${CONSTANTS.CURRENT_PHASE} - OPTIMIZADO PARA OBSERVACIÓN
Objetivo: Sistemas Fundamentales para Evolución
- Población inicial: 50 criaturas (vs 10 anterior)
- Reproducción acelerada: Umbral 60% energía, cooldown 3s
- Crecimiento rápido: Bebé→Juvenil 10s, Juvenil→Adulto 20s
- Energía balanceada: Drenaje 0.3/s, vida ~333s promedio
- Símbolos familiares: Visualización completa de linajes
- Debug completo: Paneles población + linajes en tiempo real
¡Ahora podrás ver bebés, crecimiento y símbolos familiares!
Controles: D = Debug, G = Grid, Espacio = Pausa, Mouse = Cámara
===================================
`); 