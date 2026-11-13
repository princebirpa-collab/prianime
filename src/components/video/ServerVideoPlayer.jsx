import { useRef, useState } from "react";
import VidstuckPlayer from "@/components/video/VidstuckPlayer";
import AnikotoBackup from "@/components/video/AnikotoBackup";
import EmbedIframe from "@/components/video/EmbedIframe";
import { parseVidstuckUrl } from "@/components/video/vidstuckUrls";

function buildVideasyUrl(source, episodePicker = false) {
  const id = String(source?.tmdbId || "").trim();
  if (!/^(\d+|tt\d+)$/.test(id)) return "";
  if (source.mediaType === "tv") {
    if (episodePicker) return `https://player.videasy.ws/embed/tv/${encodeURIComponent(id)}`;
    const season = Number(source.season);
    const episode = Number(source.episode);
    if (!Number.isInteger(season) || season < 0 || !Number.isInteger(episode) || episode < 1) return "";
    return `https://player.videasy.ws/embed/tv/${encodeURIComponent(id)}/${season}/${episode}`;
  }
  if (source.mediaType === "movie") return `https://player.videasy.ws/embed/movie/${encodeURIComponent(id)}`;
  return "";
}

function VideasyPanel({ source, title }) {
  // Anime catalogues and TMDB sometimes number seasons differently. Start
  // with Videasy's documented built-in episode selector, then let the viewer
  // switch to the app-selected season/episode route when it matches.
  const [episodePicker, setEpisodePicker] = useState(source?.mediaType === "tv");
  const url = buildVideasyUrl(source, episodePicker);
  return (
    <section className="space-y-3 rounded-2xl border border-border/60 bg-card/40 p-3 sm:p-4" aria-label="Videasy alternate player">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-foreground">Videasy · Alternate player</p>
          <p className="mt-1 text-xs text-muted-foreground">{title || "Selected anime"} · {source.mediaType === "tv" ? `Season ${source.season} · Episode ${source.episode}` : "Movie"}</p>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold text-primary">Separate player</span>
      </div>
      {source?.mediaType === "tv" && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Videasy episode mode">
          <button type="button" aria-pressed={episodePicker} onClick={() => setEpisodePicker(true)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${episodePicker ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/60"}`}>Browse episodes</button>
          <button type="button" aria-pressed={!episodePicker} onClick={() => setEpisodePicker(false)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${!episodePicker ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/60"}`}>Use selected episode</button>
        </div>
      )}
      {url ? (
        <EmbedIframe key={url} src={url} title={`Videasy player for ${title || "selected anime"}`} />
      ) : (
        <div className="grid aspect-video place-items-center rounded-xl border border-border bg-background p-5 text-center">
          <div className="max-w-md">
            <p className="font-semibold text-foreground">Videasy needs a matched TMDB / IMDb ID</p>
            <p className="mt-2 text-sm text-muted-foreground">This title does not currently have the ID and media type required to build its movie or episode embed.</p>
          </div>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">Responsive 16:9 · {episodePicker && source?.mediaType === "tv" ? "Select the episode in Videasy if catalogue season numbering differs" : "Follows the selected season and episode"}</p>
    </section>
  );
}

export default function ServerVideoPlayer({ src, title, startAt = 0, onProgress, match, season = 1, episode = 1 }) {
  const parsedSource = parseVidstuckUrl(src);
  // Use the same TMDB match already used to construct the working VidStuck URL.
  // This avoids requiring a second title lookup for Videasy.
  const source = parsedSource || (match?.tmdbId ? {
    tmdbId: match.tmdbId,
    mediaType: match.mediaType,
    season,
    episode,
  } : null);
  const videasySource = source ? { ...source, season, episode } : null;
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
        <p className="mt-1">Choose a valid VidStuck movie or TV episode link, or select a matching source from the anime details. The player has stopped safely instead of crashing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div role="group" aria-label="Playback server" className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-muted-foreground">Server</span>
        {[
          { id: "vidstuck", label: "VidStuck · Main" },
          { id: "anikoto", label: "AniKoto · Player" },
          { id: "videasy", label: "Videasy · Alternate" },
        ].map((item) => (
          <button key={item.id} type="button" aria-pressed={server === item.id} onClick={() => switchServer(item.id)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${server === item.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-primary"}`}>{item.label}</button>
        ))}
      </div>
      {server === "vidstuck"
        ? <VidstuckPlayer src={src} startAt={resume?.src === src ? resume.position : startAt} onProgress={rememberProgress} />
        : server === "anikoto"
          ? <AnikotoBackup key={src} title={title} season={source.season} episode={source.episode} tmdbId={source.tmdbId} />
          : <VideasyPanel source={videasySource} title={title} />}
    </div>
  );
}
