import { useRef, useState } from "react";
import VidstuckPlayer from "@/components/video/VidstuckPlayer";
import AnikotoBackup from "@/components/video/AnikotoBackup";
import { parseVidstuckUrl } from "@/components/video/vidstuckUrls";

export default function ServerVideoPlayer({ src, title, startAt = 0, onProgress }) {
  const source = parseVidstuckUrl(src);
  const [server, setServer] = useState("vidstuck");
  const progress = useRef(null);
  const [resume, setResume] = useState(null);

  const switchServer = (next) => {
    if (next === server) return;
    if (next !== "vidstuck" && progress.current?.src === src) setResume(progress.current);
    setServer(next);
  };

  const rememberProgress = (position, duration, detail = {}) => {
    if (source && (detail.season ?? source.season) === source.season && (detail.episode ?? source.episode) === source.episode) {
      progress.current = { src, position };
    }
    onProgress?.(position, duration, detail);
  };

  if (!source) {
    return (
      <div role="alert" className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">This video source could not be opened.</p>
        <p className="mt-1">Choose a valid Vidstuck movie or TV episode link, or select a matching source from the anime details. The player has stopped safely instead of crashing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div role="group" aria-label="Playback server" className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-muted-foreground">Server</span>
        {[{ id: "vidstuck", label: "Vidstuck · Main" }, { id: "official", label: "Licensed platforms" }, { id: "anikoto", label: "AniKoto · Extra Backup" }].map((item) => (
          <button key={item.id} type="button" aria-pressed={server === item.id} onClick={() => switchServer(item.id)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${server === item.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-primary"}`}>{item.label}</button>
        ))}
      </div>
      {server === "vidstuck"
        ? <VidstuckPlayer src={src} startAt={resume?.src === src ? resume.position : startAt} onProgress={rememberProgress} />
        : server === "official"
          ? <div className="rounded-xl border border-border/60 bg-card/40 p-5"><p className="font-display text-lg">Official viewing platforms</p><p className="mt-1 text-xs text-muted-foreground">Choose a licensed service and search for this title there. Availability varies by country.</p><div className="mt-3 flex flex-wrap gap-4 text-sm"><a className="text-primary hover:underline" href="https://www.crunchyroll.com/" target="_blank" rel="noopener noreferrer">Crunchyroll</a><a className="text-primary hover:underline" href="https://www.netflix.com/" target="_blank" rel="noopener noreferrer">Netflix</a><a className="text-primary hover:underline" href="https://www.primevideo.com/" target="_blank" rel="noopener noreferrer">Prime Video</a></div></div>
          : <AnikotoBackup key={src} title={title} season={source.season} episode={source.episode} />}
    </div>
  );
}
