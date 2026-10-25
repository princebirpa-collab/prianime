import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import AnimeCard from "@/components/anime/AnimeCard";
import EmptyState from "@/components/common/EmptyState";
import { usePaginatedAnime } from "@/hooks/useAnime";
import { currentSeason } from "@/lib/animeApi";

export const CATEGORY_MAP = {
  action: { title: "Action & Adventure", genre: "Action", description: "Momentum, stakes and spectacle â€” the pulse of the medium." },
  "dark-fantasy": { title: "Dark Fantasy & Demons", genre: "Horror", description: "Cursed kingdoms, hungry shadows and bargains that always cost." },
  magic: { title: "Magic & Supernatural", genre: "Supernatural", description: "Rituals, spirits and powers that rewrite the rules of a world." },
  isekai: { title: "Isekai & Other Worlds", genre: "Fantasy", description: "Portal fantasy: ordinary people, impossible kingdoms." },
  "sci-fi": { title: "Sci-Fi & Futuristic", genre: "Sci-Fi", description: "Neon cities, cold orbits and machines that dream." },
  mystery: { title: "Mystery & Thriller", genre: "Mystery", description: "Every answer opens a darker question." },
  comedy: { title: "Comedy & Slice of Life", genre: "Slice of Life", description: "Small rooms, warm light, ordinary miracles." },
  seasonal: { title: "New & Seasonal", seasonal: true, description: "Everything airing right now, ranked by popularity." },
};

export default function Category() {
  const { slug } = useParams();
  const config = CATEGORY_MAP[slug] || CATEGORY_MAP.action;
  const season = currentSeason();

  const body = config.seasonal
    ? { action: "seasonal", season: season.season, year: season.year, perPage: 24 }
    : { action: "genre", genre: config.genre, perPage: 24 };

  const { items, loading, error, hasNext, total, loadMore } = usePaginatedAnime(body);

  return (
    <div className="pb-16">
      <PageHeader eyebrow="Realm" title={config.title} description={config.description}>
        <span className="rounded-full border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {total ? `${total} titles` : "Live query"}
        </span>
      </PageHeader>

      <div className="mx-auto w-full max-w-[1600px] px-4 pt-8 sm:px-6 lg:px-10">
        {error ? (
          <EmptyState title="Could not load this realm" body={error} actionLabel="Reload" onAction={() => window.location.reload()} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {items.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
              {loading &&
                Array.from({ length: items.length ? 6 : 12 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="aspect-[2/3] animate-pulse rounded-xl bg-muted" />
                ))}
            </div>

            {hasNext && (
              <div className="mt-9 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm transition hover:border-primary/60 hover:text-primary disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
