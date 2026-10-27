import { useRef, useState } from "react";
import VidstuckPlayer from "@/components/video/VidstuckPlayer";
import AnimeSaltBackup from "@/components/video/AnimeSaltBackup";
import { parseVidstuckUrl } from "@/components/video/vidstuckUrls";

function readBackup(key) {
  try {
    return typeof window === "undefined" ? "" : window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

export default function ServerVideoPlayer({ src, title, startAt = 0, onProgress }) {
  const source = parseVidstuckUrl(src);
  const storageKey = source
    ? `pri-anime:animesalt:${source.mediaType}:${source.tmdbId}`
    : "pri-anime:animesalt:invalid-source";
  const [server, setServer] = useState("vidstuck");
  const progress = useRef(null);
  const [resume, setResume] = useState(null);
  const [backupLink, setBackupLink] = useState(() => readBackup(storageKey));

  const selectBackup = (value) => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(storageKey, value);
    } catch {
      // Playback should still work if browser storage is blocked or full.
    }
    setBackupLink(value);
  };

  const switchServer = (next) => {
    if (next === server) return;
    if (next === "animesalt" && progress.current?.src === src) setResume(progress.current);
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
        {[{ id: "vidstuck", label: "Vidstuck · Main" }, { id: "animesalt", label: "AnimeSalt · Backup" }].map((item) => (
          <button key={item.id} type="button" aria-pressed={server === item.id} onClick={() => switchServer(item.id)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${server === item.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-primary"}`}>{item.label}</button>
        ))}
      </div>
      {server === "vidstuck"
        ? <VidstuckPlayer src={src} startAt={resume?.src === src ? resume.position : startAt} onProgress={rememberProgress} />
        : <AnimeSaltBackup key={src} title={title} pageUrl={backupLink} onSelect={selectBackup} mediaType={source.mediaType} season={source.season} episode={source.episode} />}
    </div>
  );
}
