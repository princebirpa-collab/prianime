import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Play, BookmarkPlus, BookmarkCheck, Loader2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useWatchlist } from "@/hooks/useWatchlist";
import { seasonLabel } from "@/lib/format";

const EASE = [0.22, 1, 0.36, 1];

const STATUS_LABELS = {
  RELEASING: "Ongoing",
  FINISHED: "Completed",
  NOT_YET_RELEASED: "Upcoming",
  CANCELLED: "Cancelled",
  HIATUS: "On hiatus",
};

const stripTags = (text) => (text || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export default function AnimeHoverPreview({ anime }) {
  const watchlist = useWatchlist("watchlist");
  const reduced = useReducedMotion();
  const saved = watchlist.isSaved(anime.id);
  const statusLabel = STATUS_LABELS[anime.status] || (anime.status ? anime.status.toLowerCase().replace(/_/g, " ") : "");

  const chips = [
    anime.score ? `${(anime.score / 10).toFixed(1)} rating` : null,
    anime.seasonYear ? String(anime.seasonYear) : null,
    anime.episodes ? `${anime.episodes} episodes` : null,
    anime.season ? seasonLabel(anime.season, null) : null,
    statusLabel || null,
  ].filter(Boolean);

  const altTitle = anime.titleRomaji && anime.titleRomaji !== anime.display ? anime.titleRomaji : null;

  const stagger = (index) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.05 + index * 0.05, ease: EASE },
  });

  return (
    <div
      role="dialog"
      aria-label={`${anime.display} preview`}
      className="glass glow-soft overflow-hidden rounded-2xl shadow-2xl"
      style={{ borderColor: "hsl(var(--primary) / 0.35)", boxShadow: "0 0 46px -14px hsl(var(--primary) / 0.45), 0 24px 70px -24px rgb(0 0 0 / 0.7)" }}
    >
      <div className="relative h-32 overflow-hidden">
        {anime.banner || anime.cover ? (
          <Image src={anime.banner || anime.cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-secondary to-background" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, hsl(var(--card)) 4%, hsl(var(--card) / 0.45) 45%, transparent 100%)" }}
        />
      </div>

      <div className="px-4 pb-4">
        <motion.div {...stagger(0)} className="-mt-6 relative">
          <h3 className="font-display text-lg font-medium leading-snug text-foreground text-balance">{anime.display}</h3>
          {altTitle && <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{altTitle}</p>}
        </motion.div>

        {chips.length > 0 && (
          <motion.div {...stagger(1)} className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {chip}
              </span>
            ))}
          </motion.div>
        )}

        {anime.genres?.length > 0 && (
          <motion.div {...stagger(2)} className="mt-2.5 flex flex-wrap gap-1.5">
            {anime.genres.slice(0, 4).map((genre) => (
              <span key={genre} className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-medium text-primary">
                {genre}
              </span>
            ))}
          </motion.div>
        )}

        <motion.p {...stagger(3)} className="mt-3 line-clamp-4 text-[12px] leading-relaxed text-foreground/75">
          {stripTags(anime.description) || "No synopsis has been published for this title yet."}
        </motion.p>

        <motion.div {...stagger(4)} className="mt-4 flex items-center gap-2">
          <Link
            to={`/watch?anime=${anime.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" /> Watch now
          </Link>
          <Link
            to={`/anime/${anime.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-border/80 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
          >
            View details
          </Link>
          <button
            type="button"
            onClick={() => watchlist.toggle(anime)}
            disabled={watchlist.loading}
            aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition ${
              saved ? "border-primary/70 bg-primary/10 text-primary" : "border-border/80 text-muted-foreground hover:border-primary/60 hover:text-primary"
            }`}
          >
            {watchlist.loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : saved ? (
              <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

================================================================================
