import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { parseVidstuckUrl } from "@/components/video/vidstuckUrls";
import useVidstuckEvents from "@/components/video/useVidstuckEvents";

export default function VidstuckPlayer({ src, startAt = 0, onProgress }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow] = useState(false);
  const frameRef = useRef(null);
  const frameSrc = useMemo(() => {
    const parsed = parseVidstuckUrl(src);
    if (!parsed) return "";
    if (Number.isFinite(startAt) && startAt > 0) parsed.url.searchParams.set("progress", String(Math.floor(startAt)));
    return parsed.url.href;
  }, [src, startAt]);
  useVidstuckEvents(frameRef, frameSrc, onProgress);
  useEffect(() => { setLoaded(false); setFailed(false); setSlow(false); }, [frameSrc, attempt]);
  useEffect(() => {
    if (loaded || failed) return;
    const timer = setTimeout(() => { setSlow(true); setLoaded(true); }, 15000);
    return () => clearTimeout(timer);
  }, [loaded, failed, frameSrc, attempt]);
  const retry = () => setAttempt((value) => value + 1);
  if (!frameSrc) return <p role="alert" className="text-sm text-muted-foreground">This is not a supported Vidstuck embed link.</p>;
  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-background">
        <iframe
          ref={frameRef}
          key={`${frameSrc}:${attempt}`}
          src={frameSrc}
          title="Vidstuck video player"
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setLoaded(true); }}
        />
        {!loaded && <div role="status" className="pointer-events-none absolute inset-0 grid place-items-center bg-background/80"><span className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading Vidstuckâ€¦</span></div>}
        {failed && <div role="alert" className="absolute inset-0 grid place-items-center bg-background p-4 text-center text-sm text-muted-foreground">Vidstuck could not be loaded. Retry or open the player directly below.</div>}
      </div>
      {slow && <p role="status" className="text-xs text-muted-foreground">Vidstuck is taking longer than expected. Reload or open its player directly; a loading frame does not confirm stream availability.</p>}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <button type="button" onClick={retry} className="inline-flex items-center gap-1.5 hover:text-primary"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reload player</button>
        <a href={frameSrc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">Open on Vidstuck <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
      </div>
    </div>
  );
}
