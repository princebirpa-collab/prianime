import { useRef } from "react";
import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { Image } from "@/components/ui/image";
import { formatCount } from "@/lib/format";
import { useHoverPreview } from "@/hooks/useHoverPreview";
import HoverPreviewPortal from "@/components/anime/HoverPreviewPortal";
import AnimeHoverPreview from "@/components/anime/AnimeHoverPreview";

const finePointer =
  typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

export default function AnimeCard({ anime, rank, className = "" }) {
  const cardRef = useRef(null);
  const preview = useHoverPreview();
  if (!anime) return null;

  const hoverHandlers = finePointer
    ? {
        onMouseEnter: preview.openPreview,
        onMouseLeave: preview.scheduleClose,
        onFocus: preview.openPreview,
        onBlur: preview.scheduleClose,
      }
    : {};

  return (
    <>
      <Link
        ref={cardRef}
        to={`/anime/${anime.id}`}
        className={`group relative block overflow-hidden rounded-xl border border-border/50 bg-card/60 glow-hover ${className}`}
        aria-label={anime.display}
        {...hoverHandlers}
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {anime.cover ? (
            <Image
              src={anime.cover}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-secondary to-background" />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90"
          />

          {typeof rank === "number" && (
            <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 font-display text-sm text-primary backdrop-blur">
              #{rank}
            </span>
          )}

          {anime.score ? (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
              <Star className="h-2.5 w-2.5 fill-primary text-primary" aria-hidden="true" />
              {(anime.score / 10).toFixed(1)}
            </span>
          ) : null}

          <span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-primary/70 bg-black/40 backdrop-blur">
              <Play className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
            </span>
          </span>

          <div className="absolute inset-x-0 bottom-0 p-2.5">
            <p className="line-clamp-2 font-display text-[15px] leading-tight text-white">{anime.display}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/60">
              {[anime.format?.replace(/_/g, " "), anime.seasonYear, anime.episodes ? `${anime.episodes} ep` : null]
                .filter(Boolean)
                .join(" Â· ")}
            </p>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition duration-500 group-hover:opacity-100"
          style={{ boxShadow: "inset 0 0 0 1px hsl(var(--primary) / 0.4), 0 0 44px -6px hsl(var(--primary) / 0.35)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 blur-md transition-all duration-700 group-hover:left-full group-hover:opacity-100"
        />

        <span className="sr-only">
          {anime.popularity ? `${formatCount(anime.popularity)} followers` : ""}
        </span>
      </Link>

      {finePointer && (
        <HoverPreviewPortal
          anchorRef={cardRef}
          open={preview.open}
          onPointerEnter={preview.cancelClose}
          onPointerLeave={preview.scheduleClose}
        >
          <AnimeHoverPreview anime={anime} />
        </HoverPreviewPortal>
      )}
    </>
  );
}

================================================================================
