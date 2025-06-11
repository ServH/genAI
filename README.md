# 🧬 GenAI - Simulador de Vida Emergente

Un simulador de vida emergente donde criaturas geométricas evolucionan, se reproducen y desarrollan comportamientos complejos. El jugador actúa como un "dios observador" que puede influir sutilmente en este mundo.

## 🎯 Estado Actual

**CAJA 1 - Fase 1.1: Sistema Core** ✅

- ✅ Estructura de carpetas completa
- ✅ Canvas responsivo con PixiJS 8.x
- ✅ Motor del juego con gameloop básico
- ✅ Sistema de eventos global (EventBus)
- ✅ Gestión de tiempo con deltaTime suavizado
- ✅ Generador aleatorio determinista
- ✅ Debug overlay profesional con tabs
- ✅ Control de pausa (tecla Espacio)

## 🚀 Inicio Rápido

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ServH/genAI.git
   cd genAI
   ```

2. **Abrir en navegador**
   ```bash
   # Servir con cualquier servidor HTTP local
   python -m http.server 8000
   # o
   npx serve .
   ```

3. **Abrir** `http://localhost:8000`

## ⌨️ Controles

- **D**: Toggle debug overlay
- **Espacio**: Pausa/reanuda el juego
- **Tabs en Debug**: Navegación entre paneles (Performance, Systems, Events, Random)
- **ESC**: Salir/deseleccionar (futuro)

## 🏗️ Arquitectura

```
/genai
├── /src
│   ├── /core          # Motor principal y sistemas base
│   ├── /creatures     # Entidades vivas (TODO: Fase 2.0)
│   ├── /genetics      # Sistema de ADN (TODO: Fase 3.0)
│   ├── /environment   # Mundo procedural (TODO: Fase 4.0)
│   ├── /systems       # Sistemas de juego (TODO: Fases futuras)
│   ├── /player        # Interacción del jugador (TODO: Fase 5.0)
│   ├── /rendering     # Visualización (TODO: Fase 1.2)
│   ├── /debug         # Herramientas de debug (TODO: Fase 1.1)
│   └── /utils         # Utilidades (TODO: Fase 1.1)
├── index.html         # Punto de entrada
├── main.js           # Inicialización
├── style.css         # Estilos
└── README.md         # Este archivo
```

## 🛠️ Tecnologías

- **JavaScript Vanilla**: Sin frameworks, máximo rendimiento
- **PixiJS 8.x**: Renderizado 2D acelerado por GPU
- **HTML5 Canvas**: Responsivo y optimizado
- **CSS3**: Estilos minimalistas

## 📋 Roadmap

### 🏗️ CAJA 1: FOUNDATION
- [x] **Fase 1.0**: Setup inicial ✅
- [x] **Fase 1.1**: Sistema core (EventBus, Time, Random) ✅
- [ ] **Fase 1.2**: Rendering base (Camera, efectos)

### 🦠 CAJA 2: VIDA BÁSICA
- [ ] **Fase 2.0**: Criatura mínima
- [ ] **Fase 2.1**: Energía y muerte
- [ ] **Fase 2.2**: Comida básica
- [ ] **Fase 2.3**: Comportamiento de búsqueda

### 🧬 CAJA 3: GENÉTICA SIMPLE
- [ ] **Fase 3.0**: Sistema de ADN
- [ ] **Fase 3.1**: Reproducción básica
- [ ] **Fase 3.2**: Mutaciones

*[Ver roadmap completo en docIni.md]*

## 🎨 Especificaciones Visuales

- **Fondo**: `#0a0e27` (azul muy oscuro)
- **Criaturas**: Gradientes bioluminiscentes
- **Efectos**: Glows sutiles, transparencias
- **UI**: Minimalista, estilo cyberpunk

## 🔧 Desarrollo

### Reglas de Desarrollo
1. **Una fase a la vez**: No adelantarse
2. **Modularidad**: Un archivo = una responsabilidad
3. **Performance**: 60fps con 500 entidades
4. **Commits**: Un commit por sub-fase

### Validación de Fase
- [ ] Funciona sin errores
- [ ] Visualmente correcta
- [ ] Performance estable
- [ ] Código documentado

## 📊 Métricas Actuales

- **FPS Target**: 60fps
- **Entidades Max**: 500
- **Memoria**: Optimizada con object pooling
- **Compatibilidad**: Navegadores modernos

## 🤝 Contribución

Este proyecto sigue un sistema de fases estricto. Consulta `docIni.md` para el contexto completo antes de contribuir.

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles.

---

**Versión**: 1.1.0-alpha  
**Fase Actual**: CAJA 1 - Fase 1.1  
**Última Actualización**: 2024-12-19 