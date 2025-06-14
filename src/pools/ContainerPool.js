/** ContainerPool - reutiliza PIXI.Container (≤100 líneas) */
const ContainerPool = new window.Pool(() => new PIXI.Container());

ContainerPool.warm(20);

window.ContainerPool = ContainerPool; 