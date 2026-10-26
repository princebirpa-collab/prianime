import { useState } from "react";
import VidstuckPlayer from "@/components/video/VidstuckPlayer";
import AnimeDekhoPlayer from "@/components/video/AnimeDekhoPlayer";
import { parseVidstuckUrl } from "@/components/video/vidstuckUrls";

export default function ServerVideoPlayer({ src, title, startAt = 0, onProgress }) {
  const [server, setServer] = useState("vidstuck");
  const source = parseVidstuckUrl(src);

  const switchServer = (next) => {
    if (next === server) return;
    setServer(next);
  };

  return (
    <div className="space-y-3">
      <div role="group" aria-label="Playback server" className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-muted-foreground">Server</span>
        {[
          { id: "vidstuck", label: "Vidstuck · Main" },
          ...(source?.mediaType === "tv" ? [{ id: "animedekho", label: "AnimeDekho · Alternate" }] : []),
        ].map((item) => (
          <button key={item.id} type="button" aria-pressed={server === item.id} onClick={() => switchServer(item.id)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${server === item.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-primary"}`}>{item.label}</button>
        ))}
      </div>
      {server === "vidstuck" ? (
        <VidstuckPlayer src={src} startAt={startAt} onProgress={onProgress} />
      ) : (
        <AnimeDekhoPlayer
          key={`${source.tmdbId}:${source.season}:${source.episode}`}
          tmdbId={source.tmdbId}
          season={source.season}
          episode={source.episode}
          title={title}
        />
      )}
    </div>
  );
}
