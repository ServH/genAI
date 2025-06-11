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

    // Configuración de Recursos
    RESOURCES: {
        MAX_FOOD: 20,
        SPAWN_INTERVAL: 2000, // ms - cada 2 segundos
        ENERGY_VALUE: 30, // energía que restaura cada comida
        DETECTION_RADIUS: 50, // px - radio de detección
        FOOD_RADIUS_MIN: 8,
        FOOD_RADIUS_MAX: 12,
        INITIAL_FOOD_RATIO: 0.3 // 30% del máximo al inicio
    },

    // Configuración de Visión
    VISION: {
        ANGLE: 120, // grados del cono de visión
        RANGE: 200, // pixels de alcance
        DEBUG_SHOW: false // mostrar cono en debug
    },

    // Configuración de Estados - Fase 2.3 + 3.1
    STATES: {
        IDLE_DURATION: 2000, // ms mínimo en idle
        SEEKING_TIMEOUT: 5000, // ms máximo buscando
        EATING_DURATION: 500, // ms consumiendo
        MATING_DURATION: 2000, // ms apareándose
        STATE_CHANGE_COOLDOWN: 200 // ms entre cambios de estado
    },

    // Configuración de Movimiento
    MOVEMENT: {
        SMOOTHING_FACTOR: 0.1, // suavidad interpolación (0-1)
        MIN_TARGET_DISTANCE: 25, // pixels para "llegar" al objetivo (aumentado para debug)
        DIRECTION_VARIANCE: 0.3 // variación en movimiento browniano
    },

    // Configuración Genética - Fase 3.0 + 3.1
    GENETICS: {
        GENES: {
            SPEED: { min: 0.5, max: 2.0, default: 1.0 },
            SIZE: { min: 0.7, max: 1.3, default: 1.0 },
            VISION: { min: 100, max: 300, default: 200 },
            COLOR_R: { min: 0.0, max: 1.0, default: 0.5 },
            COLOR_G: { min: 0.0, max: 1.0, default: 0.5 },
            COLOR_B: { min: 0.0, max: 1.0, default: 0.5 }
        }
    },

    // Configuración de Reproducción - Fase 3.1
    REPRODUCTION: {
        ENERGY_THRESHOLD: 80,        // % energía mínima para reproducirse
        SEARCH_RADIUS: 150,          // pixels para buscar pareja
        GENETIC_COMPATIBILITY: 0.7,  // máxima distancia genética permitida
        ENERGY_COST: 40,            // energía que cuesta a cada padre
        COOLDOWN: 10000,            // ms antes de poder reproducirse de nuevo
        OFFSPRING_ENERGY: 100,      // energía inicial de la cría
        MATING_DISTANCE: 30         // pixels para aparearse
    },

    // Versión del proyecto
    VERSION: "3.1.0-alpha",
    CURRENT_PHASE: "CAJA 3 - Fase 3.1: Reproducción Básica"
};

// Hacer disponible globalmente
window.CONSTANTS = CONSTANTS; 