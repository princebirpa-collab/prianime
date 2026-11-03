import { useEffect, useRef, useState } from "react";

const INTRO_SEEN_KEY = "prianime-intro-completed:v1";

// Set VITE_R2_PUBLIC_BASE_URL in Vercel to the public Cloudflare R2
// bucket domain (without a trailing slash). Local public assets remain fallback.
const R2_PUBLIC_BASE_URL = (import.meta.env.VITE_R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
const introAsset = (filename) =>
  R2_PUBLIC_BASE_URL ? `${R2_PUBLIC_BASE_URL}/${filename}` : `/${filename}`;

function hasSeenIntro() {
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export default function IntroOverlay() {
  const [visible, setVisible] = useState(() => !hasSeenIntro());
  const [backgroundFailed, setBackgroundFailed] = useState(false);
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
      window.localStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Keep the intro dismissible when storage is blocked.
    }
    setVisible(false);
  };

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

  return (
    <div className="fixed inset-0 z-[99999] isolate flex items-center justify-center overflow-hidden bg-[#050308] text-white">
      {!backgroundFailed && (
        <video
          ref={backgroundVideoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={introAsset("bg.mp4")}
          autoPlay
          loop
          playsInline
          onError={() => setBackgroundFailed(true)}
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050308]/90 via-transparent to-black/45" />

      <video
        ref={textVideoRef}
        className="pointer-events-none absolute h-px w-px opacity-0"
        src={introAsset("text.mp4")}
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
      </div>
    </div>
  );
}
