import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Loader2, SlidersHorizontal } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import AnimeCard from "@/components/anime/AnimeCard";
import SkeletonCard from "@/components/anime/SkeletonCard";
import EmptyState from "@/components/common/EmptyState";
import { usePaginatedAnime } from "@/hooks/useAnime";

export const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mahou Shoujo", "Mecha",
  "Music", "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

const SORTS = [
  { id: "popular", label: "Most popular" },
  { id: "trending", label: "Trending" },
  { id: "top", label: "Highest rated" },
  { id: "seasonal", label: "This season" },
];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  // `input` is what the user is typing; only the committed (debounced or
  // submitted) term drives the actual request.
  const [input, setInput] = useState(params.get("q") || "");
  const [genre, setGenre] = useState(params.get("genre") || "");
  const [sort, setSort] = useState(params.get("sort") || "popular");
  const debounceRef = useRef(null);
  const committedQuery = (params.get("q") || "").trim();

  useEffect(() => {
    // Don't clobber what the user is mid-typing in the search box.
    if (document.activeElement?.id !== "browse-search") {
      setInput(params.get("q") || "");
    }
    setGenre(params.get("genre") || "");
    setSort(params.get("sort") || "popular");
  }, [params]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const applyFilters = (next) => {
    const updated = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (value) updated.set(key, value);
      else updated.delete(key);
    });
    setParams(updated);
  };

  const commitQuery = (value) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    applyFilters({ q: value.trim() });
  };

  // 300ms debounce: typing never fires per-keystroke requests; Enter or the
  // search button commits immediately (empty input clears the search).
  const onSearchInput = (event) => {
    const value = event.target.value;
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      applyFilters({ q: value.trim() });
    }, 300);
  };

  const clearAllFilters = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setInput("");
    setParams(new URLSearchParams());
  };

  const body = committedQuery
    ? { action: "search", q: committedQuery, genre: genre || undefined, perPage: 24 }
    : { action: sort, genre: genre || undefined, perPage: 24 };

  const { items, loading, error, hasNext, total, loadMore, retry } = usePaginatedAnime(body);

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Browse"
        title={committedQuery ? `Results for â€œ${committedQuery}â€` : "The whole catalogue"}
        description="Live AniList metadata with scores, genres, formats and episode counts. Filters are applied on the API, not on the page."
      >
        <div className="flex flex-wrap items-center gap-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              commitQuery(input);
            }}
            className="flex h-11 items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4"
          >
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="browse-search" className="sr-only">
              Search anime
            </label>
            <input
              id="browse-search"
              value={input}
              onChange={onSearchInput}
              placeholder="Title, franchise, studioâ€¦"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground/80"
            />
            <button
              type="submit"
              aria-label="Search"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>

          <label className="sr-only" htmlFor="browse-genre">
            Genre
          </label>
          <select
            id="browse-genre"
            value={genre}
            onChange={(event) => applyFilters({ genre: event.target.value })}
            className="h-11 rounded-full border border-border/70 bg-background/60 px-4 text-sm"
          >
            <option value="">All genres</option>
            {GENRES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="browse-sort">
            Sort
          </label>
          <select
            id="browse-sort"
            value={sort}
            onChange={(event) => applyFilters({ sort: event.target.value })}
            className="h-11 rounded-full border border-border/70 bg-background/60 px-4 text-sm"
            disabled={Boolean(committedQuery)}
          >
            {SORTS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      <div className="mx-auto w-full max-w-[1600px] px-4 pt-8 sm:px-6 lg:px-10">
        <div className="mb-5 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {loading && items.length === 0
              ? "Querying AniListâ€¦"
              : `${total || items.length} titles${total && items.length < total ? ` Â· showing ${items.length}` : ""}`}
          </span>
          {(committedQuery || genre) && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="transition hover:text-primary"
            >
              Clear filters
            </button>
          )}
        </div>

        {error ? (
          <EmptyState
            icon={Search}
            title="The catalogue could not be reached"
            body={error}
            actionLabel="Retry"
            onAction={retry}
          />
        ) : loading && items.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No anime found for this search"
            body={`AniList returned no matching titles for â€œ${committedQuery}â€. Try a shorter or differently spelled title${genre ? ", or clear the genre filter" : ""}.`}
            actionLabel="Clear filters"
            onAction={clearAllFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {items.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
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
