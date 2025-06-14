# 📋 GenAI - Optimization Changelog

Este documento registra el proceso de refactorización y optimización del proyecto GenAI, siguiendo el plan exhaustivo propuesto.

## 🚀 Plan de Optimización

1.  **Fase 1: Implementación de Object Pooling**
    - [x] Crear `CreaturePool.js` para gestionar objetos `Creature` y `CreatureSprite`.
    - [x] Reutilizar criaturas en lugar de crearlas/destruirlas.
    - [x] Refactorizar `CreatureManager` y `CreatureLifecycle` para usar el pool.
    - [x] Añadir método `reset()` a `Creature` y `CreatureSprite`.

2.  **Fase 2: Optimización del Renderizado (Texturas en lugar de Graphics)**
    - [x] Crear `TextureManager.js` para pre-renderizar las formas de las criaturas a texturas.
    - [x] Cambiar `CreatureSprite` para que use `PIXI.Sprite` con las texturas cacheadas.
    - [x] Reemplazar la animación de deformación por frame por técnicas más eficientes (scale/tint).

3.  **Fase 3: Refactorización de `CreatureBehavior.js` a un Sistema Modular**
    - [ ] Crear un directorio `src/creatures/behaviors`.
    - [ ] Extraer cada comportamiento (`SeekingFood`, `Mating`, `Wander`) a su propia clase.
    - [ ] Implementar un coordinador de comportamiento que ejecute solo la lógica del estado activo.

4.  **Fase 4: Introducción de un Grid Espacial para Búsquedas Eficientes**
    - [ ] Implementar `SpatialGrid.js` para indexar la posición de las entidades.
    - [ ] Refactorizar `findMate` y `searchForFood` para usar el grid espacial, eliminando bucles O(N²).

5.  **Fase 5: Desacoplamiento y Culling**
    - [ ] Aplicar inyección de dependencias para eliminar las referencias a `window.game...`.
    - [ ] Implementar *logical culling*: las criaturas fuera de pantalla pausan su lógica de IA.

---

## ⚡ Fase 1: Implementación de Object Pooling (✅ COMPLETADA)

- **Problema:** Creación (`new Creature()`) y destrucción constante de objetos en cada nacimiento/muerte, causando sobrecarga en el Garbage Collector y caídas de FPS.
- **Solución:** Se implementó un sistema de Object Pooling para reciclar `Creature` y `CreatureSprite`.
- **Componentes clave:**
    - `src/pools/CreaturePool.js`: Gestiona un pool pre-calentado de objetos. Métodos `acquire()` para obtener un objeto reciclado y `release()` para devolverlo.
    - `Creature.reset()` y `CreatureSprite.reset()`: Métodos añadidos para re-inicializar objetos reciclados a un estado "nuevo".
    - `CreatureManager.js`: Ahora utiliza el pool en lugar de instanciar/destruir objetos directamente. `spawn` y `release` son ahora las operaciones principales.
- **Impacto esperado:** Reducción drástica de las pausas del GC, lo que resulta en FPS mucho más estables y un rendimiento general más fluido, especialmente cuando la población cambia rápidamente.

## ⚡ Fase 2: Optimización del Renderizado (✅ COMPLETADA)

- **Problema:** El uso de `PIXI.Graphics` para dibujar cada criatura en cada frame era extremadamente costoso para la CPU. Impedía el renderizado por lotes (batching) de la GPU.
- **Solución:** Se implementó un sistema de cacheo de texturas. Las formas de las criaturas ahora se dibujan una sola vez en texturas al inicio del juego.
- **Componentes clave:**
    - `src/rendering/TextureManager.js`: Nuevo sistema que genera y almacena un set de texturas de criaturas al arrancar.
    - `CreatureSprite.js`: Refactorizado por completo. Ahora utiliza `PIXI.Sprite` en lugar de `PIXI.Graphics`.
    - **Técnicas de optimización:**
        - El color se aplica con `sprite.tint`, una operación de GPU muy rápida.
        - La "ondulación" se simula con `sprite.scale`, evitando redibujar.
        - La opacidad se gestiona con `sprite.alpha`.
- **Impacto esperado:** Aumento masivo del rendimiento del renderizado. La CPU se libera casi por completo del trabajo de dibujo, y la GPU puede procesar cientos de criaturas de manera eficiente a través del batching. Esto debería traducirse en un aumento muy significativo de los FPS máximos y una mayor estabilidad.

## ⚡ Fase 3: Refactorización de `CreatureBehavior.js` (En progreso...) 