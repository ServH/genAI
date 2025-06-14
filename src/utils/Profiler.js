/**
 * GenAI - Profiler
 * CAJA OPTIMIZACIÓN - Fase O.5.0
 * Micro‐profiling sencillo para medir tiempo promedio por función.
 */
class Profiler {
    constructor() { this.data = {}; }

    start(label) {
        const d = this.data[label] ||= { time: 0, count: 0, _s: 0 };
        d._s = performance.now();
    }

    end(label) {
        const d = this.data[label];
        if (!d || d._s === 0) return;
        d.time += performance.now() - d._s;
        d.count += 1;
        d._s = 0;
    }

    /** Devuelve top N por promedio ms y reinicia datos */
    flushTop(n = 3) {
        const arr = Object.entries(this.data).map(([label, d]) => ({ label, avg: d.time / Math.max(1, d.count) }));
        arr.sort((a, b) => b.avg - a.avg);
        this.data = {};
        return arr.slice(0, n);
    }
}

window.profiler = new Profiler(); 