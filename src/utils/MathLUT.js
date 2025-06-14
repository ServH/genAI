/**
 * GenAI - MathLUT
 * CAJA OPTIMIZACIÓN - Fase O.5.1
 * Lookup tables para sin/cos y utilidades rápidas.
 */
const SIN_LUT = new Float32Array(360);
const COS_LUT = new Float32Array(360);
for (let i = 0; i < 360; i++) {
    const rad = i * Math.PI / 180;
    SIN_LUT[i] = Math.sin(rad);
    COS_LUT[i] = Math.cos(rad);
}

function fastSin(deg) { return SIN_LUT[(deg % 360 + 360) % 360]; }
function fastCos(deg) { return COS_LUT[(deg % 360 + 360) % 360]; }
function dist2(x1, y1, x2, y2) { const dx = x2 - x1; const dy = y2 - y1; return dx * dx + dy * dy; }

window.mathLUT = { fastSin, fastCos, dist2, SIN_LUT, COS_LUT }; 