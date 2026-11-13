import { useEffect, useRef, useState } from "react";
import { Instagram, ArrowUpRight, Play, Volume2, VolumeX, UserRound, Heart, Compass } from "lucide-react";

export default function AboutOwner() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [videoMissing, setVideoMissing] = useState(false);

  useEffect(() => {
    const title = document.title;
    document.title = "About Owner | PRI-ANIME";
    return () => { document.title = title; };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoMissing) return;
    // Start automatically without sound; browsers generally block audible autoplay.
    video.muted = true;
    video.play().catch(() => setPlaying(false));
  }, [videoMissing]);

  const startVideo = async () => {
    const video = videoRef.current;
    if (!video || videoMissing) return;
    video.muted = false;
    video.volume = 1;
    try {
      await video.play();
      setPlaying(true);
      setSoundOn(true);
    } catch {
      video.muted = true;
      try {
        await video.play();
        setPlaying(true);
        setSoundOn(false);
      } catch {
        setPlaying(false);
      }
    }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setSoundOn(!video.muted);
  };

  return (
    <main className="relative isolate flex min-h-[calc(100vh-68px)] items-center justify-center overflow-hidden bg-[#08070c] px-4 py-12 text-white sm:px-6">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(190,85,145,.25),transparent_42%),radial-gradient(ellipse_at_85%_85%,rgba(216,181,109,.16),transparent_40%)]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-[.13]" style={{backgroundImage:"linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)",backgroundSize:"52px 52px"}} />
      <section className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#111019]/75 shadow-[0_30px_120px_rgba(0,0,0,.65)] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-200/70 to-transparent" />
        <div className="px-6 pb-5 pt-8 text-center sm:px-10 sm:pt-10">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-white/25 bg-gradient-to-br from-rose-200/25 to-amber-200/10 shadow-[0_0_35px_rgba(244,114,182,.18)]">
            <UserRound className="h-7 w-7 text-rose-100" />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[.38em] text-rose-200/75">The creator behind PRI-ANIME</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-wide sm:text-5xl">Prince Birla</h1>
          <p className="mt-3 text-xs text-white/50">A little about me · My anime journey</p>
        </div>

        <div className="mx-auto w-full max-w-[430px] px-5">
          <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl">
            <video
              ref={videoRef}
              src="/about-owner.mp4"
              controls={playing}
              playsInline
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onError={() => setVideoMissing(true)}
              onEnded={() => setPlaying(false)}
              onVolumeChange={(e) => setSoundOn(!e.currentTarget.muted && e.currentTarget.volume > 0)}
              className="aspect-[5/9] max-h-[54vh] w-full bg-black object-contain"
              aria-label="Prince Birla's introduction video"
            />
            {!playing && !videoMissing && (
              <button type="button" onClick={startVideo} className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 text-center transition hover:bg-black/35" aria-label="Start introduction video">
                <span className="grid h-16 w-16 place-items-center rounded-full border border-white/50 bg-white/15 shadow-xl backdrop-blur-xl transition group-hover:scale-105"><Play className="ml-1 h-7 w-7 fill-white" /></span>
                <span className="text-[10px] font-bold uppercase tracking-[.25em] text-white/90">Click to start</span>
              </button>
            )}
            {videoMissing && (
              <div className="absolute inset-0 grid place-items-center bg-[#0b0910] p-6 text-center">
                <div><Play className="mx-auto mb-3 h-7 w-7 text-rose-200/70" /><p className="text-sm font-semibold">Video asset not connected</p><p className="mt-2 max-w-xs text-xs leading-5 text-white/50">The player is ready for your original MP4. The file still needs to be uploaded to the site's public assets.</p></div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-[9px] uppercase tracking-[.2em] text-white/40">Personal introduction</span>
            <button type="button" onClick={toggleSound} disabled={!playing} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5 text-[10px] text-white/75 transition hover:bg-white/10 disabled:opacity-35">
              {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}{soundOn ? "Sound on" : "Sound off"}
            </button>
          </div>
        </div>

        <div className="px-6 pb-8 pt-3 sm:px-10 sm:pb-10">
          <p className="text-center text-sm leading-7 text-white/70">
            Hey! I watch many anime, and I am still new to the anime world. I am exploring different stories, characters and worlds. My favourite anime is <span className="font-semibold text-[#f0d69b]">Black Clover</span>.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-center text-xs leading-6 text-white/45">
            PRI-ANIME is my independent project, made as I explore my love for anime and build a place for fellow fans.
          </p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[.045] p-3 text-center"><Heart className="mx-auto mb-2 h-4 w-4 text-rose-200" /><p className="text-[9px] uppercase tracking-[.2em] text-white/40">Favourite anime</p><p className="mt-1 text-sm font-semibold">Black Clover</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[.045] p-3 text-center"><Compass className="mx-auto mb-2 h-4 w-4 text-amber-200" /><p className="text-[9px] uppercase tracking-[.2em] text-white/40">Anime journey</p><p className="mt-1 text-sm font-semibold">Still exploring</p></div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href="https://www.instagram.com/prin.birlaa/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-rose-200/30 bg-rose-200/10 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-rose-200/20"><Instagram className="h-4 w-4" /> @prin.birlaa <ArrowUpRight className="h-3.5 w-3.5" /></a>
            <a href="/browse" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.07] px-5 py-2.5 text-xs font-semibold text-white/85 transition hover:bg-white/[.13]">Browse Catalog <ArrowUpRight className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </section>
    </main>
  );
}
