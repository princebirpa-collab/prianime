import { useEffect, useRef } from "react";

const MAX_PARTICLES = 28;
const SPRITE_SIZE = 160;

function makeSprite(channel) {
  const value = window.getComputedStyle(document.documentElement).getPropertyValue(channel).trim();
  if (!value) return null;
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext("2d");
  const color = (alpha) => `hsl(${value} / ${alpha})`;

  // Soft jellyfish-shaped smoke: a glowing curved bell with flowing,
  // translucent tentacles. The whole sprite drifts with the cursor.
  const glow = ctx.createRadialGradient(80, 52, 2, 80, 58, 54);
  glow.addColorStop(0, color(0.46));
  glow.addColorStop(0.58, color(0.24));
  glow.addColorStop(1, color(0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.moveTo(27, 61);
  ctx.bezierCurveTo(28, 27, 50, 10, 80, 10);
  ctx.bezierCurveTo(110, 10, 132, 27, 133, 61);
  ctx.bezierCurveTo(119, 70, 105, 66, 92, 70);
  ctx.bezierCurveTo(77, 74, 62, 67, 48, 70);
  ctx.bezierCurveTo(39, 69, 32, 66, 27, 61);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.lineCap = "round";
  const tentacles = [
    [43, 65, 28, 91, 49, 112, 35, 145],
    [59, 69, 72, 91, 48, 112, 62, 151],
    [76, 70, 61, 94, 91, 111, 80, 148],
    [94, 69, 111, 91, 87, 117, 108, 146],
    [113, 65, 130, 89, 111, 111, 126, 139],
  ];
  tentacles.forEach(([x, y, c1x, c1y, c2x, c2y, endX, endY], index) => {
    const strand = ctx.createLinearGradient(x, y, endX, endY);
    strand.addColorStop(0, color(0.34));
    strand.addColorStop(0.55, color(0.18));
    strand.addColorStop(1, color(0));
    ctx.strokeStyle = strand;
    ctx.lineWidth = index === 2 ? 5 : 3.5;
    ctx.shadowColor = color(0.25);
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, endX, endY);
    ctx.stroke();
  });
  ctx.restore();

  // A fine luminous rim makes the curved bell visible without looking solid.
  ctx.strokeStyle = color(0.22);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(29, 60);
  ctx.bezierCurveTo(42, 70, 58, 65, 76, 69);
  ctx.bezierCurveTo(96, 72, 116, 66, 131, 60);
  ctx.stroke();
  return sprite;
}

export default function InteractiveSmoke({ className = "fixed inset-0 z-40" } = {}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduced || !fine || !canvasRef.current) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const purple = makeSprite("--primary");
    if (!purple) return undefined;
    const violet = makeSprite("--chart-2");
    const gold = makeSprite("--gold");
    const sprites = [purple, purple, violet || purple];
    if (gold) sprites.push(gold);
    const goldIndex = gold ? sprites.length - 1 : -1;

    let dpr = 1;
    let width = 0;
    let height = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const pool = Array.from({ length: MAX_PARTICLES }, () => ({
      active: false, x: 0, y: 0, vx: 0, vy: 0, r: 0, grow: 0,
      life: 0, maxLife: 0, phase: 0, spin: 0, sprite: 0,
    }));
    let poolIndex = 0;

    const pointer = { x: width / 2, y: height / 2, seen: false };
    const emitter = { x: pointer.x, y: pointer.y };
    let spawnCarry = 0;
    let running = false;
    let raf = 0;
    let last = 0;

    const spawn = (x, y) => {
      const p = pool[poolIndex];
      poolIndex = (poolIndex + 1) % MAX_PARTICLES;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 10;
      p.y = y + (Math.random() - 0.5) * 10;
      p.vx = (Math.random() - 0.5) * 12;
      p.vy = -6 - Math.random() * 14;
      p.r = 14 + Math.random() * 18;
      p.grow = 14 + Math.random() * 20;
      p.maxLife = 1.5 + Math.random() * 1.1;
      p.life = 0;
      p.phase = Math.random() * Math.PI * 2;
      p.spin = (Math.random() - 0.5) * 1.4;
      p.sprite = goldIndex >= 0 && Math.random() < 0.07 ? goldIndex : Math.floor(Math.random() * 3);
    };

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;

      const dx = pointer.x - emitter.x;
      const dy = pointer.y - emitter.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const step = Math.min(dist, Math.max(6, dist * 0.28));
        emitter.x += (dx / dist) * step;
        emitter.y += (dy / dist) * step;
        spawnCarry += step;
        while (spawnCarry >= 26) {
          spawnCarry -= 26;
          spawn(emitter.x, emitter.y);
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (const p of pool) {
        if (!p.active) continue;
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          continue;
        }
        p.phase += dt * p.spin;
        p.x += (p.vx + Math.sin(p.phase * 2) * 8) * dt;
        p.y += p.vy * dt;
        p.vy -= dt * 3;
        p.r += p.grow * dt;
        const k = p.life / p.maxLife;
        const fade = k < 0.25 ? k / 0.25 : 1 - (k - 0.25) / 0.75;
        const size = p.r * 2;
        ctx.globalAlpha = fade * 0.62;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.sin(p.phase) * 0.12);
        ctx.drawImage(sprites[p.sprite], -size / 2, -size / 2, size, size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      // Stop the animation loop when the pointer is idle and all smoke has faded.
      if (dist < 1 && !pool.some((particle) => particle.active)) {
        running = false;
        return;
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!pointer.seen) {
        pointer.seen = true;
        emitter.x = pointer.x;
        emitter.y = pointer.y;
      }
      start();
    };
    const onLeave = () => {
      pointer.seen = false;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (pointer.seen) start();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
