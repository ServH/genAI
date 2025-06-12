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

    // Configuración del Mundo - fixfeatures mejorada
    WORLD: {
        CHUNK_SIZE: 500,
        MAX_ENTITIES: 500,
        INITIAL_CREATURES: 10, // 10 criaturas iniciales aleatorias
        WIDTH: 1200,  // Mundo fijo más grande
        HEIGHT: 800, // Mundo fijo más grande
        BORDER_TYPE: 'wall', // 'wall', 'wrap', o 'infinite'
        BORDER_MARGIN: 50 // Margen para rebote suave
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
        INITIAL_COUNT: 10, // 10 criaturas iniciales aleatorias
        MAX_COUNT: 50, // Capacidad máxima para reproducción
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

    // Configuración de Energía - fixfeatures mejorada
    ENERGY: {
        INITIAL: 100,
        DRAIN_RATE: 0.3, // energía por segundo (ajustado para más tiempo de vida)
        MOVEMENT_COST: 0.05, // coste adicional por movimiento (reducido)
        CRITICAL_THRESHOLD: 15, // desvanecimiento de color
        PULSE_THRESHOLD: 5, // pulso visual
        DEATH_THRESHOLD: 0,
        RESPAWN_DELAY: 2000, // ms para respawn automático
        REPRODUCTION_RECOVERY: 20000, // 20s sin poder reproducirse tras nacer
        GROWTH_STAGES: [
            { age: 0, scale: 0.5, name: 'baby' },    // Bebé
            { age: 10, scale: 0.8, name: 'juvenile' },   // Juvenil (más rápido)
            { age: 20, scale: 1.0, name: 'adult' }    // Adulto (más rápido)
        ]
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

    // Configuración de Estados - Fase 2.3 + 3.1 + fixfeatures
    STATES: {
        IDLE_DURATION: 2000, // ms mínimo en idle
        SEEKING_TIMEOUT: 5000, // ms máximo buscando
        EATING_DURATION: 500, // ms consumiendo
        COURTING_DURATION: 3000, // ms de cortejo circular
        MATING_DURATION: 5000, // ms apareándose (aumentado)
        NURSING_DURATION: 30000, // ms cuidando bebé
        STATE_CHANGE_COOLDOWN: 200 // ms entre cambios de estado
    },

    // Configuración de Movimiento
    MOVEMENT: {
        SMOOTHING_FACTOR: 0.1, // suavidad interpolación (0-1)
        MIN_TARGET_DISTANCE: 25, // pixels para "llegar" al objetivo (aumentado para debug)
        DIRECTION_VARIANCE: 0.3 // variación en movimiento browniano
    },

    // Configuración Genética - Fase 3.0 + 3.1 + Sistema de Género
    GENETICS: {
        GENES: {
            SPEED: { min: 0.5, max: 2.0, default: 1.0 },
            SIZE: { min: 0.7, max: 1.3, default: 1.0 },
            VISION: { min: 100, max: 300, default: 200 },
            COLOR_R: { min: 0.0, max: 1.0, default: 0.5 },
            COLOR_G: { min: 0.0, max: 1.0, default: 0.5 },
            COLOR_B: { min: 0.0, max: 1.0, default: 0.5 },
            GENDER: { min: 0, max: 1, default: 0.5 } // 0 = male, 1 = female
        }
    },

    // Configuración de Reproducción - Fase 3.1 + Sistema de Género
    REPRODUCTION: {
        ENERGY_THRESHOLD: 60,        // % energía mínima para reproducirse (reducido)
        SEARCH_RADIUS: 300,          // pixels de radio de búsqueda de pareja
        GENETIC_COMPATIBILITY: 1.0,  // 100% compatibilidad para test rápido
        ENERGY_COST: 30,            // energía consumida por cada padre (reducido)
        COOLDOWN: 3000,             // ms de cooldown entre reproducciones (más rápido)
        OFFSPRING_ENERGY: 100,      // energía inicial de la cría
        MATING_DISTANCE: 40,        // pixels mínimos para aparearse
        COURTING_RADIUS: 60,        // pixels para movimiento circular inicial
        COURTING_MIN_RADIUS: 30,    // pixels radio mínimo al final del cortejo
        COURTING_APPROACH_RATE: 10, // pixels/segundo de acercamiento
        ENERGY_TRANSFER_RATE: 0.3,  // energía/segundo de madre a bebé (reducido)
        
                 // Sistema de Género
        GENDER: {
            MALE_THRESHOLD: 0.5,     // valores < 0.5 = macho
            FEMALE_THRESHOLD: 0.5,   // valores >= 0.5 = hembra
            REJECTION_COOLDOWN: 5000, // ms cooldown para machos rechazados
            MAX_SUITORS: 3,          // máximo machos cortejando una hembra
            FEMALE_MOVEMENT_REDUCTION: 0.4, // 40% velocidad cuando tiene pretendientes
            SELECTION_FACTORS: {     // pesos para selección femenina
                DISTANCE: 0.3,       // 30% cercanía
                SPEED: 0.3,          // 30% velocidad
                SIZE: 0.2,           // 20% tamaño
                VISION: 0.2          // 20% visión
            }
        },
        
        // Modo debug para forzar apareamiento
        DEBUG_MODE: {
            ENERGY_THRESHOLD: 30,        // % energía mínima reducida
            SEARCH_RADIUS: 300,          // radio búsqueda ampliado
            GENETIC_COMPATIBILITY: 1.0,  // 100% compatibilidad
            COOLDOWN: 1000,             // cooldown muy reducido
            MOVEMENT_SPEED_MULTIPLIER: 3 // velocidad hacia pareja x3
        }
    },

    // Configuración de Efectos Visuales - Fase 3.1
    EFFECTS: {
        // Pulsos de búsqueda de pareja
        SEEKING_PULSE: {
            COLOR: 0x00fff0,
            BASE_RADIUS: 30,
            GROWTH: 20,
            ALPHA: 0.5
        },
        SEEKING_PULSE_DURATION: 2000, // 2 segundos

        // Conexiones de apareamiento
        MATING_CONNECTION: {
            COLOR: 0xff00ff,
            ALPHA: 0.8,
            PULSE_SIZE: 5
        },

        // Efectos de nacimiento (simplificados)
        BIRTH: {
            COLOR: 0xffd700,
            DURATION: 1500 // 1.5 segundos
        }
    },

    // Versión del proyecto
    VERSION: "3.1.0-alpha",
    CURRENT_PHASE: "CAJA 3 - Fase 3.1: Reproducción Básica"
};

// Hacer disponible globalmente
window.CONSTANTS = CONSTANTS; 