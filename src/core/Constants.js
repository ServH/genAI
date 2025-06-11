/**
 * GenAI - Constantes Globales
 * CAJA 1 - Fase 1.0: Setup Inicial
 * 
 * Configuración central del proyecto
 */

const CONSTANTS = {
    // Configuración del Canvas
    CANVAS: {
        BACKGROUND_COLOR: 0x0a0e27,
        TARGET_FPS: 60,
        ANTIALIAS: true,
        RESOLUTION: window.devicePixelRatio || 1
    },

    // Configuración del Mundo
    WORLD: {
        CHUNK_SIZE: 500,
        MAX_ENTITIES: 500,
        INITIAL_CREATURES: 10
    },

    // Configuración de Debug
    DEBUG: {
        SHOW_FPS: true,
        SHOW_ENTITY_COUNT: true,
        UPDATE_INTERVAL: 100 // ms
    },

    // Colores del Proyecto
    COLORS: {
        BACKGROUND: 0x0a0e27,
        CREATURE_CYAN: 0x00fff0,
        CREATURE_PINK: 0xff00ff,
        CREATURE_YELLOW: 0xffff00,
        FOOD_GOLD: 0xffd700,
        DEBUG_TEXT: 0x00fff0
    },

    // Configuración de Física
    PHYSICS: {
        GRAVITY: 0,
        FRICTION: 0.98,
        MAX_VELOCITY: 5
    },

    // Configuración de Criaturas (para fases futuras)
    CREATURES: {
        INITIAL_ENERGY: 100,
        ENERGY_DECAY_RATE: 1, // por segundo
        VISION_RANGE: 200,
        VISION_ANGLE: 120, // grados
        REPRODUCTION_THRESHOLD: 80
    },

    // Versión del proyecto
    VERSION: "1.0.0-alpha",
    CURRENT_PHASE: "CAJA 1 - Fase 1.0"
};

// Hacer disponible globalmente
window.CONSTANTS = CONSTANTS; 