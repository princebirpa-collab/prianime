import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Star, Heart, Bookmark, Loader2, Tv, Clock, CalendarDays, Building2, ExternalLink, Sparkles,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import AnimeRow from "@/components/anime/AnimeRow";
import AnimeStreamLink from "@/components/anime/AnimeStreamLink";
import EmptyState from "@/components/common/EmptyState";
import { useAnimeDetail } from "@/hooks/useAnime";
import { useWatchlist } from "@/hooks/useWatchlist";
import { recordAnimeView } from "@/lib/library";
import { fetchMalRating } from "@/lib/animeApi";
import { seasonLabel } from "@/lib/format";

export default function AnimeDetail() {
  const { id } = useParams();
  const { item, loading, error, reload } = useAnimeDetail(id);
  const watchlist = useWatchlist("watchlist");
  const favorites = useWatchlist("favorite");
  const [mal, setMal] = useState(null);
  const [malChecked, setMalChecked] = useState(false);

  useEffect(() => {
    if (!item) return;
    recordAnimeView(item);
    let alive = true;
    setMalChecked(false);
    fetchMalRating(item.titleRomaji || item.display)
      .then((rating) => {
        if (alive) {
          setMal(rating);
          setMalChecked(true);
        }
      })
      .catch(() => alive && setMalChecked(true));
    return () => {
      alive = false;
    };
  }, [item]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          title="This title could not be opened"
          body={error || "AniList did not return this entry."}
          actionLabel="Try again"
          onAction={reload}
        />
      </div>
    );
  }

  const savedHere = watchlist.isSaved(item.id);
  const favorited = favorites.isSaved(item.id);

  return (
    <article className="pb-16">
      <div className="relative">
        <div className="absolute inset-0 -z-10 h-[420px] overflow-hidden">
          <Image src={item.banner || item.cover} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="mx-auto w-full max-w-[1600px] px-4 pt-10 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            <div className="relative mx-auto w-[200px] overflow-hidden rounded-2xl border border-border/60 shadow-2xl sm:w-[240px] lg:mx-0 lg:w-full">
              <Image src={item.cover} alt={item.display} className="aspect-[2/3] w-full object-cover" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary">
                {item.format?.replace(/_/g, " ") || "Anime"} Â· {seasonLabel(item.season, item.seasonYear)}
              </p>
              <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
                {item.display}
              </h1>
              {item.titleRomaji && item.titleRomaji !== item.display && (
                <p className="mt-2 text-sm text-muted-foreground">{item.titleRomaji}</p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                {item.score ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-primary">
                    <Star className="h-3.5 w-3.5 fill-primary" aria-hidden="true" />
                    {(item.score / 10).toFixed(1)} AniList
                  </span>
                ) : null}
                {mal?.score ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5">
                    <Star className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    {mal.score.toFixed(2)} MAL
                  </span>
                ) : malChecked ? (
                  <span className="rounded-full border border-border/50 px-3 py-1.5 text-xs text-muted-foreground">
                    MAL rating unavailable
                  </span>
                ) : (
                  <span className="rounded-full border border-border/50 px-3 py-1.5 text-xs text-muted-foreground">
                    Checking MALâ€¦
                  </span>
                )}
                {item.episodes ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5">
                    <Tv className="h-3.5 w-3.5" aria-hidden="true" /> {item.episodes} episodes
                  </span>
                ) : null}
                {item.duration ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {item.duration} min
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {item.status?.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <AnimeStreamLink anime={item} />
                <button
                  type="button"
                  onClick={() => watchlist.toggle(item)}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm transition ${
                    savedHere ? "border-primary/70 bg-primary/10 text-primary" : "border-border/80 hover:border-primary/50"
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${savedHere ? "fill-primary" : ""}`} aria-hidden="true" />
                  {savedHere ? "In watchlist" : "Watchlist"}
                </button>
                <button
                  type="button"
                  onClick={() => favorites.toggle(item)}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm transition ${
                    favorited ? "border-primary/70 bg-primary/10 text-primary" : "border-border/80 hover:border-primary/50"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favorited ? "fill-primary" : ""}`} aria-hidden="true" />
                  {favorited ? "Favorited" : "Favorite"}
                </button>
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div>
                  <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Synopsis</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-foreground/85">
                    {item.description || "No synopsis has been published for this title yet."}
                  </p>
                </div>
                <dl className="space-y-3 text-sm">
                  {item.genres?.length > 0 && (
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Genres</dt>
                      <dd className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.genres.map((genre) => (
                          <Link
                            key={genre}
                            to={`/browse?genre=${encodeURIComponent(genre)}`}
                            className="rounded-full border border-border/70 px-2.5 py-1 text-xs transition hover:border-primary/60 hover:text-primary"
                          >
                            {genre}
                          </Link>
                        ))}
                      </dd>
                    </div>
                  )}
                  {item.studios?.length > 0 && (
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Studio</dt>
                      <dd className="mt-1 flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        {item.studios.join(", ")}
                      </dd>
                    </div>
                  )}
                  {item.nextEpisode && (
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Next episode</dt>
                      <dd className="mt-1">
                        Episode {item.nextEpisode.episode} in{" "}
                        {Math.max(1, Math.round(item.nextEpisode.timeUntilAiring / 86400))} days
                      </dd>
                    </div>
                  )}
                  {item.trailer?.site === "youtube" && (
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Trailer</dt>
                      <dd className="mt-1">
                        <a
                          href={`https://www.youtube.com/watch?v=${item.trailer.id}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline"
                        >
                          Watch on YouTube <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {item.characters?.length > 0 && (
        <section className="mx-auto w-full max-w-[1600px] px-4 pt-12 sm:px-6 lg:px-10">
          <h2 className="font-display text-2xl font-medium">Principal cast</h2>
          <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
            {item.characters.map((character) => (
              <figure key={character.id} className="w-[104px] shrink-0">
                <Image
                  src={character.image}
                  alt={character.name}
                  className="aspect-[3/4] w-full rounded-xl border border-border/50 object-cover"
                />
                <figcaption className="mt-1.5 line-clamp-2 text-[11px] text-muted-foreground">{character.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <AnimeRow title="If you liked this" subtitle="AniList recommendations" items={item.recommendations || []} viewAll={null} />
        {item.relations?.length > 0 && (
          <AnimeRow title="Same universe" subtitle="Sequels, prequels and spin-offs" items={item.relations} viewAll={null} />
        )}
      </div>

      <div className="mx-auto mt-6 w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/40 px-5 py-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            Metadata from AniList. Episode streaming is not provided by AniList or MyAnimeList.
          </p>
          <Link to="/policy" className="text-xs uppercase tracking-[0.16em] text-muted-foreground transition hover:text-primary">
            Licensing policy
          </Link>
        </div>
      </div>
    </article>
  );
}
