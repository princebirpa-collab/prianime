import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Heart, History, BookOpen, Trash2, Copy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import AnimeCard from "@/components/anime/AnimeCard";
import EmptyState from "@/components/common/EmptyState";
import { listSaved, listProgress, clearProgress } from "@/lib/library";
import { getProfile } from "@/lib/profile";
import { percent, relativeDate } from "@/lib/format";

const TABS = [
  { id: "watchlist", label: "Watchlist", icon: Bookmark },
  { id: "favorite", label: "Favorites", icon: Heart },
  { id: "continue", label: "Continue", icon: History },
  { id: "recent", label: "Recently viewed", icon: History },
  { id: "stories", label: "Scripts", icon: BookOpen },
];

export default function Library() {
  const [tab, setTab] = useState("watchlist");
  const [saved, setSaved] = useState({ watchlist: [], favorite: [] });
  const [progress, setProgress] = useState({ video: [], anime: [] });
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [watchlist, favorite, videos, anime, storyPage] = await Promise.all([
      listSaved("watchlist").catch(() => []),
      listSaved("favorite").catch(() => []),
      listProgress("video").catch(() => []),
      listProgress("anime").catch(() => []),
      base44.entities.Story.filter({ owner_ref: getProfile().id }, { sort: "-created_date", limit: 40 }).catch(() => ({ items: [] })),
    ]);
    setSaved({ watchlist, favorite });
    setProgress({ video: videos, anime });
    setStories(storyPage.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeProgress = async (id) => {
    await clearProgress(id);
    setProgress((prev) => ({
      video: prev.video.filter((row) => row.id !== id),
      anime: prev.anime.filter((row) => row.id !== id),
    }));
  };

  const removeStory = async (id) => {
    await base44.entities.Story.delete(id);
    setStories((prev) => prev.filter((story) => story.id !== id));
  };

  const toCard = (row) => ({
    id: row.anime_id,
    display: row.title,
    cover: row.cover,
    banner: row.banner,
    score: row.score,
    episodes: row.episodes,
    format: row.format,
    genres: row.genres || [],
    seasonYear: null,
  });

  const grid = saved[tab] || [];
  const continueRows = tab === "continue"
    ? [
        ...progress.anime.map((row) => ({ ...row, sourceKind: "anime" })),
        ...progress.video.map((row) => ({ ...row, sourceKind: "video" })),
      ].sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0))
    : tab === "recent" ? progress.anime : [];

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Your library"
        title="Everything you keep"
        description="Saved titles, playback history and scripts live on this device profile â€” no account required."
      />

      <div className="mx-auto w-full max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-10">
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border/50 pb-2" role="tablist">
          {TABS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={tab === option.id}
              onClick={() => setTab(option.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs transition ${
                tab === option.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <option.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>

        <div className="pt-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : tab === "watchlist" || tab === "favorite" ? (
            grid.length === 0 ? (
              <EmptyState
                icon={tab === "watchlist" ? Bookmark : Heart}
                title={tab === "watchlist" ? "Your watchlist is empty" : "No favorites yet"}
                body="Tap the bookmark on any anime page and it will be waiting here."
                actionLabel="Find something to keep"
                actionTo="/browse"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {grid.map((row) => (
                  <AnimeCard key={row.id} anime={toCard(row)} />
                ))}
              </div>
            )
          ) : tab === "stories" ? (
            stories.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No saved scripts"
                body="Generate a story in the AI atelier and save it â€” it will appear here."
                actionLabel="Open the atelier"
                actionTo="/studio"
              />
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {stories.map((story) => (
                  <article key={story.id} className="rounded-2xl border border-border/50 bg-card/40 p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {story.kind} Â· {story.language} Â· {relativeDate(story.created_date)}
                    </p>
                    <h3 className="mt-1.5 font-display text-lg leading-snug">{story.title}</h3>
                    <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">{story.script}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(story.script)}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-primary"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStory(story.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : continueRows.length === 0 ? (
            <EmptyState
              icon={History}
              title={tab === "continue" ? "Nothing in progress" : "No viewing history yet"}
              body="Play something in the theatre and your position will be remembered here."
              actionLabel="Open the theatre"
              actionTo="/watch"
            />
          ) : (
            <div className="grid gap-2">
              {continueRows.map((row) => (
                <div key={row.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 p-3">
                  <Link
                    to={tab === "continue" ? (row.sourceKind === "anime" ? (row.link || `/watch?anime=${row.ref_id}&episode=${row.episode || 1}`) : `/watch/${row.ref_id}`) : `/anime/${row.ref_id}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span className="h-14 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                      {row.cover ? <img src={row.cover} alt="" className="h-full w-full object-cover" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 block text-sm text-foreground">{row.title}</span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {row.episode ? `Episode ${row.episode} Â· ` : ""}
                        {row.duration ? `${Math.round(percent(row.position, row.duration))}% watched` : "Viewed"}
                      </span>
                      <span className="mt-1 block h-0.5 w-32 overflow-hidden rounded-full bg-white/15">
                        <span className="block h-full bg-primary" style={{ width: `${percent(row.position, row.duration)}%` }} />
                      </span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeProgress(row.id)}
                    aria-label="Remove from history"
                    className="text-muted-foreground transition hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
