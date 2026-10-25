import { useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import EmbedIframe from "@/components/video/EmbedIframe";
import AnimeSaltLinkForm from "@/components/video/AnimeSaltLinkForm";
import { resolveAkaBackupUrl } from "@/components/video/akaUrls";

export default function AnimeSaltBackup({ title, pageUrl, onSelect, mediaType, season, episode }) {
  const [attempt, setAttempt] = useState(0);
  const src = resolveAkaBackupUrl(pageUrl, { mediaType, season, episode });
  return (
    <div className="space-y-3">
      {src ? <EmbedIframe key={`${src}:${attempt}`} src={src} title={`AnimeSalt backup${title ? ` Â· ${title}` : ""}`} /> : <div role="status" className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">Load the matching AnimeSalt {mediaType === "tv" ? "episode or series" : "movie"} link below to use the backup server. The link is remembered for this title in this browser.</div>}
      <AnimeSaltLinkForm onSelect={onSelect} mediaType={mediaType} defaultValue={pageUrl} />
      {src && <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex items-center gap-1.5 hover:text-primary"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reload backup</button>
        <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">Open on AnimeSalt <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
      </div>}
      <p className="text-xs text-muted-foreground">{mediaType === "tv" ? `Season ${season} Â· Episode ${episode}. ` : ""}AnimeSalt controls playback and whether its pages can be embedded. Playback position is not synced between servers; Vidstuck remains available above.</p>
    </div>
  );
}
