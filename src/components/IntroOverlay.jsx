import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import IntroDetailsShowcase from "@/components/IntroDetailsShowcase";
import { Volume2, VolumeX, UserRound, ArrowRight, Sparkles, History } from "lucide-react";

const INTRO_SEEN_KEY = "prianime-intro-completed:session:v2";
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
  const [showVersionPicker, setShowVersionPicker] = useState(false);
  const [legacyNotice, setLegacyNotice] = useState(false);
  const backgroundVideoRef = useRef(null);

  const enableBackgroundAudio = async () => {
    const video = backgroundVideoRef.current;
    if (!video) return;
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
      // The intro remains dismissible when storage is blocked.
    }
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] h-[100dvh] w-full overflow-y-auto overscroll-contain bg-[#050308] text-white">
      <section className="relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#050308] text-white">
        <video
          ref={backgroundVideoRef}
          className="absolute inset-0 h-full w-full object-cover object-center"
          src={introAsset("bg.mp4.mp4")}
          poster="/zenitsu-intro.webp"
          autoPlay
          muted={!audioEnabled}
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050308]/90 via-transparent to-black/45" />

        <a href="/about-owner" target="_blank" rel="noopener noreferrer"
          onClick={() => { const video = backgroundVideoRef.current; if (video) video.muted = true; setAudioEnabled(false); }}
          className="absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-2.5 text-xs font-semibold text-white/90 shadow-xl backdrop-blur-xl transition hover:border-white/50 hover:bg-black/55">
          <UserRound className="h-4 w-4" /> About Owner
        </a>
        <button type="button"
          onClick={audioEnabled ? () => { const video = backgroundVideoRef.current; if (video) video.muted = true; setAudioEnabled(false); } : enableBackgroundAudio}
          aria-label={audioEnabled ? "Mute intro sound" : "Unmute intro sound"}
          aria-pressed={audioEnabled}
          className="absolute right-5 top-[4.6rem] z-20 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/40 text-white shadow-xl backdrop-blur-xl transition hover:scale-105 hover:bg-black/60">
          <span className="sr-only">{audioEnabled ? "Mute" : "Unmute"}</span>
          {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>

        <div className="relative z-10 flex w-full flex-col items-center px-5 text-center">
          <h1 className="font-display text-6xl font-semibold tracking-[0.08em] text-white drop-shadow-[0_8px_35px_rgba(0,0,0,.65)] sm:text-8xl lg:text-9xl">
            PRI<span className="text-rose-200">-</span>ANIME
          </h1>
          <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.3em] text-white/75 sm:text-sm">
            Discover. Watch. Repeat.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3">
            <button type="button" onClick={() => setShowVersionPicker(true)}
              className="inline-flex min-w-[218px] items-center justify-center gap-3 rounded-2xl border border-white/70 bg-white px-8 py-4 text-sm font-bold tracking-wide text-[#17151a] shadow-[0_12px_35px_rgba(0,0,0,.25)] transition hover:-translate-y-0.5 hover:bg-white/90">
              Enter PRI-ANIME
            </button>
            <button type="button" onClick={dismiss}
              className="rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white">
              Skip intro
            </button>
            <a href="https://discord.gg/2meCrBHQw" target="_blank" rel="noopener noreferrer"
              className="inline-flex min-w-[218px] items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white/90 shadow-lg backdrop-blur-xl transition hover:border-white/35 hover:bg-white/20">
              Discord Community
            </a>
          </div>
        </div>
      </section>
      {showVersionPicker && <div className="fixed inset-0 z-30 flex items-center justify-center p-4 sm:p-8">
        <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setShowVersionPicker(false)} />
        <div className="relative w-full max-w-3xl rounded-[28px] border border-white/15 bg-[#111]/50 p-6 shadow-2xl backdrop-blur-[20px] sm:p-9">
          <button type="button" onClick={() => setShowVersionPicker(false)} aria-label="Close version selection" className="absolute right-4 top-4 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white/60 hover:text-white">✕</button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[.35em] text-rose-200/80">Choose your experience</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">What will you explore?</h2>
            <p className="mt-2 text-white/60">Choose your PRI-ANIME experience.</p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <button type="button" onClick={dismiss} className="group rounded-2xl border border-rose-200/30 bg-white/[.07] p-6 text-left backdrop-blur-xl transition hover:border-rose-200/70 hover:bg-white/[.12]">
              <Sparkles className="h-6 w-6 text-rose-200" />
              <h3 className="mt-4 text-xl font-semibold">PRI-ANIME</h3>
              <p className="mt-2 text-sm text-white/60">Enter the current updated experience.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-rose-100">Enter site <ArrowRight className="h-4 w-4"/></span>
            </button>
            <button type="button" onClick={() => setLegacyNotice(true)} className="rounded-2xl border border-white/15 bg-white/[.07] p-6 text-left backdrop-blur-xl transition hover:border-white/35 hover:bg-white/[.12]">
              <History className="h-6 w-6 text-amber-100" />
              <h3 className="mt-4 text-xl font-semibold">OG Version</h3>
              <p className="mt-2 text-sm text-white/60">The original legacy experience.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-100">Select OG <ArrowRight className="h-4 w-4"/></span>
            </button>
          </div>
          {legacyNotice && <p className="mt-5 rounded-xl border border-white/10 bg-black/25 p-3 text-center text-sm text-white/75">OG version selector is ready, but the original legacy site has not yet been restored. The current version remains available.</p>}
        </div>
      </div>}
      <IntroDetailsShowcase />
    </div>,
    document.body
  );
}
