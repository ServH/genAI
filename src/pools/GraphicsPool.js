/** GraphicsPool - reutiliza PIXI.Graphics (≤100 líneas) */
const GraphicsPool = new window.Pool(() => new PIXI.Graphics());

// Precalentar con algunos objetos para evitar hipo inicial
GraphicsPool.warm(20);

window.GraphicsPool = GraphicsPool; 