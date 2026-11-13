import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, BadgeCheck, Code2, Eye, Music2, Pause, Play,
  SkipBack, SkipForward, Sword, Volume2, VolumeX
} from "lucide-react";

const VIDEO_SRC = "/about-owner.mp4";
const BIO_LINES = [
  "I am new here 💫",
  "I am the owner of this website 💫",
  "My favourite anime is Black Clover and Vinland Saga 💫",
];

export default function AboutOwner() {
  const videoRef = useRef(null);
  const blurVideoRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [titleText, setTitleText] = useState("");
  const [bioText, setBioText] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [views, setViews] = useState(139);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "About Owner | PRI-ANIME";
    try {
      const nextViews = Number(window.localStorage.getItem("prianime-about-owner-views") || 138) + 1;
      window.localStorage.setItem("prianime-about-owner-views", String(nextViews));
      setViews(nextViews);
    } catch {
      setViews(139);
    }
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const blurred = blurVideoRef.current;
    if (!video || !blurred) return;
    const sync = () => {
      if (Math.abs(blurred.currentTime - video.currentTime) > 0.35) {
        try { blurred.currentTime = video.currentTime; } catch { /* metadata may not be ready */ }
      }
    };
    video.addEventListener("timeupdate", sync);
    return () => video.removeEventListener("timeupdate", sync);
  }, []);

  useEffect(() => {
    if (!entered) return undefined;
    const name = "Prince Birla 💫";
    let index = 0;
    let deleting = false;
    let timer;
    const tick = () => {
      if (!deleting) {
        index += 1;
        setTitleText(name.slice(0, index));
        if (index >= name.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1500);
        } else timer = window.setTimeout(tick, 105);
      } else {
        index -= 1;
        setTitleText(name.slice(0, Math.max(0, index)));
        if (index <= 0) {
          deleting = false;
          timer = window.setTimeout(tick, 450);
        } else timer = window.setTimeout(tick, 55);
      }
    };
    timer = window.setTimeout(tick, 250);
    return () => window.clearTimeout(timer);
  }, [entered]);

  useEffect(() => {
    if (!entered) return undefined;
    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer;
    const tick = () => {
      const line = BIO_LINES[lineIndex];
      if (!deleting) {
        charIndex += 1;
        setBioText(line.slice(0, charIndex));
        if (charIndex >= line.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1500);
        } else timer = window.setTimeout(tick, 60);
      } else {
        charIndex -= 1;
        setBioText(line.slice(0, Math.max(0, charIndex)));
        if (charIndex <= 0) {
          deleting = false;
          lineIndex = (lineIndex + 1) % BIO_LINES.length;
          timer = window.setTimeout(tick, 350);
        } else timer = window.setTimeout(tick, 28);
      }
    };
    timer = window.setTimeout(tick, 450);
    return () => window.clearTimeout(timer);
  }, [entered]);

  const enterProfile = useCallback(async () => {
    const video = videoRef.current;
    setEntered(true);
    if (!video || videoFailed) return;
    video.muted = false;
    video.volume = volume;
    try {
      await video.play();
      setMuted(false);
      setPlaying(true);
    } catch {
      video.muted = true;
      setMuted(true);
      try { await video.play(); setPlaying(true); } catch { setPlaying(false); }
    }
  }, [videoFailed, volume]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try { await video.play(); setPlaying(true); } catch { setPlaying(false); }
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const restartVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    try { await video.play(); setPlaying(true); } catch { setPlaying(false); }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    if (!nextMuted && video.volume === 0) {
      video.volume = volume || 0.8;
      setVolume(video.volume);
    }
    setMuted(nextMuted);
  };

  const changeVolume = (value) => {
    const next = Number(value);
    setVolume(next);
    const video = videoRef.current;
    if (video) {
      video.volume = next;
      video.muted = next === 0;
      setMuted(video.muted);
    }
  };

  const handleVideoError = () => setVideoFailed(true);

  return (
    <main className="owner-bio-page relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#05040b] px-5 py-24 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Share+Tech+Mono&display=swap');
        .owner-bg-video { position:fixed; inset:0; width:100vw; height:100dvh; object-fit:cover; z-index:-3; }
        .owner-bg-blur { filter:blur(30px) brightness(.6); transform:scale(1.16); }
        .owner-video-shade { position:fixed; inset:0; z-index:-1; background:linear-gradient(135deg,rgba(0,0,0,.50),rgba(5,4,18,.45) 48%,rgba(0,0,0,.58)); }
        .owner-profile { opacity:0; transform:translateY(18px) scale(.985); }
        .owner-profile.is-entered { animation:ownerProfileIn .9s cubic-bezier(.2,.7,.2,1) forwards; }
        @keyframes ownerProfileIn { to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes ownerCursor { 50% { opacity:0; } }
        @keyframes ownerPetalFall { 0% { transform:translate3d(0,-8vh,0) rotate(0deg); opacity:0; } 12% { opacity:.65; } 100% { transform:translate3d(34px,110vh,0) rotate(300deg); opacity:0; } }
        @keyframes ownerEnterFade { to { opacity:0; visibility:hidden; } }
        .owner-cursor { display:inline-block; margin-left:3px; animation:ownerCursor .8s steps(2,end) infinite; color:#b9a5ff; }
        .owner-petal { position:fixed; top:-10vh; z-index:0; pointer-events:none; color:rgba(226,224,255,.68); text-shadow:0 0 12px rgba(143,122,255,.7); animation:ownerPetalFall linear infinite; }
        .owner-glass { border:1px solid rgba(218,211,255,.2); background:rgba(12,12,27,.38); box-shadow:0 8px 32px rgba(0,0,0,.22),inset 0 1px rgba(255,255,255,.06); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); }
        .owner-round-btn { display:grid; width:34px; height:34px; place-items:center; border:1px solid rgba(221,215,255,.2); border-radius:9999px; background:rgba(255,255,255,.07); color:white; transition:background .2s,transform .2s; }
        .owner-round-btn:hover { background:rgba(155,133,255,.22); transform:translateY(-1px); }
        @media (max-width:640px) { .owner-bg-blur { filter:blur(30px) brightness(.55); } }
        @media (prefers-reduced-motion:reduce) { .owner-petal,.owner-cursor,.owner-profile.is-entered { animation:none; opacity:1; transform:none; } }
      `}</style>

      {!videoFailed && (
        <>
          <video ref={blurVideoRef} className="owner-bg-video owner-bg-blur" src={VIDEO_SRC} autoPlay loop muted playsInline preload="auto" aria-hidden="true" />
          <video
            ref={videoRef}
            className="owner-bg-video"
            src={VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={handleVideoError}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            aria-label="Prince Birla profile background video"
          />
        </>
      )}
      <div className="owner-video-shade" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_50%_45%,rgba(106,82,190,.15),transparent_42%)]" />

      <a href="/" className="owner-glass fixed left-4 top-4 z-30 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-white/90 transition hover:border-violet-300/50 hover:bg-violet-400/15">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </a>

      <div className="fixed right-4 top-4 z-30 flex items-center gap-2 rounded-full px-3 py-2 owner-glass">
        <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-white/85 hover:bg-white/10" onClick={toggleMute} aria-label={muted ? "Unmute video" : "Mute video"}>
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <input aria-label="Video volume" className="w-20 accent-violet-300 sm:w-24" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => changeVolume(event.target.value)} />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} className="owner-petal" style={{ left: `${(i * 37 + 7) % 100}%`, animationDelay: `${(i % 8) * -1.7}s`, animationDuration: `${13 + (i % 6) * 2}s`, fontSize: `${8 + (i % 4) * 3}px` }}>
            {i % 3 === 0 ? "✦" : "✧"}
          </span>
        ))}
      </div>

      <section className={`owner-profile relative z-10 flex w-full max-w-xl flex-col items-center text-center ${entered ? "is-entered" : ""}`}>
        <div className="owner-glass mb-5 flex items-center gap-2 rounded-full px-2 py-1.5">
          <button type="button" onClick={restartVideo} className="owner-round-btn" aria-label="Restart video"><SkipBack className="h-4 w-4" /></button>
          <button type="button" onClick={togglePlay} className="owner-round-btn" aria-label={playing ? "Pause video" : "Play video"}>{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
          <button type="button" onClick={toggleMute} className="owner-round-btn" aria-label="Toggle video sound"><SkipForward className="h-4 w-4" /></button>
        </div>

        <div className="mb-5 grid h-[110px] w-[110px] place-items-center overflow-hidden rounded-full border border-violet-100/70 bg-gradient-to-br from-violet-300/30 via-white/10 to-cyan-200/30 p-[3px] shadow-[0_0_18px_rgba(185,165,255,.7),0_0_48px_rgba(89,205,255,.22)]">
          {avatarFailed ? (
            <div className="grid h-full w-full place-items-center rounded-full bg-[#17152a] font-['Cinzel_Decorative'] text-3xl font-black text-white">PB</div>
          ) : (
            <img src="/avatar.png" alt="Prince Birla profile avatar" onError={() => setAvatarFailed(true)} className="h-full w-full rounded-full bg-[#17152a] object-cover" />
          )}
        </div>

        <h1 className="min-h-[1.25em] max-w-full break-words font-['Cinzel_Decorative'] text-[clamp(1.55rem,6vw,3.15rem)] font-black leading-tight tracking-wide text-white [text-shadow:0_0_10px_rgba(255,255,255,.65),0_0_30px_rgba(151,128,255,.75)]">
          {titleText}<span className="owner-cursor">|</span>
        </h1>

        <div className="my-4 flex items-center justify-center gap-3">
          {[BadgeCheck, Code2, Sword].map((Icon, i) => (
            <span key={i} className="grid h-9 w-9 place-items-center rounded-full border border-violet-200/30 bg-violet-300/10 text-violet-100 shadow-[0_0_18px_rgba(155,130,255,.2)]">
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>

        <p className="min-h-[3.5rem] max-w-[min(92vw,620px)] font-['Share_Tech_Mono'] text-[clamp(.78rem,2.6vw,.98rem)] leading-7 text-white/90 [text-shadow:0_0_12px_rgba(125,205,255,.42)]">
          {bioText}<span className="owner-cursor">|</span>
        </p>

        <div className="owner-glass mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-white/80">
          <Eye className="h-3.5 w-3.5 text-cyan-200" />
          <span>{views.toLocaleString("en-IN")}</span>
        </div>
      </section>

      {!entered && (
        <button
          type="button"
          onClick={enterProfile}
          className="fixed inset-0 z-40 flex min-h-[100dvh] w-full items-center justify-center bg-[#05040b]/90 px-6 text-center text-white transition-opacity duration-700"
          aria-label="Click to enter About Owner profile and enable video sound"
        >
          <span className="animate-pulse rounded-full border border-violet-200/30 bg-white/[.06] px-8 py-4 font-['Cinzel_Decorative'] text-sm font-bold uppercase tracking-[.24em] shadow-[0_0_35px_rgba(155,130,255,.25)] sm:text-base">
            Click to enter
          </span>
        </button>
      )}
    </main>
  );
}
