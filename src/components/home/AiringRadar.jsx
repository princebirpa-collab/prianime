import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarClock, Clock3, RadioTower } from "lucide-react";
import { useAnimeList } from "@/hooks/useAnime";
import { currentSeason } from "@/lib/animeApi";

const REFERENCES = [
  { label: "AnimeSchedule", href: "https://animeschedule.net/" },
  { label: "LiveChart", href: "https://www.livechart.me/schedule" },
  { label: "Anime-Planet", href: "https://www.anime-planet.com/" },
  { label: "AnimeCorner", href: "https://animecorner.me/db/anime/calendar" },
];

function airingDate(seconds) {
  if (!Number.isFinite(seconds)) return "Time unavailable";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(Date.now() + seconds * 1000));
}

function countdown(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "Schedule updating";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days) return `In ${days}d ${hours}h`;
  if (hours) return `In ${hours}h ${minutes}m`;
  return `In ${Math.max(1, minutes)}m`;
}

export default function AiringRadar() {
  const [jikanItems, setJikanItems] = useState([]);
  const [jikanLoading, setJikanLoading] = useState(false);
  const [jikanSource, setJikanSource] = useState("");
  const season = currentSeason();
  const { items, loading } = useAnimeList({
    action: "seasonal",
    season: season.season,
    year: season.year,
    perPage: 25,
  });


  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function loadJikanFallback() {
      setJikanLoading(true);
      try {
        let payload = await fetch("/api/jikan-anime?action=seasonal&page=1", {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        }).then((response) => {
          if (!response.ok) throw new Error("Jikan seasonal feed unavailable");
          return response.json();
        });
        let entries = Array.isArray(payload?.data) ? payload.data : [];
        let source = "Jikan current season";
        if (!entries.length) {
          payload = await fetch("/api/jikan-anime?action=upcoming&page=1", {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }).then((response) => {
            if (!response.ok) throw new Error("Jikan upcoming feed unavailable");
            return response.json();
          });
          entries = Array.isArray(payload?.data) ? payload.data : [];
          source = "Jikan upcoming season";
        }
        if (active) {
          setJikanItems(entries.filter((entry) => Number.isSafeInteger(Number(entry?.mal_id)) && entry?.mal_id > 0).slice(0, 6));
          setJikanSource(source);
        }
      } catch {
        if (active && !controller.signal.aborted) {
          setJikanItems([]);
          setJikanSource("");
        }
      } finally {
        if (active) setJikanLoading(false);
      }
    }
    loadJikanFallback();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const jikanCards = useMemo(() => jikanItems.map((anime) => ({
    id: `mal-${anime.mal_id}`,
    title: anime.title_english || anime.title || "Untitled anime",
    image: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || "",
    detail: anime.broadcast?.string || (anime.status === "Currently Airing" ? "Currently airing" : anime.status || "Seasonal listing"),
    episodes: anime.episodes,
  })), [jikanItems]);

  const upcoming = useMemo(
    () => items
      .filter((anime) => anime?.id && anime?.nextEpisode?.timeUntilAiring != null)
      .sort((a, b) => a.nextEpisode.timeUntilAiring - b.nextEpisode.timeUntilAiring)
      .slice(0, 6),
    [items]
  );

  return (
    <section id="airing-radar" className="mx-auto w-full max-w-[1600px] scroll-mt-24 px-4 pt-14 sm:px-6 lg:px-10">
      <div className="overflow-hidden rounded-[1.75rem] border border-primary/20 bg-[radial-gradient(ellipse_at_92%_0%,hsl(var(--primary)/.13),transparent_42%),linear-gradient(135deg,hsl(var(--card)/.96),hsl(var(--background)))]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.07] px-5 py-6 sm:px-8">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.3em] text-primary">
              <RadioTower className="h-3.5 w-3.5" /> Live release intelligence
            </p>
            <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Airing radar</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Upcoming episodes for the current season, ordered by their next scheduled release.
            </p>
          </div>
          <Link to="/browse?sort=seasonal" className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/10">
            Explore this season <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 sm:p-8">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-xl bg-white/[0.04]" />)}
          </div>
        ) : upcoming.length ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {upcoming.map((anime) => (
              <Link key={anime.id} to={`/anime/${anime.id}`} className="group flex min-w-0 gap-3 rounded-xl border border-white/[0.07] bg-black/20 p-3 transition hover:border-primary/35 hover:bg-primary/[0.05]">
                <img src={anime.cover} alt="" loading="lazy" className="h-24 w-16 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0 flex-1 py-1">
                  <span className="block line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">{anime.display}</span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                    <CalendarClock className="h-3.5 w-3.5" /> Episode {anime.nextEpisode.episode}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" /> {countdown(anime.nextEpisode.timeUntilAiring)}
                  </span>
                  <span className="mt-1 block truncate text-[10px] text-muted-foreground/75">{airingDate(anime.nextEpisode.timeUntilAiring)}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : jikanCards.length ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {jikanCards.map((anime) => (
              <Link key={anime.id} to={`/anime/${anime.id}`} className="group flex min-w-0 gap-3 rounded-xl border border-white/[0.07] bg-black/20 p-3 transition hover:border-primary/35 hover:bg-primary/[0.05]">
                {anime.image ? <img src={anime.image} alt="" loading="lazy" className="h-24 w-16 shrink-0 rounded-lg object-cover" /> : <span className="h-24 w-16 shrink-0 rounded-lg bg-white/[0.05]" />}
                <span className="min-w-0 flex-1 py-1">
                  <span className="block line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">{anime.title}</span>
                  <span className="mt-2 block text-[11px] font-semibold text-primary">{anime.detail}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">{anime.episodes ? `${anime.episodes} episodes listed` : "Episode count not announced"}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-sm text-muted-foreground">{jikanLoading ? "Checking the Jikan backup schedule…" : "The airing feed is temporarily unavailable. Browse the seasonal catalogue instead."}</div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.07] px-5 py-4 sm:px-8">
          <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-muted-foreground">Schedule references</span>
          {REFERENCES.map((source) => (
            <a key={source.label} href={source.href} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground underline decoration-white/20 underline-offset-4 transition hover:text-primary">
              {source.label}
            </a>
          ))}
          <span className="ml-auto text-[10px] text-muted-foreground/60">Times shown in your device timezone · {upcoming.length ? "AniList feed" : jikanSource || "Schedule feeds"}</span>
        </div>
      </div>
    </section>
  );
}
