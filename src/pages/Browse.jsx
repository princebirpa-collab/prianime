import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Loader2, SlidersHorizontal, TrendingUp, Star, ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import AnimeCard from "@/components/anime/AnimeCard";
import SkeletonCard from "@/components/anime/SkeletonCard";
import EmptyState from "@/components/common/EmptyState";
import { usePaginatedAnime, useAnimeList } from "@/hooks/useAnime";

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
const ALPHABET = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];
const firstLetter = (anime) => {
  const title = String(anime?.display || anime?.titleRomaji || "").trim();
  const first = title.charAt(0).toLocaleUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
};

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState(params.get("q") || "");
  const [genre, setGenre] = useState(params.get("genre") || "");
  const [sort, setSort] = useState(params.get("sort") || "popular");
  const [letter, setLetter] = useState("");
  const debounceRef = useRef(null);
  const committedQuery = (params.get("q") || "").trim();
  const { items: trendingItems = [] } = useAnimeList({ action: "trending", perPage: 20 });
  const featured = useMemo(() => trendingItems.find((item) => item?.cover && item?.id), [trendingItems]);

  useEffect(() => {
    if (document.activeElement?.id !== "browse-search") setInput(params.get("q") || "");
    setGenre(params.get("genre") || "");
    setSort(params.get("sort") || "popular");
  }, [params]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const applyFilters = (next) => {
    const updated = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (value) updated.set(key, value);
      else updated.delete(key);
    });
    setParams(updated);
  };
  const commitQuery = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
    setLetter("");
    applyFilters({ q: value.trim() });
  };
  const onSearchInput = (event) => {
    const value = event.target.value;
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setLetter("");
      applyFilters({ q: value.trim() });
    }, 350);
  };
  const clearAllFilters = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setInput("");
    setLetter("");
    setParams(new URLSearchParams());
  };

  const body = committedQuery
    ? { action: "search", q: committedQuery, genre: genre || undefined, perPage: 50 }
    : { action: sort, genre: genre || undefined, perPage: 50 };
  const { items, loading, error, hasNext, total, loadMore, retry } = usePaginatedAnime(body);
  const visibleItems = useMemo(
    () => letter ? items.filter((anime) => firstLetter(anime) === letter) : items,
    [items, letter]
  );

  return (
    <div className="pb-16">
      <section className="relative isolate mx-auto min-h-[72vh] w-full max-w-[1800px] overflow-hidden bg-[#050507] text-white sm:min-h-[78vh]">
        {featured?.banner && (
          <div aria-hidden="true" className="absolute inset-0 scale-105 bg-cover bg-center opacity-55 transition-opacity duration-700"
            style={{ backgroundImage: `url("${featured.banner}")` }} />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,4,7,.97)_0%,rgba(4,4,7,.83)_42%,rgba(4,4,7,.28)_100%)]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgba(4,4,7,1)_0%,transparent_45%,rgba(4,4,7,.2)_100%)]" />
        <div className="relative mx-auto flex min-h-[72vh] w-full max-w-[1600px] items-center px-5 py-16 sm:min-h-[78vh] sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.35em] text-white/65">
              <TrendingUp className="h-4 w-4 text-rose-400" /> PRI-ANIME · DISCOVER
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[.98] tracking-tight sm:text-7xl lg:text-8xl">
              Find your next <span className="text-rose-300">anime.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              Browse a continuously paginated catalogue combined from AniList, MyAnimeList and Kitsu. Load more pages to explore titles from every connected source.
            </p>
            {featured && (
              <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-white/75">
                <span className="rounded-full border border-white/20 bg-black/35 px-3 py-2">TRENDING PICK</span>
                {featured.score ? <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> {(featured.score / 10).toFixed(1)} AniList</span> : null}
                <span className="font-medium text-white">{featured.display}</span>
              </div>
            )}
            <a href="#anime-catalogue" className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-rose-100">
              Explore catalogue <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          {featured?.cover && (
            <Link to={`/anime/${featured.id}`} aria-label={`Explore ${featured.display}`}
              className="absolute bottom-8 right-8 hidden w-[230px] overflow-hidden rounded-xl border border-white/30 shadow-[0_28px_90px_rgba(0,0,0,.7)] transition duration-500 hover:-translate-y-2 lg:block xl:right-20">
              <img src={featured.cover} alt={featured.display} className="aspect-[2/3] w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent px-4 pb-4 pt-12 font-display text-xl">{featured.display}</span>
            </Link>
          )}
        </div>
      </section>

      <div id="anime-catalogue">
        <PageHeader
          eyebrow="Browse A–Z"
          title={committedQuery ? `Results for “${committedQuery}”` : "The anime catalogue"}
          description="Combined anime catalogues with pagination. Keep loading pages to explore more titles from every connected source."
        >
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={(event) => { event.preventDefault(); commitQuery(input); }}
              className="flex h-11 items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="browse-search" className="sr-only">Search anime</label>
              <input id="browse-search" value={input} onChange={onSearchInput}
                placeholder="Search anime title…" className="w-48 bg-transparent text-sm outline-none placeholder:text-muted-foreground/80 sm:w-56" />
              <button type="submit" aria-label="Search" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110">
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </form>
            <label className="sr-only" htmlFor="browse-genre">Genre</label>
            <select id="browse-genre" value={genre} onChange={(event) => applyFilters({ genre: event.target.value })}
              className="h-11 rounded-full border border-border/70 bg-background/60 px-4 text-sm">
              <option value="">All genres</option>
              {GENRES.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <label className="sr-only" htmlFor="browse-sort">Sort</label>
            <select id="browse-sort" value={sort} onChange={(event) => { setLetter(""); applyFilters({ sort: event.target.value }); }}
              className="h-11 rounded-full border border-border/70 bg-background/60 px-4 text-sm" disabled={Boolean(committedQuery)}>
              {SORTS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </div>
        </PageHeader>

        <div className="mx-auto w-full max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-10">
          <div className="mb-7 rounded-2xl border border-border/70 bg-card/55 p-3 shadow-xl backdrop-blur-xl sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[.25em] text-muted-foreground">Browse by letter</p>
              <button type="button" onClick={() => setLetter("")} className="text-xs text-primary hover:underline">Show all</button>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {ALPHABET.map((char) => (
                <button key={char} type="button" onClick={() => { setLetter((current) => current === char ? "" : char); document.getElementById("anime-results")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                  aria-pressed={letter === char}
                  className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-xs font-semibold transition sm:h-10 sm:min-w-10 ${letter === char ? "border-rose-400 bg-rose-500 text-white shadow-[0_0_22px_rgba(244,63,94,.25)]" : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/60 hover:text-foreground"}`}>
                  {char}
                </button>
              ))}
            </div>
          </div>

          <div id="anime-results" className="mb-5 flex items-center justify-between gap-3 text-xs uppercase tracking-[.16em] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {loading && items.length === 0 ? "Loading anime…" : letter ? `${visibleItems.length} titles · letter ${letter}` : `${total || items.length} titles${total && items.length < total ? ` · showing ${items.length}` : ""}`}
            </span>
            {(committedQuery || genre || letter) && <button type="button" onClick={() => { setLetter(""); clearAllFilters(); }} className="transition hover:text-primary">Clear filters</button>}
          </div>

          {error ? (
            <EmptyState icon={Search} title="The catalogue could not be reached" body={error} actionLabel="Retry" onAction={retry} />
          ) : loading && items.length === 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={index} />)}</div>
          ) : visibleItems.length === 0 && !(letter && hasNext) ? (
            <EmptyState title={letter ? `No loaded titles begin with “${letter}”` : "No anime found for this search"}
              body={letter ? "Load another catalogue page to look for more titles with this letter." : `No matching anime was found for “${committedQuery}” across the available catalogues. Try another spelling or clear the filters.`}
              actionLabel={letter ? "Load more titles" : "Clear filters"} onAction={letter ? loadMore : clearAllFilters} />
          ) : (
            <>
              {visibleItems.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{visibleItems.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}</div>}
              {hasNext && <div className="mt-9 flex justify-center">
                <button type="button" onClick={loadMore} disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm transition hover:border-primary/60 hover:text-primary disabled:opacity-50">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Load more titles
                </button>
              </div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
