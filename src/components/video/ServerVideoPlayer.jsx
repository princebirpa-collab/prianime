import { useRef, useState } from "react";
import VidstuckPlayer from "@/components/video/VidstuckPlayer";
import AnimeDekhoPlayer from "@/components/video/AnimeDekhoPlayer";
import { parseVidstuckUrl } from "@/components/video/vidstuckUrls";

export default function ServerVideoPlayer({ src, title, startAt = 0, onProgress }) {
  const [server, setServer] = useState("vidstuck");
  const progress = useRef(null);
  const [resume, setResume] = useState(null);
  const source = parseVidstuckUrl(src);

  const switchServer = (next) => {
    if (next === server) return;
    if (next === "animedekho" && progress.current?.src === src) setResume(progress.current);
    setServer(next);
  };

  const rememberProgress = (position, duration, detail = {}) => {
    if (source && (detail.season ?? source.season) === source.season && (detail.episode ?? source.episode) === source.episode) {
      progress.current = { src, position };
    }
    onProgress?.(position, duration, detail);
  };

  if (!source) {
    return <p role="alert" className="text-sm text-muted-foreground">This video link is not a supported Vidstuck embed. Check the selected title and episode source.</p>;
  }

  return (
    <div className="space-y-3">
      <div role="group" aria-label="Playback server" className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-muted-foreground">Server</span>
        {[{ id: "vidstuck", label: "Vidstuck · Main" }, { id: "animedekho", label: "AnimeDekho · Alternate" }].map((item) => (
          <button key={item.id} type="button" aria-pressed={server === item.id} onClick={() => switchServer(item.id)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${server === item.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-primary"}`}>{item.label}</button>
        ))}
      </div>
      {server === "vidstuck" ? (
        <VidstuckPlayer src={src} startAt={resume?.src === src ? resume.position : startAt} onProgress={rememberProgress} />
      ) : (
        <AnimeDekhoPlayer key={src} tmdbId={source.tmdbId} season={source.season || 1} episode={source.episode || 1} title={title} showControls />
      )}
    </div>
  );
}
