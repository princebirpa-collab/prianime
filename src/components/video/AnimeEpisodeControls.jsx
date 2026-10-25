import { ChevronLeft, ChevronRight, Play } from "lucide-react";

export default function AnimeEpisodeControls({ season, episode, maxEpisode, onSelect }) {
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSelect(Number(data.get("season")), Number(data.get("episode")));
  };
  const fieldClass = "mt-1 w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";
  return (
    <form key={`${season}:${episode}`} onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
      <label className="text-xs text-muted-foreground">TMDB season<input name="season" type="number" min={0} max={9999} step={1} defaultValue={season} required className={fieldClass} /></label>
      <label className="text-xs text-muted-foreground">Episode<input name="episode" type="number" min={1} max={9999} step={1} defaultValue={episode} required className={fieldClass} /></label>
      <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Play className="h-4 w-4" aria-hidden="true" /> Play</button>
      <div className="flex items-center gap-2 sm:ml-auto">
        <button type="button" onClick={() => onSelect(season, episode - 1)} disabled={episode <= 1} aria-label="Previous episode" className="rounded-full border border-border p-2.5 text-primary disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => onSelect(season, episode + 1)} disabled={episode >= maxEpisode} className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2.5 text-sm text-primary disabled:opacity-30">Next episode <ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
      </div>
    </form>
  );
}

================================================================================
