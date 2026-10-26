import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, RotateCcw } from "lucide-react";

function positiveInteger(value, min = 1) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= min && number <= 999999999 ? number : null;
}

export function buildAnimeDekhoUrl(tmdbId, season = 1, episode = 1) {
  const id = positiveInteger(tmdbId);
  const s = positiveInteger(season, 0);
  const e = positiveInteger(episode);
  if (!id || s === null || !e) return "";
  return `https://animedekho.tv/embed/${id}/${s}-${e}`;
}

export default function AnimeDekhoPlayer({
  tmdbId = "",
  season = 1,
  episode = 1,
  title = "AnimeDekho",
  showControls = false,
}) {
  const [idInput, setIdInput] = useState(tmdbId ? String(tmdbId) : "");
  const [seasonInput, setSeasonInput] = useState(String(season));
  const [episodeInput, setEpisodeInput] = useState(String(episode));
  const [selection, setSelection] = useState({ tmdbId, season, episode });
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIdInput(tmdbId ? String(tmdbId) : "");
    setSeasonInput(String(season));
    setEpisodeInput(String(episode));
    setSelection({ tmdbId, season, episode });
  }, [tmdbId, season, episode]);

  const src = useMemo(
    () => buildAnimeDekhoUrl(selection.tmdbId, selection.season, selection.episode),
    [selection],
  );

  const loadSelection = (event) => {
    event.preventDefault();
    const id = positiveInteger(idInput);
    const s = positiveInteger(seasonInput, 0);
    const e = positiveInteger(episodeInput);
    if (!id || s === null || !e) return;
    setLoaded(false);
    setSelection({ tmdbId: id, season: s, episode: e });
    setAttempt((value) => value + 1);
  };

  return (
    <div className="space-y-3">
      {showControls && (
        <form onSubmit={loadSelection} className="flex flex-wrap items-end gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
          <label className="min-w-0 flex-1 text-xs text-muted-foreground">
            TMDB ID
            <input value={idInput} onChange={(event) => setIdInput(event.target.value)} required inputMode="numeric" pattern="[1-9][0-9]{0,8}" maxLength={9} placeholder="e.g. 87978" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="w-24 text-xs text-muted-foreground">
            Season
            <input value={seasonInput} onChange={(event) => setSeasonInput(event.target.value)} required type="number" min={0} max={9999} step={1} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="w-24 text-xs text-muted-foreground">
            Episode
            <input value={episodeInput} onChange={(event) => setEpisodeInput(event.target.value)} required type="number" min={1} max={9999} step={1} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Load AnimeDekho</button>
        </form>
      )}

      {src ? (
        <>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-black">
            <iframe
              key={`${src}:${attempt}`}
              src={src}
              title={`${title} · AnimeDekho player`}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setLoaded(true)}
            />
            {!loaded && <div role="status" className="pointer-events-none absolute inset-0 grid place-items-center bg-black/70"><span className="flex items-center gap-2 text-sm text-white/80"><Loader2 className="h-5 w-5 animate-spin" /> Loading AnimeDekho…</span></div>}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <button type="button" onClick={() => { setLoaded(false); setAttempt((value) => value + 1); }} className="inline-flex items-center gap-1.5 hover:text-primary"><RotateCcw className="h-3.5 w-3.5" /> Reload player</button>
            <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">Open AnimeDekho <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
          <p className="text-xs text-muted-foreground">AnimeDekho embed · TMDB {selection.tmdbId} · Season {selection.season} · Episode {selection.episode}. Provider availability and iframe permissions are controlled by AnimeDekho.</p>
        </>
      ) : (
        <p className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">Enter the correct TMDB ID, season and episode to load the AnimeDekho embed. AniList IDs are not TMDB IDs.</p>
      )}
    </div>
  );
}
