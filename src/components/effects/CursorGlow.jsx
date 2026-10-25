import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduced || !fine || !ref.current) return undefined;

    const el = ref.current;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...pos };
    let raf = 0;
    let running = false;

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.14;
      pos.y += (target.y - pos.y) * 0.14;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      el.style.opacity = "1";
      start();
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };
    const onVisibility = () => {
      if (document.hidden) stop();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[35] h-[560px] w-[560px] rounded-full opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(circle at center, hsl(var(--primary) / 0.16) 0%, hsl(var(--primary) / 0.07) 32%, transparent 65%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
