# 🧬 GenAI - Documento de Contexto Completo para Cursor

## 📋 Resumen del Proyecto

**GenAI** es un simulador de vida emergente donde criaturas geométricas evolucionan, se reproducen y desarrollan comportamientos complejos. El jugador actúa como un "dios observador" que puede influir sutilmente en este mundo. Construido con JavaScript vanilla y PixiJS 8.x, enfocado en la belleza visual minimalista y la emergencia de comportamientos complejos desde reglas simples.

## 🎯 Visión Core

- **Emoción principal**: Narrativa emergente - ver civilizaciones únicas emerger en cada partida
- **Estilo visual**: Formas orgánicas suaves, paleta bioluminiscente, minimalista pero expresivo
- **Gameplay**: Observación + intervención sutil, no hay objetivos fijos
- **Técnico**: 500 criaturas máximo, 60fps constantes, mundo procedural infinito

## 🎨 Especificaciones Visuales

### Paleta de Colores
- **Fondo**: #0a0e27 (azul muy oscuro)
- **Criaturas**: Gradientes suaves
  - Cyan a verde agua (#00fff0 → #00ffa0)
  - Rosa a violeta (#ff00ff → #8000ff)  
  - Amarillo a naranja (#ffff00 → #ff8000)
- **Comida**: Partículas doradas (#ffd700)
- **Efectos**: Glows sutiles, transparencias

### Estilo de Criaturas
- Base circular deformada con sin/cos
- Organelos orbitando
- Membranas semi-transparentes
- Núcleo interno visible
- "Cilios" que ondulan según movimiento

## 🧬 Sistema de Juego

### Genética
- **Fase 1**: velocidad, tamaño, visión, color, fuerza
- **Fase 2**: agresividad, curiosidad, preferencias, tasa reproductiva
- **Fase 3**: comunicación, patrones sociales, especialización

### Comportamientos Objetivo
- Manadas y grupos sociales
- Depredación y simbiosis
- Territorialidad
- Comunicación por pulsos de luz
- Cultura y "lenguaje" emergente

### Poderes del Jugador
- Crear comida
- Mover criaturas
- Crear zonas seguras
- Influir sutilmente en evolución
- Observar linajes y estadísticas

## 📁 Arquitectura del Proyecto

```
/genai
├── /src
│   ├── /core
│   │   ├── Engine.js          # Motor principal, gameloop
│   │   ├── EventBus.js        # Sistema de eventos global
│   │   ├── Time.js            # DeltaTime y control temporal
│   │   └── Constants.js       # Configuración global
│   │
│   ├── /creatures
│   │   ├── Creature.js        # Clase base entidad viva
│   │   ├── CreatureFactory.js # Creación con genes
│   │   ├── CreaturePool.js    # Optimización de memoria
│   │   └── Behaviors.js       # Comportamientos modulares
│   │
│   ├── /genetics
│   │   ├── DNA.js             # Estructura del ADN
│   │   ├── Genes.js           # Definiciones genéticas
│   │   ├── Mutations.js       # Sistema de mutación
│   │   └── Inheritance.js     # Mezcla y herencia
│   │
│   ├── /environment
│   │   ├── World.js           # Mundo infinito procedural
│   │   ├── Chunk.js           # Sistema de chunks 
│   │   ├── Zones.js           # Zonas con propiedades
│   │   └── Resources.js       # Comida y recursos
│   │
│   ├── /systems
│   │   ├── Physics.js         # Colisiones simples
│   │   ├── Energy.js          # Hambre y muerte
│   │   ├── Reproduction.js    # Sistema reproductivo
│   │   ├── Communication.js   # Pulsos y señales
│   │   └── Evolution.js       # Tracking generacional
│   │
│   ├── /player
│   │   ├── GodMode.js         # Acciones del jugador
│   │   ├── Controls.js        # Mouse y teclado
│   │   └── Camera.js          # Movimiento de cámara
│   │
│   ├── /rendering
│   │   ├── Renderer.js        # Wrapper de PixiJS
│   │   ├── CreatureSprite.js  # Visual de criaturas
│   │   ├── Effects.js         # Partículas y efectos
│   │   └── UI.js              # Interface usuario
│   │
│   ├── /debug
│   │   ├── DebugOverlay.js    # Info de debug (tecla D)
│   │   ├── Inspector.js       # Inspección de entidades
│   │   └── Performance.js     # Monitor FPS
│   │
│   └── /utils
│       ├── Math.js            # Helpers matemáticos
│       ├── Random.js          # RNG determinista
│       ├── Spatial.js         # Grid espacial
│       └── Pool.js            # Object pooling
│
├── index.html
├── main.js
├── style.css
└── README.md
```

## 📦 SISTEMA DE CAJAS Y FASES DETALLADO

### 🏗️ CAJA 1: FOUNDATION
**Meta**: Base técnica sólida para construir encima

#### Fase 1.0 - Setup Inicial
```javascript
// Objetivos:
- Estructura de carpetas completa
- index.html con canvas responsivo
- main.js inicializando PixiJS 8
- Engine.js con gameloop básico
- Constants.js con configuración

// Validación:
- Canvas visible con fondo #0a0e27
- Console.log mostrando deltaTime
- Sin errores en consola
```

#### Fase 1.1 - Sistema Core
```javascript
// Objetivos:
- EventBus.js funcionando con on/emit/off
- Time.js con deltaTime suavizado
- Random.js con seed determinista
- Debug overlay básico (tecla D)

// Validación:
- Eventos disparándose correctamente
- FPS mostrado en pantalla con D
- Random generando mismos valores con misma seed
```

#### Fase 1.2 - Rendering Base
```javascript
// Objetivos:
- Renderer.js wrapper de PixiJS
- Camera.js con pan (arrastrar mouse)
- Fondo con gradiente radial sutil
- Grid de debug toggleable

// Validación:
- Poder mover la cámara
- Grid visible/invisible con tecla G
- Gradiente de fondo visible
```

---

### 🦠 CAJA 2: VIDA BÁSICA
**Meta**: Criaturas que viven, se mueven y mueren

#### Fase 2.0 - Criatura Mínima
```javascript
// Objetivos:
- Creature.js con posición, dirección
- CreatureSprite.js forma orgánica
- Movimiento browniano básico
- Spawn de 10 criaturas

// Validación:
- 10 blobs moviéndose aleatoriamente
- Formas orgánicas no círculos perfectos
- Sin salirse del mundo
```

#### Fase 2.1 - Energía y Muerte
```javascript
// Objetivos:
- Sistema de energía (100 inicial)
- Pérdida 1 energía/segundo
- Muerte al llegar a 0
- Visual: opacidad = energía/100

// Validación:
- Criaturas se desvanecen gradualmente
- Mueren tras 100 segundos
- Se remueven de la memoria
```

#### Fase 2.2 - Comida Básica
```javascript
// Objetivos:
- Resources.js con pool de comida
- Spawn cada 2 segundos
- Detección en radio 50px
- +30 energía al comer

// Validación:
- Partículas doradas aparecen
- Criaturas las buscan y comen
- Energía se restaura visualmente
```

#### Fase 2.3 - Comportamiento de Búsqueda
```javascript
// Objetivos:
- Estados: Idle/Seeking/Eating
- Visión en cono de 120°, 200px
- Priorizar comida más cercana
- Movimiento suave hacia objetivo

// Validación:
- Comportamiento diferente por estado
- No ven comida detrás de ellos
- Movimiento natural, no robótico
```

---

### 🧬 CAJA 3: GENÉTICA SIMPLE
**Meta**: ADN funcional que afecta comportamiento

#### Fase 3.0 - Sistema de ADN
```javascript
// Objetivos:
- DNA.js con estructura de genes
- Genes: speed(0.5-2), size(0.7-1.3), vision(100-300)
- Aplicar genes a stats de criatura
- Color basado en genes

// Validación:
- Criaturas visiblemente diferentes
- Velocidades variadas
- Tamaños distintos
```

#### Fase 3.1 - Reproducción Básica
```javascript
// Objetivos:
- Buscar pareja si energía > 80
- Compatibilidad por cercanía genética
- Mezcla 50/50 de genes parentales
- Costo: 40 energía cada padre

// Validación:
- Criaturas se buscan para reproducirse
- Bebés con características mezcladas
- Población se mantiene estable
```

#### Fase 3.2 - Mutaciones
```javascript
// Objetivos:
- 10% chance de mutación por gen
- Mutación: ±20% del valor
- Mutaciones acumulables
- Visual: brillo al mutar

// Validación:
- Ocasionales criaturas "diferentes"
- Evolución gradual visible
- Sin mutaciones extremas
```

---

### 🌍 CAJA 4: MUNDO VIVO
**Meta**: Entorno procedural infinito con zonas

#### Fase 4.0 - Chunks y Cámara
```javascript
// Objetivos:
- Chunks de 500x500px
- Cargar 9 chunks (3x3) alrededor de cámara
- Descargar chunks lejanos
- Persistir entidades en chunks

// Validación:
- Mundo "infinito" al explorar
- Sin lag al moverse
- Entidades persisten fuera de vista
```

#### Fase 4.1 - Zonas Diferenciadas
```javascript
// Objetivos:
- Perlin noise para zonas
- Tipos: Abundante/Normal/Escasa
- Color de fondo por zona
- Spawn rates diferentes

// Validación:
- Zonas visualmente distintas
- Más comida en zonas abundantes
- Transiciones suaves entre zonas
```

#### Fase 4.2 - Física y Colisiones
```javascript
// Objetivos:
- Spatial hash grid para optimización
- Colisiones suaves (no atravesarse)
- Empuje proporcional a masa
- Flocking emergente

// Validación:
- Criaturas no se superponen
- Grupos naturales se forman
- Performance estable con 200+
```

---

### 👁️ CAJA 5: JUGADOR DIOS
**Meta**: Interacción significativa del jugador

#### Fase 5.0 - Poderes Básicos
```javascript
// Objetivos:
- Click derecho: crear comida
- Click izq + arrastrar: mover criatura
- Rueda: zoom in/out
- Espacio: pausa, 1-3: velocidades

// Validación:
- Controles responsivos
- Feedback visual de acciones
- Zoom suave con límites
```

#### Fase 5.1 - Selección e Inspección  
```javascript
// Objetivos:
- Click para seleccionar criatura
- Panel con genes y stats
- Árbol genealógico simple
- Highlight de familia

// Validación:
- Información clara y legible
- Árbol muestra 3 generaciones
- Familiares se destacan
```

#### Fase 5.2 - Influencia Divina
```javascript
// Objetivos:
- Crear zona segura (shift+click)
- Bendecir criatura (+50% stats temporal)
- Evento lluvia de comida (tecla F)
- Criaturas "agradecen" ayuda

// Validación:
- Zonas seguras repelen peligros
- Bendiciones visualmente obvias
- Comportamiento de gratitud
```

---

### 🧠 CAJA 6: COMPORTAMIENTO COMPLEJO
**Meta**: Comportamientos emergentes sofisticados

#### Fase 6.0 - Genes de Comportamiento
```javascript
// Objetivos:
- Nuevos genes: aggression, social, curiosity
- Afectan decisiones de movimiento
- Personalidades emergentes
- Preferencias individuales

// Validación:
- Comportamientos únicos por criatura
- Algunas exploran, otras se esconden
- Formación natural de grupos afines
```

#### Fase 6.1 - Depredación
```javascript
// Objetivos:
- Gen carnivore (0-1)
- Carnívoros cazan si hambrientos
- Presas huyen de depredadores
- Balance ecológico natural

// Validación:
- Cadena alimenticia funcional
- No extinción total
- Comportamientos de caza/huida
```

#### Fase 6.2 - Grupos y Manadas
```javascript
// Objetivos:
- Atracción por genes similares
- Líderes por edad/fuerza
- Movimiento coordinado
- Protección de crías

// Validación:
- Manadas coherentes
- Seguimiento de líderes
- Defensa grupal
```

---

### 💬 CAJA 7: COMUNICACIÓN
**Meta**: Sistema de comunicación emergente

#### Fase 7.0 - Pulsos Básicos
```javascript
// Objetivos:
- Emisión de pulsos visuales
- Tipos: danger, food, mate
- Radio de propagación
- Recepción y respuesta

// Validación:
- Ondas visibles al comunicar
- Respuestas apropiadas
- No spam de señales
```

#### Fase 7.1 - Patrones Genéticos
```javascript
// Objetivos:
- Genes afectan color/patrón de pulso
- Reconocimiento de "acentos"
- Confianza por familiaridad
- Dialectos por zona

// Validación:
- Familias con patrones similares
- Desconfianza de extraños
- Evolución de dialectos
```

#### Fase 7.2 - Comunicación Compleja
```javascript
// Objetivos:
- Cadenas de información
- Ubicaciones en mensajes
- Desinformación posible
- Proto-cultura emergente

// Validación:
- Info viaja por la población
- Mentiras para ventaja propia
- Tradiciones simples emergen
```

---

### 📈 CAJA 8: EVOLUCIÓN VISIBLE
**Meta**: Visualizar el progreso evolutivo

#### Fase 8.0 - Tracking Evolutivo
```javascript
// Objetivos:
- Registro completo de linajes
- Árbol evolutivo interactivo
- Especies auto-identificadas
- Métricas de diversidad

// Validación:
- Árbol muestra divergencias
- Especies claramente distintas
- Stats de población por especie
```

#### Fase 8.1 - Adaptación Ambiental
```javascript
// Objetivos:
- Presión selectiva por zona
- Especializaciones obvias
- Convergencia evolutiva
- Nichos ecológicos

// Validación:
- Criaturas de desierto vs bosque
- Características zona-específicas
- Re-evolución de traits útiles
```

#### Fase 8.2 - Visualización Avanzada
```javascript
// Objetivos:
- Timeline scrubable
- Heatmaps de población
- Gráficos de diversidad genética
- Modo documental cinematográfico

// Validación:
- Historia completa navegable
- Visualizaciones informativas
- Modo cine impresionante
```

---

### ✨ CAJA 9: POLISH Y BELLEZA  
**Meta**: Experiencia pulida y completa

#### Fase 9.0 - Efectos Visuales
```javascript
// Objetivos:
- Partículas de nacimiento/muerte
- Auras de energía pulsantes
- Trails de movimiento
- Shaders de agua en zonas

// Validación:
- Efectos hermosos sin lag
- Coherencia visual total
- Nada se siente placeholder
```

#### Fase 9.1 - UI/UX Refinado
```javascript
// Objetivos:
- Menú principal elegante
- Tooltips contextuales
- Tutoriales integrados
- Ajustes de performance

// Validación:
- UI intuitiva y bella
- Onboarding suave
- Opciones accesibles
```

#### Fase 9.2 - Sonido Ambiental
```javascript
// Objetivos:
- Ambientes por zona
- Sonidos de criaturas
- Música generativa
- Mezclador dinámico

// Validación:
- Audio inmersivo
- No repetitivo
- Volumen adaptativo
```

## 🛠️ REGLAS TÉCNICAS ESTRICTAS

### 1. Arquitectura
- **NUNCA** modificar estructura de carpetas sin consultar
- Un archivo = una responsabilidad
- Máximo 200 líneas por archivo
- Si crece más, dividir sin dudar

### 2. Fases
- **SOLO** implementar fase actual
- Marcar como `TODO: Fase X.Y` lo futuro
- No adelantarse nunca
- Una fase debe funcionar completa antes de continuar

### 3. Código
```javascript
// BIEN
function findNearestFood(creature, foods) {
    // Busca comida más cercana en rango de visión
}

// MAL  
function find(c, f) {
    // ???
}
```

### 4. Performance
- Object pooling obligatorio
- Spatial grid para búsquedas
- Máximo 500 entidades activas
- Target: 60fps estables

### 5. PixiJS Específico
- Reusar Graphics siempre que sea posible
- Container para grupos de sprites
- `cacheAsBitmap` para estáticos
- Evitar filters en muchas entidades

### 6. Debug
- Overlay con tecla D
- Mostrar: FPS, entidades, fase actual
- Sin console.log en producción
- Visual > textual

### 7. Git
- Commit por sub-fase
- Mensaje: `CAJA X - Fase Y.Z: descripción`
- No código comentado
- No console.logs

## 🎮 CONTROLES FINALES

- **Mouse**
  - Click izq: seleccionar
  - Click der: crear comida  
  - Arrastrar: mover cámara/criatura
  - Rueda: zoom

- **Teclado**
  - D: debug overlay
  - G: grid
  - Espacio: pausa
  - 1-3: velocidad tiempo
  - F: lluvia de comida
  - ESC: deseleccionar

## 🎯 VALIDACIÓN POR FASE

Cada fase debe cumplir:
- [ ] Funciona sin errores
- [ ] Visualmente correcta
- [ ] Performance estable
- [ ] Código en lugar correcto
- [ ] Documentada básicamente
- [ ] Probada con valores extremos
- [ ] Compatible con fases anteriores

## 💡 FILOSOFÍA DEL PROYECTO

1. **Emergencia sobre prescripción**: No hardcodear comportamientos complejos
2. **Belleza en simplicidad**: Menos es más si es elegante
3. **Performance es feature**: Fluidez > características
4. **Observar > controlar**: El jugador es testigo, no dictador
5. **Cada partida única**: Alto factor de imprevisibilidad controlada

## 🚨 ERRORES COMUNES A EVITAR

1. **No usar object pooling** → lag con muchas entidades
2. **Olvidar limpiar eventos** → memory leaks
3. **Física compleja** → mantenerla simple
4. **UI sobrecargada** → minimalismo
5. **Optimización prematura** → primero funcional
6. **Acoplamiento fuerte** → modular siempre
7. **Sin límites** → siempre caps máximos

## 📝 ESTRUCTURA DE CONSULTA A CURSOR

```
Estoy en CAJA [X] - Fase [Y.Z]: [nombre]

Necesito implementar: [descripción específica]

Contexto:
- [archivos relevantes actuales]
- [decisiones previas importantes]

Restricciones:
- Solo código para esta fase
- Mantener modularidad  
- Performance para 500 entidades
- Seguir estructura existente

Output esperado:
- [qué archivos crear/modificar]
- [comportamiento esperado]
```

---

**MANTÉN ESTE DOCUMENTO COMO REFERENCIA CONSTANTE**
**ACTUALÍZALO CUANDO COMPLETES FASES**
**ES LA BIBLIA DEL PROYECTO**