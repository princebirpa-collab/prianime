import { useEffect, useState } from 'react';

const INTRO_SEEN_KEY = 'prianime-intro-seen';

export default function IntroOverlay() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(INTRO_SEEN_KEY);
    } catch {
      return true;
    }
  });
  const [videoFailed, setVideoFailed] = useState(false);

  const dismiss = () => {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      // The intro can still be dismissed when browser storage is unavailable.
    }
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return undefined;
    // Keep the intro from blocking the app indefinitely if the video is missing
    // or the browser does not fire its playback events.
    const fallback = window.setTimeout(dismiss, 9000);
    return () => window.clearTimeout(fallback);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[99999] isolate flex items-center justify-center overflow-hidden bg-[#050308] text-white">
      {!videoFailed && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/intro.mp4"
          autoPlay
          muted
          playsInline
          onEnded={dismiss}
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050308]/90 via-transparent to-black/40" />
      <div className="relative z-10 px-6 text-center">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.55em] text-[#d8b56d] sm:text-xs">
          The Gilded Theater
        </div>
        <h1 className="animate-[prianimeIntro_1.4s_ease-out_both] text-5xl font-semibold tracking-[0.12em] sm:text-7xl md:text-8xl">
          PRI-<span className="text-[#d8b56d]">ANIME</span>
        </h1>
        <div className="mx-auto mt-5 h-px w-28 bg-gradient-to-r from-transparent via-[#d8b56d] to-transparent" />
        <p className="mt-5 text-xs uppercase tracking-[0.35em] text-white/75 sm:text-sm">
          Enter the world beyond imagination
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="absolute bottom-7 right-7 z-20 rounded-full border border-white/30 bg-black/35 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white/85 backdrop-blur transition hover:border-[#d8b56d] hover:text-[#d8b56d]"
      >
        Skip intro
      </button>
      <style>{`
        @keyframes prianimeIntro {
          from { opacity: 0; transform: translateY(16px) scale(.96); letter-spacing: .22em; }
          to { opacity: 1; transform: translateY(0) scale(1); letter-spacing: .12em; }
        }
      `}</style>
    </div>
  );
}
