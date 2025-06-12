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
🔄 GenAI - CAJA 3 Fase 3.1: Sistema de Sincronización Bidireccional COMPLETO
================================================================
🎯 NUEVO FLUJO REPRODUCTIVO CON ESTADO COMMITTED:
1. Macho busca hembra → COURTING
2. Hembra selecciona macho → COMMITTED (nuevo estado)
3. Macho se acerca → Sincronización bidireccional → MATING
4. Verificación completa → Reproducción exitosa

🔄 SINCRONIZACIÓN BIDIRECCIONAL IMPLEMENTADA:
- Estado COMMITTED agregado para hembras comprometidas
- Verificación bidireccional antes de reproducción
- Transición sincronizada a estado MATING
- Limpieza automática de referencias inconsistentes

🛠️ ARQUITECTURA MEJORADA:
- COMMITTED_TIMEOUT: 10s para evitar bloqueos
- synchronizeMatingTransition(): Solo machos inician transición
- checkCommittedProcess(): Hembras esperan al macho seleccionado
- Debug overlay: Muestra "Comprometidas" en tiempo real

🎯 REPRODUCCIÓN ROBUSTA Y FUNCIONAL:
- Estados claros: COURTING → COMMITTED → MATING → NURSING
- Referencias bidireccionales verificadas
- Transiciones sincronizadas
- ¡Sistema completamente funcional!

Controles: D = Debug con estadísticas reproducción, G = Grid, Espacio = Pausa
================================================================
`); 