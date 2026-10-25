import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import AnimeCard from "@/components/anime/AnimeCard";
import SkeletonCard from "@/components/anime/SkeletonCard";

export default function AnimeRow({ title, subtitle, items = [], loading, error, viewAll, rank }) {
  const scroller = useRef(null);

  const scroll = (direction) => {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.max(320, node.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="py-7">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-medium leading-tight sm:text-[27px]">{title}</h2>
          {subtitle && <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {viewAll && (
            <Link to={viewAll} className="hidden text-xs uppercase tracking-[0.16em] text-muted-foreground transition hover:text-primary sm:block">
              View all
            </Link>
          )}
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={`Scroll ${title} left`}
            className="grid h-8 w-8 place-items-center rounded-full border border-border/70 text-muted-foreground transition hover:border-primary/60 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={`Scroll ${title} right`}
            className="grid h-8 w-8 place-items-center rounded-full border border-border/70 text-muted-foreground transition hover:border-primary/60 hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <span className="text-foreground/80">{error}</span>
        </div>
      ) : (
        <div
          ref={scroller}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        >
          {loading
            ? Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="w-[150px] shrink-0 sm:w-[165px]">
                  <SkeletonCard />
                </div>
              ))
            : items.map((anime, index) => (
                <div key={`${anime.id}-${index}`} className="w-[150px] shrink-0 snap-start sm:w-[165px]">
                  <AnimeCard anime={anime} rank={rank ? index + 1 : undefined} />
                </div>
              ))}
        </div>
      )}
    </section>
  );
}
