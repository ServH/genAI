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
        BACKGROUND: '#0a0e27',
        BACKGROUND_INNER: '#1a1e37',
        CREATURE_CYAN: '#00fff0',
        CREATURE_PINK: '#ff00ff',
        CREATURE_YELLOW: '#ffff00',
        FOOD_GOLD: '#ffd700',
        DEBUG_TEXT: '#00fff0'
    },

    // Configuración de Cámara
    CAMERA: {
        MIN_ZOOM: 0.1,
        MAX_ZOOM: 5.0,
        ZOOM_SPEED: 5.0,
        PAN_SPEED: 1.0
    },

    // Configuración de Grid
    GRID: {
        SIZE: 100,
        COLOR: '#ffffff',
        ALPHA: 0.1
    },

    // Configuración de Física
    PHYSICS: {
        GRAVITY: 0,
        FRICTION: 0.98,
        MAX_VELOCITY: 5
    },

    // Configuración de Criaturas
    CREATURES: {
        INITIAL_COUNT: 10,
        MAX_COUNT: 50,
        BASE_RADIUS: 20,
        MIN_SPEED: 20, // px/s
        MAX_SPEED: 80, // px/s
        DEFORM_POINTS: 8,
        DEFORM_AMOUNT: 0.3,
        WORLD_MARGIN: 50,
        // Para fases futuras
        INITIAL_ENERGY: 100,
        ENERGY_DECAY_RATE: 1,
        VISION_RANGE: 200,
        VISION_ANGLE: 120,
        REPRODUCTION_THRESHOLD: 80
    },

    // Configuración de Energía
    ENERGY: {
        INITIAL: 100,
        DRAIN_RATE: 1.0, // energía por segundo
        CRITICAL_THRESHOLD: 15, // desvanecimiento de color
        PULSE_THRESHOLD: 5, // pulso visual
        DEATH_THRESHOLD: 0,
        RESPAWN_DELAY: 2000 // ms para respawn automático
    },

    // Versión del proyecto
    VERSION: "2.0.0-alpha",
    CURRENT_PHASE: "CAJA 2 - Fase 2.1: Energía y Muerte"
};

// Hacer disponible globalmente
window.CONSTANTS = CONSTANTS; 