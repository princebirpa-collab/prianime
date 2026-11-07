import { useRef, useState } from "react";
import VidstuckPlayer from "@/components/video/VidstuckPlayer";
import AnikotoBackup from "@/components/video/AnikotoBackup";
import { parseVidstuckUrl } from "@/components/video/vidstuckUrls";

function ThugTVPanel() {
  return (
    <section className="rounded-xl border border-border/60 bg-card/40 p-4">
      <p className="text-sm font-semibold">ThugTV · In-page source</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        ThugTV is shown inside PRI-ANIME. Playback is not enabled because no authorized embed/API endpoint has been verified. The page will not redirect to another tab or load an unverified stream.
      </p>
    </section>
  );
}

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
        {[{ id: "vidstuck", label: "Vidstuck · Main" }, { id: "anikoto", label: "AniKoto · Catalogue" }, { id: "thugtv", label: "ThugTV · In-page" }].map((item) => (
          <button key={item.id} type="button" aria-pressed={server === item.id} onClick={() => switchServer(item.id)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${server === item.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-primary"}`}>{item.label}</button>
        ))}
      </div>
      {server === "vidstuck"
        ? <VidstuckPlayer src={src} startAt={resume?.src === src ? resume.position : startAt} onProgress={rememberProgress} />
        : server === "anikoto"
          ? <AnikotoBackup key={src} title={title} season={source.season} episode={source.episode} tmdbId={source.tmdbId} />
          : <ThugTVPanel />}
    </div>
  );
}
