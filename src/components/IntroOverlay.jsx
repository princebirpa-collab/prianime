import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import IntroDetailsShowcase from "@/components/IntroDetailsShowcase";
import InteractiveSmoke from "@/components/effects/InteractiveSmoke";

const INTRO_SEEN_KEY = "prianime-intro-completed:session:v1";

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
  const [visible, setVisible] = useState(() => !hasSeenIntro());
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
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" />
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

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!audioEnabled && (
              <button
                type="button"
                onClick={enableBackgroundAudio}
                className="rounded-full border border-white/35 bg-black/35 px-6 py-3 text-xs uppercase tracking-[0.18em] text-white/90 backdrop-blur transition hover:border-[#d8b56d] hover:text-[#d8b56d]"
              >
                Enable Intro Sound
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full border border-[#d8b56d] bg-[#d8b56d] px-8 py-3 text-xs font-bold uppercase tracking-[0.22em] text-black transition hover:bg-white hover:border-white"
            >
              Enter PRI-ANIME
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full border border-white/35 bg-black/30 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white/85 backdrop-blur transition hover:border-[#d8b56d] hover:text-[#d8b56d]"
            >
              Skip intro
            </button>
          </div>
          <div className="mt-7 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-white/15 bg-black/35 px-5 py-4 text-center shadow-2xl backdrop-blur-xl sm:px-8">
            <p className="text-sm font-semibold tracking-wide text-white sm:text-base">Watch anime online · Ad-free experience</p>
            <p className="max-w-xl text-xs leading-6 text-white/65">Discover anime, explore player options, and join the PRI-ANIME community.</p>
            <p className="text-[11px] text-[#d8b56d]">Created by one person · Prince Birla. An independent anime passion project.</p>
            <div className="flex flex-wrap justify-center gap-2"><a href="https://discord.gg/2meCrBHQw" target="_blank" rel="noopener noreferrer" className="rounded-full border border-indigo-200/35 bg-indigo-500/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500/35">Join Discord</a><a href="https://www.instagram.com/pri-ani-anime/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-pink-200/35 bg-pink-500/15 px-4 py-2 text-xs font-semibold text-white transition hover:bg-pink-500/30">Instagram · @pri-ani-anime</a></div>
          </div>
          <p className="mt-5 text-[10px] uppercase tracking-[0.16em] text-white/45">
            Scroll down to explore features · Only Enter or Skip opens the website
          </p>
        </div>
      </section>
      <IntroDetailsShowcase />
    </div>,
    document.body
  );
}
