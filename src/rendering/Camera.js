/**
 * GenAI - Sistema de Cámara
 * CAJA 1 - Fase 1.2: Rendering Base
 */

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.targetZoom = 1;
        
        // Configuración
        this.minZoom = CONSTANTS.CAMERA.MIN_ZOOM;
        this.maxZoom = CONSTANTS.CAMERA.MAX_ZOOM;
        this.zoomSpeed = CONSTANTS.CAMERA.ZOOM_SPEED;
        this.panSpeed = CONSTANTS.CAMERA.PAN_SPEED;
        
        // Estado de arrastre
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Contenedor de la cámara
        this.container = null;
        
        this.setupEvents();
        console.log('Camera: Sistema inicializado');
    }

    /**
     * Configura el contenedor de la cámara
     */
    setContainer(container) {
        this.container = container;
        this.updateTransform();
    }

    /**
     * Configura eventos de mouse
     */
    setupEvents() {
        // Mouse drag para pan
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // Rueda para zoom
        document.addEventListener('wheel', (e) => this.onWheel(e));
        
        // Prevenir menú contextual en canvas
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        });
    }

    /**
     * Maneja inicio de arrastre
     */
    onMouseDown(e) {
        if (e.button === 0) { // Click izquierdo
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            document.body.style.cursor = 'grabbing';
        }
    }

    /**
     * Maneja movimiento del mouse
     */
    onMouseMove(e) {
        if (this.isDragging) {
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            
            this.x += deltaX / this.zoom;
            this.y += deltaY / this.zoom;
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            
            this.updateTransform();
        }
    }

    /**
     * Maneja fin de arrastre
     */
    onMouseUp(e) {
        if (e.button === 0) {
            this.isDragging = false;
            document.body.style.cursor = 'default';
        }
    }

    /**
     * Maneja zoom con rueda
     */
    onWheel(e) {
        e.preventDefault();
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.targetZoom = Math.max(this.minZoom, 
            Math.min(this.maxZoom, this.targetZoom * zoomFactor));
    }

    /**
     * Actualiza la cámara cada frame
     */
    update(deltaTime) {
        // Zoom suave
        if (Math.abs(this.zoom - this.targetZoom) > 0.01) {
            this.zoom += (this.targetZoom - this.zoom) * this.zoomSpeed * deltaTime;
            this.updateTransform();
        }
    }

    /**
     * Aplica la transformación al contenedor
     */
    updateTransform() {
        if (!this.container) return;
        
        this.container.x = this.x;
        this.container.y = this.y;
        this.container.scale.set(this.zoom);
        
        if (window.eventBus) {
            eventBus.emit('camera:moved', {
                x: this.x,
                y: this.y,
                zoom: this.zoom
            });
        }
    }
}

// Hacer disponible globalmente
window.Camera = Camera; 