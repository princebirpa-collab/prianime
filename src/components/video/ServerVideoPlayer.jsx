import { useRef, useState } from "react";
import VidstuckPlayer from "@/components/video/VidstuckPlayer";
import AnimeSaltBackup from "@/components/video/AnimeSaltBackup";
import { parseVidstuckUrl } from "@/components/video/vidstuckUrls";

export default function ServerVideoPlayer({ src, title, startAt = 0, onProgress }) {
  const [server, setServer] = useState("vidstuck");
  const progress = useRef(null);
  const [resume, setResume] = useState(null);
  const source = parseVidstuckUrl(src);
  const safeSource = source || { mediaType: "tv", tmdbId: 0, season: 1, episode: 1 };
  const storageKey = `pri-anime:animesalt:${safeSource.mediaType}:${safeSource.tmdbId}`;
  const [backupLink, setBackupLink] = useState(() => window.localStorage.getItem(storageKey) || "");
  const selectBackup = (value) => {
    window.localStorage.setItem(storageKey, value);
    setBackupLink(value);
  };
  const switchServer = (next) => {
    if (next === server) return;
    if (next === "animesalt" && progress.current?.src === src) setResume(progress.current);
    setServer(next);
  };
  if (!source) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-2xl bg-black px-6 text-center">
        <div>
          <p className="font-display text-lg text-white">The anime player could not be opened</p>
          <p className="mt-2 max-w-md text-sm text-white/60">This link is not a supported VidStuck embed URL. Select the episode again or choose a supported source.</p>
        </div>
      </div>
    );
  }
  const rememberProgress = (position, duration, detail = {}) => {
    if ((detail.season ?? source.season) === source.season && (detail.episode ?? source.episode) === source.episode) progress.current = { src, position };
    onProgress?.(position, duration, detail);
  };
  return (
    <div className="space-y-3">
      <div role="group" aria-label="Playback server" className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-muted-foreground">Server</span>
        {[{ id: "vidstuck", label: "Vidstuck Â· Main" }, { id: "animesalt", label: "AnimeSalt Â· Backup" }].map((item) => (
          <button key={item.id} type="button" aria-pressed={server === item.id} onClick={() => switchServer(item.id)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${server === item.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-primary"}`}>{item.label}</button>
        ))}
      </div>
      {server === "vidstuck" ? <VidstuckPlayer src={src} startAt={resume?.src === src ? resume.position : startAt} onProgress={rememberProgress} /> : <AnimeSaltBackup key={src} title={title} pageUrl={backupLink} onSelect={selectBackup} mediaType={source.mediaType} season={source.season} episode={source.episode} />}
    </div>
  );
}
