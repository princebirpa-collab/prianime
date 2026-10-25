import { useState } from "react";
import { Play } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import { buildVidstuckUrl } from "@/components/video/vidstuckUrls";

const fieldClass = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

export default function VidstuckSource() {
  const [type, setType] = useState("tv");
  const [src, setSrc] = useState("");
  const loadPlayer = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const url = new URL(buildVidstuckUrl({ mediaType: type, tmdbId: Number(data.get("tmdbId")), season: Number(data.get("season") ?? 1), episode: Number(data.get("episode") ?? 1) }));
    if (type === "tv") url.searchParams.set("episodeSelector", "true");
    setSrc(url.href);
  };

  return (
    <section aria-label="Vidstuck video source" className="mb-8 space-y-4 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-6">
      <div>
        <h2 className="font-display text-2xl">Vidstuck</h2>
        <p className="mt-1 text-sm text-muted-foreground">Open a title with its TMDB ID, not its AniList or MyAnimeList ID. <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Find a TMDB ID</a></p>
      </div>
      <form onSubmit={loadPlayer} className="flex flex-wrap items-end gap-3">
        <label className="w-full text-xs text-muted-foreground sm:w-36">Content type
          <select value={type} onChange={(event) => setType(event.target.value)} className={fieldClass}>
            <option value="tv">TV / Anime series</option><option value="movie">Movie</option>
          </select>
        </label>
        <label className="min-w-0 flex-1 text-xs text-muted-foreground">TMDB ID
          <input name="tmdbId" required inputMode="numeric" pattern="[1-9][0-9]{0,8}" maxLength={9} placeholder="ID from the TMDB title URL" className={fieldClass} />
        </label>
        {type === "tv" && <>
          <label className="w-20 text-xs text-muted-foreground">Season<input name="season" type="number" min={0} max={9999} step={1} required defaultValue={1} className={fieldClass} /></label>
          <label className="w-20 text-xs text-muted-foreground">Episode<input name="episode" type="number" min={1} max={9999} step={1} required defaultValue={1} className={fieldClass} /></label>
        </>}
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Play className="h-4 w-4" aria-hidden="true" /> Load player</button>
      </form>
      {src && <VideoPlayer key={src} src={src} />}
      <p className="text-xs text-muted-foreground">External source: vidstuck.cc. Title availability and playback are controlled by the provider.</p>
    </section>
  );
}
