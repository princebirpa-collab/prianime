import { useEffect, useRef, useState } from "react";
import { Heart, Bookmark, MessageCircle, Share2, Volume2, VolumeX, Flag, Play, Pause } from "lucide-react";
import { Image } from "@/components/ui/image";
import { formatCount } from "@/lib/format";
import ReportDialog from "@/components/common/ReportDialog";

export default function ReelCard({ reel, active, liked, bookmarked, onLike, onBookmark, onComment, onShare }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.muted = muted;
      if (video.preload !== "auto") video.preload = "auto";
      const play = video.play();
      if (play?.catch) play.catch(() => setFailed(true));
    } else {
      video.pause();
      if (video.currentTime > 0) video.currentTime = 0;
      setProgress(0);
    }
  }, [active, muted]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setFailed(true));
    else video.pause();
  };

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full snap-start overflow-hidden bg-black">
      {reel.thumbnail_url && (
        <Image
          src={reel.thumbnail_url}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-0" : "opacity-60"}`}
        />
      )}

      <video
        ref={videoRef}
        src={active ? reel.video_url : undefined}
        poster={reel.thumbnail_url || undefined}
        loop
        muted={muted}
        playsInline
        preload={active ? "auto" : "none"}
        className="relative h-full w-full object-cover"
        onClick={toggle}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
        }}
        onError={() => setFailed(true)}
      />

      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50" />

      {!playing && !failed && active && (
        <button
          type="button"
          onClick={toggle}
          aria-label={`Play ${reel.title}`}
          className="absolute inset-0 grid place-items-center"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full border border-primary/60 bg-black/45 backdrop-blur">
            <Play className="ml-0.5 h-5 w-5 fill-primary text-primary" aria-hidden="true" />
          </span>
        </button>
      )}

      {failed && (
        <div className="absolute inset-0 grid place-items-center px-8 text-center">
          <p className="text-sm text-white/80">
            This clip could not be loaded. The file may have moved â€” try another reel.
          </p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 pb-6 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-primary/50 bg-primary/20 text-xs font-semibold text-primary">
                {(reel.creator_name || "P").slice(0, 1).toUpperCase()}
              </span>
              <p className="truncate text-sm font-medium text-white">{reel.creator_name || "PRI-ANIME creator"}</p>
            </div>
            <h3 className="mt-2.5 font-display text-xl leading-tight text-white">{reel.title}</h3>
            {reel.description && (
              <p className="mt-1.5 line-clamp-2 max-w-lg text-[13px] leading-relaxed text-white/70">{reel.description}</p>
            )}
            {reel.tags?.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-1.5">
                {reel.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-white/70">
                    #{tag}
                  </span>
                ))}
              </p>
            )}
            {reel.licence && <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/40">{reel.licence}</p>}
          </div>

          <div className="flex flex-col items-center gap-3.5 text-white">
            <button
              type="button"
              onClick={() => onLike?.(reel)}
              aria-pressed={liked}
              aria-label={liked ? "Remove like" : "Like this reel"}
              className="flex flex-col items-center gap-1"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-full border backdrop-blur transition ${liked ? "border-primary bg-primary/25 text-primary" : "border-white/25 bg-black/35"}`}>
                <Heart className={`h-4 w-4 ${liked ? "fill-primary" : ""}`} />
              </span>
              <span className="text-[10px]">{formatCount((reel.likes || 0) + (liked ? 1 : 0))}</span>
            </button>

            <button type="button" onClick={() => onComment?.(reel)} className="flex flex-col items-center gap-1" aria-label="Comments">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/35 backdrop-blur">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span className="text-[10px]">Talk</span>
            </button>

            <button
              type="button"
              onClick={() => onBookmark?.(reel)}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark this reel"}
              className="flex flex-col items-center gap-1"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-full border backdrop-blur transition ${bookmarked ? "border-primary bg-primary/25 text-primary" : "border-white/25 bg-black/35"}`}>
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-primary" : ""}`} />
              </span>
              <span className="text-[10px]">Save</span>
            </button>

            <button type="button" onClick={() => onShare?.(reel)} className="flex flex-col items-center gap-1" aria-label="Share">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/35 backdrop-blur">
                <Share2 className="h-4 w-4" />
              </span>
              <span className="text-[10px]">Share</span>
            </button>

            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/35 backdrop-blur"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            <ReportDialog
              targetType="reel"
              targetId={reel.id}
              targetLabel={reel.title}
              trigger={
                <button type="button" aria-label="Report this reel" className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/30 text-white/70 backdrop-blur">
                  <Flag className="h-3.5 w-3.5" />
                </button>
              }
            />
          </div>
        </div>

        <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-white/20">
          <span className="block h-full bg-primary transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {!active && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-black/40 backdrop-blur">
            <Pause className="h-3.5 w-3.5 text-white/50" aria-hidden="true" />
          </span>
        </div>
      )}
    </div>
  );
}
