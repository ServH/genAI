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
🧬 GenAI - CAJA 3 Fase 3.2: MUTACIONES (Arquitectura Dual) ✅
================================================================
🎯 SISTEMA DE MUTACIONES IMPLEMENTADO:
- 10% probabilidad de mutación por gen
- Variación ±20% del valor actual
- Glow verde que se desvanece en 5 segundos
- Límites genéticos para evitar valores extremos

🏗️ ARQUITECTURA DUAL APLICADA:
✅ Funcionalidad Completa:
  - Mutations.js: Sistema completo de mutaciones
  - Glow visual verde brillante
  - Integración en reproducción sexual
  - Herencia + mutación en un solo paso

✅ Performance Optimizada:
  - Cache de mutaciones (evita recálculos)
  - Throttling de mutaciones (100ms cooldown)
  - Graphics simples (sin efectos complejos)
  - Limpieza automática de memoria

🔬 EVOLUCIÓN VISIBLE:
- Criaturas mutadas brillan en verde al nacer
- Genes pueden evolucionar gradualmente
- Diversidad genética aumenta naturalmente
- Presión selectiva + mutación = evolución

🎮 EXPERIENCIA MEJORADA:
- Mutaciones visualmente obvias
- Sistema simple pero efectivo
- Sin impacto en performance
- Base para evolución compleja

Controles: D = Debug, G = Grid, Espacio = Pausa
¡Observa las criaturas verdes brillantes - son mutantes!
================================================================
`); 