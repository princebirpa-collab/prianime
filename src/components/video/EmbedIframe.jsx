import { useState } from "react";

/**
 * Reusable, responsive embed player: any https embed or page URL renders in a
 * 16:9 iframe that fills its container. No sandbox attribute â€” restrictive
 * sandboxes break third-party players. Use `key={src}` on the consumer to
 * reload cleanly when the source changes.
 */
export default function EmbedIframe({ src, title = "Embedded video player" }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-black aspect-video">
      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-card" aria-hidden="true">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
      )}
      <iframe
        src={src}
        title={title}
        loading="lazy"
        onLoad={() => setLoading(false)}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="origin"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
