import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Volume2, VolumeX, Sparkles, Crown, Heart } from "lucide-react";

const animeBadges = ["Black Clover", "Vinland Saga"];

export default function AboutOwner() {
  const videoRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "About Owner | PRI-ANIME";
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const attempt = video.play();
      if (attempt?.catch) attempt.catch(() => {});
    }
    return () => { document.title = previousTitle; };
  }, []);

  const unmuteVideo = async () => {
    const video = videoRef.current;
    if (!video || videoFailed) return;
    video.muted = false;
    video.volume = 1;
    try {
      await video.play();
      setSoundOn(true);
    } catch {
      video.muted = true;
      setSoundOn(false);
    }
  };

  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted) {
      await unmuteVideo();
    } else {
      video.muted = true;
      setSoundOn(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-[calc(100vh-68px)] items-center justify-center overflow-hidden bg-[#08070c] px-4 py-10 text-white sm:px-6">
      <style>{`
        @keyframes ownerPageEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .owner-page-enter { animation: ownerPageEnter .75s cubic-bezier(.2,.7,.2,1) both; }
      `}</style>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(190,85,145,.20),transparent_42%),radial-gradient(ellipse_at_88%_88%,rgba(216,181,109,.14),transparent_40%)]" />
      <section className="owner-page-enter relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#111019]/80 shadow-[0_30px_120px_rgba(0,0,0,.65)] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8b56d]/80 to-transparent" />
        <div className="px-5 pb-6 pt-8 text-center sm:px-10 sm:pt-10">
          <p className="text-[9px] font-bold uppercase tracking-[.38em] text-[#d8b56d] sm:text-[10px]">The creator behind PRI-ANIME</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-wide sm:text-5xl">About Owner</h1>
          <p className="mt-2 text-sm text-white/55">Meet the person behind the screen</p>
        </div>

        <div className="mx-auto w-full max-w-4xl px-4 sm:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-rose-200/20 bg-black shadow-[0_0_38px_rgba(190,85,145,.18),0_18px_55px_rgba(0,0,0,.55)]">
            {!videoFailed ? (
              <video
                ref={videoRef}
                src="/about-owner.mp4"
                className="aspect-video w-full bg-black object-contain"
                controls
                autoPlay
                muted
                playsInline
                loop={false}
                preload="auto"
                onError={() => setVideoFailed(true)}
                onVolumeChange={(event) => setSoundOn(!event.currentTarget.muted && event.currentTarget.volume > 0)}
                aria-label="About owner introduction video"
              />
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center bg-[#0c0a11] px-6 text-center">
                <Sparkles className="mb-3 h-8 w-8 text-rose-200/75" />
                <p className="text-sm font-semibold text-white">The intro video is unavailable right now</p>
                <p className="mt-2 max-w-md text-xs leading-5 text-white/50">Please try again in a moment. You can still read a little about the owner below.</p>
              </div>
            )}
          </div>
          {!videoFailed && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[.2em] text-white/40">Introduction video</p>
              <button type="button" onClick={toggleSound} className="inline-flex items-center gap-2 rounded-full border border-rose-200/25 bg-rose-200/10 px-4 py-2 text-xs font-semibold text-white/90 transition hover:bg-rose-200/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d8b56d]">
                {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {soundOn ? "Mute" : "Tap to unmute"}
              </button>
            </div>
          )}
        </div>

        <div className="px-6 pb-8 pt-7 sm:px-10 sm:pb-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-[#d8b56d]/30 bg-[#d8b56d]/10">
              <Crown className="h-6 w-6 text-[#e8cb8b]" />
            </div>
            <h2 className="text-2xl font-semibold tracking-wide sm:text-3xl">Prince Birla</h2>
            <p className="mt-2 text-sm text-rose-100/75">“I am new here”</p>
            <p className="mt-5 text-sm leading-7 text-white/70 sm:text-base">I am the owner of this website.</p>
            <div className="mt-7 flex flex-col items-center gap-3">
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-white/45"><Heart className="h-3.5 w-3.5 text-rose-200" /> Favorite Anime</p>
              <div className="flex flex-wrap justify-center gap-3">
                {animeBadges.map((anime) => (
                  <span key={anime} className="rounded-full border border-rose-200/25 bg-gradient-to-r from-rose-200/10 to-amber-200/10 px-5 py-2.5 text-xs font-semibold tracking-wide text-[#f1d7c8] shadow-[0_0_22px_rgba(244,114,182,.08)]">{anime}</span>
                ))}
              </div>
            </div>
            <a href="/" className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.08] px-6 py-3 text-xs font-semibold text-white/90 transition hover:-translate-y-0.5 hover:border-[#d8b56d]/50 hover:bg-white/[.13] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d8b56d]">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
