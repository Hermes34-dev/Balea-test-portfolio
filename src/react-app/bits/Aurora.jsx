import { useEffect, useRef } from 'react';

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function Aurora({
  colorStops = ['#06240f', '#0a5c2a', '#22c55e'],
  amplitude  = 1.0,
  blend      = 0.5,
  speed      = 0.5,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let W = 0, H = 0;

    function resize() {
      const p = canvas.parentElement;
      W = canvas.width  = p ? p.offsetWidth  : window.innerWidth;
      H = canvas.height = p ? p.offsetHeight : window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const blobs = colorStops.map((color, i) => ({
      color,
      baseX: (i * 2 + 1) / (colorStops.length * 2),
      baseY: 0.25 + (i % 2) * 0.35,
      radius: 0.50 - i * 0.04,
      px: (i * Math.PI * 2) / colorStops.length,
      py: (i * Math.PI * 2) / colorStops.length + 1.3,
    }));

    function draw(t) {
      raf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      const time = t * 0.001 * speed;

      blobs.forEach((b, i) => {
        const x = (b.baseX + Math.sin(time * 0.6 + b.px) * 0.20 * amplitude) * W;
        const y = (b.baseY + Math.cos(time * 0.45 + b.py) * 0.16 * amplitude) * H;
        const r = b.radius * Math.max(W, H);

        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0,     hexToRgba(b.color, 0.88));
        g.addColorStop(blend, hexToRgba(b.color, 0.32));
        g.addColorStop(1,     hexToRgba(b.color, 0));

        ctx.globalCompositeOperation = i === 0 ? 'source-over' : 'screen';
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
    }

    requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [colorStops, amplitude, blend, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
}
