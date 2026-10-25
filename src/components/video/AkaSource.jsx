import { useState } from "react";
import { Play } from "lucide-react";
import EmbedIframe from "@/components/video/EmbedIframe";
import { buildAkaUrl, parseAkaUrl } from "@/components/video/akaUrls";

const fieldClass = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

export default function AkaSource() {
  const [src, setSrc] = useState("");
  const [label, setLabel] = useState("");

  const loadPlayer = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = String(data.get("link") || "").trim();
    const parsed = parseAkaUrl(value);
    if (parsed) {
      setSrc(parsed.url.href);
      setLabel(parsed.kind === "episode" ? `Season ${parsed.season} Â· Episode ${parsed.episode}` : "Title page");
      return;
    }
    const season = Math.max(1, Number(data.get("season") || 1));
    const episode = Math.max(1, Number(data.get("episode") || 1));
    const url = buildAkaUrl({ slug: value, season, episode });
    if (url) {
      setSrc(url);
      setLabel(`Season ${season} Â· Episode ${episode}`);
    }
  };

  return (
    <section aria-label="Aka video source" className="mb-8 space-y-4 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-6">
      <div>
        <h2 className="font-display text-2xl">Aka</h2>
        <p className="mt-1 text-sm text-muted-foreground">Paste an animesalt.cx link â€” an episode link (â€¦/episode/slug-1x1/) or a title link (â€¦/ka) â€” or just the slug with a season and episode below.</p>
      </div>
      <form onSubmit={loadPlayer} className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-xs text-muted-foreground">Link or slug
          <input name="link" required placeholder="https://animesalt.cx/episode/â€¦ or slug" className={fieldClass} />
        </label>
        <label className="w-20 text-xs text-muted-foreground">Season<input name="season" type="number" min={1} max={9999} step={1} defaultValue={1} className={fieldClass} /></label>
        <label className="w-20 text-xs text-muted-foreground">Episode<input name="episode" type="number" min={1} max={9999} step={1} defaultValue={1} className={fieldClass} /></label>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Play className="h-4 w-4" aria-hidden="true" /> Load player</button>
      </form>
      {src && <EmbedIframe key={src} src={src} title={`Aka player Â· ${label}`} />}
      <p className="text-xs text-muted-foreground">External source: animesalt.cx. Title availability and playback are controlled by the provider.</p>
    </section>
  );
}
