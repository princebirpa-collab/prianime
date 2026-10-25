import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Gauge, Captions, RotateCcw, AlertTriangle, ExternalLink } from "lucide-react";
import { formatClock } from "@/lib/format";
import ServerVideoPlayer from "@/components/video/ServerVideoPlayer";
import { parseVidstuckUrl } from "@/components/video/vidstuckUrls";

const RATES = [0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer({ src, poster, subtitles, title, startAt = 0, onProgress, onEnded }) {
  const videoRef = useRef(null);
  const shellRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [captions, setCaptions] = useState(Boolean(subtitles));
  const [failed, setFailed] = useState(false);
  const [buffering, setBuffering] = useState(false);

  useEffect(() => {
    setFailed(false);
    setTime(startAt);
    setPlaying(false);
  }, [src, startAt]);

  const toggle = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
      } catch (playError) {
        // A blocked autoplay is not a broken source â€” leave the play button up.
        if (playError?.name !== "NotAllowedError") setFailed(true);
      }
    } else {
      video.pause();
    }
  };

  const seek = (event) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    video.currentTime = ratio * (video.duration || 0);
  };

  const changeRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  };

  const toggleVolume = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = video.muted || video.volume === 0 ? 1 : 0;
    video.muted = next === 0;
    video.volume = next;
    setVolume(next);
  };

  const fullscreen = () => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else shell.requestFullscreen?.();
  };

  const vidstuck = parseVidstuckUrl(src);
  if (vidstuck) {
    return <ServerVideoPlayer key={`${vidstuck.mediaType}:${vidstuck.tmdbId}`} src={src} title={title} startAt={startAt} onProgress={onProgress} />;
  }

  // An ordinary webpage URL (HTML, not a media file) can never play in a <video>
  // element or a generic iframe â€” say so instead of failing at playback time.
  if (/^https?:\/\//i.test(src || "") && !/\.(mp4|webm|ogg|ogv|m4v|mov|m3u8|mpd)([?#]|$)/i.test(src)) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-2xl bg-black px-6 text-center">
        <div>
          <AlertTriangle className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
          <p className="mt-3 font-display text-lg text-white">This source cannot be embedded</p>
          <p className="mt-1 max-w-md text-sm text-white/60">
            It is a webpage link, not a supported video file or official player embed. Add a direct MP4/WebM file or a provider embed URL instead.
          </p>
          <a
            href={src}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm text-white transition hover:border-primary hover:text-primary"
          >
            Open original page <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={shellRef} className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          if (startAt > 0 && startAt < event.currentTarget.duration - 5) {
            event.currentTarget.currentTime = startAt;
          }
        }}
        onTimeUpdate={(event) => {
          const current = event.currentTarget.currentTime;
          setTime(current);
          onProgress?.(current, event.currentTarget.duration || 0);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        onError={() => setFailed(true)}
      >
        {subtitles ? (
          <track
            kind="captions"
            src={subtitles}
            srcLang="en"
            label="English"
            default={captions}
          />
        ) : null}
      </video>

      {!playing && !failed && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Play video"
          className="absolute inset-0 grid place-items-center bg-black/25 transition hover:bg-black/15"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full border border-primary/70 bg-black/50 backdrop-blur transition group-hover:scale-105">
            <Play className="ml-1 h-6 w-6 fill-primary text-primary" aria-hidden="true" />
          </span>
        </button>
      )}

      {buffering && !failed && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 grid place-items-center bg-black/85 px-6 text-center">
          <div>
            <AlertTriangle className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
            <p className="mt-3 font-display text-lg text-white">This video could not be played.</p>
            <p className="mt-1 text-sm text-white/60">
              The source may be offline or the provider link expired. Try another title from the theatre.
            </p>
            <button
              type="button"
              onClick={() => {
                setFailed(false);
                videoRef.current?.load();
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm text-white transition hover:border-primary hover:text-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retry
            </button>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={seek}
          aria-label="Seek"
          className="group/seek relative block h-4 w-full"
        >
          <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25 transition group-hover/seek:h-1.5" />
          <span
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary transition group-hover/seek:h-1.5"
            style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
          />
        </button>

        <div className="mt-1 flex items-center gap-1.5 text-white">
          <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="p-2">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button type="button" onClick={toggleVolume} aria-label={volume ? "Mute" : "Unmute"} className="p-2">
            {volume ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <span className="font-mono text-[11px] tabular-nums text-white/80">
            {formatClock(time)} / {formatClock(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1">
            {subtitles && (
              <button
                type="button"
                onClick={() => {
                  const next = !captions;
                  setCaptions(next);
                  const tracks = videoRef.current?.textTracks;
                  if (tracks) for (const track of tracks) track.mode = next ? "showing" : "hidden";
                }}
                aria-pressed={captions}
                aria-label="Toggle subtitles"
                className={`p-2 ${captions ? "text-primary" : ""}`}
              >
                <Captions className="h-4 w-4" />
              </button>
            )}
            <button type="button" onClick={changeRate} aria-label="Playback speed" className="flex items-center gap-1 px-2 py-2 text-[11px]">
              <Gauge className="h-4 w-4" />
              {rate}Ã—
            </button>
            <button type="button" onClick={fullscreen} aria-label="Fullscreen" className="p-2">
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

================================================================================
