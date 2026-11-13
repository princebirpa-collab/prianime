import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import IntroDetailsShowcase from "@/components/IntroDetailsShowcase";
import InteractiveSmoke from "@/components/effects/InteractiveSmoke";
import { Volume2, VolumeX, UserRound } from "lucide-react";

const INTRO_SEEN_KEY = "prianime-intro-completed:session:v2";

// Set VITE_R2_PUBLIC_BASE_URL in Vercel to the public Cloudflare R2
// bucket domain (without a trailing slash). Local public assets remain fallback.
const R2_PUBLIC_BASE_URL = (import.meta.env.VITE_R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
const introAsset = (filename) =>
  R2_PUBLIC_BASE_URL ? `${R2_PUBLIC_BASE_URL}/${filename}` : `/${filename}`;

function hasSeenIntro() {
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export default function IntroOverlay() {
  const [visible, setVisible] = useState(() => window.location.pathname !== "/about-owner" && !hasSeenIntro());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const backgroundVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const textVideoRef = useRef(null);

  const enableBackgroundAudio = async () => {
    const video = backgroundVideoRef.current;
    if (!video) return;

    // Browsers block audible autoplay until a user gesture. This button is
    // that gesture; keep the source unmuted and start its original audio.
    video.muted = false;
    video.volume = 1;

    try {
      await video.play();
      setAudioEnabled(true);
    } catch {
      setAudioEnabled(false);
    }
  };

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Keep the intro dismissible when storage is blocked.
    }
    setVisible(false);
  };

  // Keep the actual site behind the intro from being reached by scrolling.
  // The intro + its feature details remain scrollable inside the fixed overlay.
  useEffect(() => {
    if (!visible) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return undefined;

    const canvas = canvasRef.current;
    const video = textVideoRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !video || !context) return undefined;

    let frame = 0;
    let disposed = false;

    const render = () => {
      if (disposed) return;

      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(bounds.width * ratio));
      const height = Math.max(1, Math.round(bounds.height * ratio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.clearRect(0, 0, width, height);
      const label = "PRI-ANIME";
      let fontSize = Math.min(width * 0.15, height * 0.7);
      context.font = `900 ${fontSize}px "Arial Black", Arial, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#ffffff";

      const maxTextWidth = width * 0.88;
      const measured = context.measureText(label).width;
      if (measured > maxTextWidth) {
        fontSize *= maxTextWidth / measured;
        context.font = `900 ${fontSize}px "Arial Black", Arial, sans-serif`;
      }

      context.fillText(label, width / 2, height / 2, maxTextWidth);
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        context.globalCompositeOperation = "source-in";
        context.drawImage(video, 0, 0, width, height);
        context.globalCompositeOperation = "source-over";
      }

      frame = window.requestAnimationFrame(render);
    };

    const resize = () => {
      if (!disposed) render();
    };

    frame = window.requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [visible]);

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] h-[100dvh] w-full overflow-y-auto overscroll-contain bg-[#050308] text-white">
      <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#050308] text-white">
        <video
          ref={backgroundVideoRef}
          className="absolute inset-0 h-full w-full object-cover object-center"
          src={introAsset("bg.mp4.mp4")}
          poster="/zenitsu-intro.webp"
          autoPlay
          muted={!audioEnabled}
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" />
        <a href="/about-owner" target="_blank" rel="noopener noreferrer" onClick={() => { const video = backgroundVideoRef.current; if (video) video.muted = true; setAudioEnabled(false); }} className="absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-2.5 text-xs font-semibold text-white/90 shadow-xl backdrop-blur-xl transition hover:border-white/50 hover:bg-black/55"><UserRound className="h-4 w-4" /> About Owner</a>
        <button type="button" onClick={audioEnabled ? () => { const video = backgroundVideoRef.current; if (video) video.muted = true; setAudioEnabled(false); } : enableBackgroundAudio} aria-label={audioEnabled ? "Mute intro sound" : "Unmute intro sound"} aria-pressed={audioEnabled} className="absolute right-5 top-[4.6rem] z-20 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/40 text-white shadow-xl backdrop-blur-xl transition hover:scale-105 hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><span className="sr-only">{audioEnabled ? "Mute" : "Unmute"}</span>{audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}</button>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050308]/90 via-transparent to-black/45" />
        <InteractiveSmoke className="absolute inset-0 z-[2]" />

        <video
          ref={textVideoRef}
          className="pointer-events-none absolute h-px w-px opacity-0"
          src={introAsset("text.mp4.mp4")}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />

        <div className="relative z-10 flex w-full flex-col items-center px-5 text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.55em] text-[#d8b56d] sm:text-xs">
            The Gilded Theater
          </p>
          <canvas
            ref={canvasRef}
            className="h-[24vh] w-[88vw] max-w-[1500px]"
            aria-label="PRI-ANIME"
            role="img"
          />
          <h1 className="sr-only">PRI-ANIME</h1>
          <div className="mx-auto mt-2 h-px w-28 bg-gradient-to-r from-transparent via-[#d8b56d] to-transparent" />
          <p className="mt-5 text-xs uppercase tracking-[0.28em] text-white/75 sm:text-sm">
            Enter the world beyond imagination
          </p>
          <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-rose-200/65 sm:text-[10px]">
            PIRACY IS BAD. MAYBE?
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">

            <button
              type="button"
              onClick={dismiss}
              className="inline-flex min-w-[218px] items-center justify-center gap-3 rounded-2xl border border-white/70 bg-white px-8 py-4 text-sm font-bold tracking-wide text-[#17151a] shadow-[0_12px_35px_rgba(0,0,0,.25)] transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              <span aria-hidden="true">☾</span>
              Enter PRI-ANIME
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 transition hover:text-white/90"
            >
              Skip intro
            </button>
            <a
              href="https://discord.gg/2meCrBHQw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-[218px] items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white/90 shadow-lg backdrop-blur-xl transition hover:border-white/35 hover:bg-white/20"
            >
              <span aria-hidden="true">◉</span>
              Discord Community
            </a>
          </div>
          <p className="mt-5 text-[10px] uppercase tracking-[0.16em] text-white/45">
            Scroll down to explore PRI-ANIME features
          </p>
        </div>
      </section>
      <IntroDetailsShowcase />
    </div>,
    document.body
  );
}
