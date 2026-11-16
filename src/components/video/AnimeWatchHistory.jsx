import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, PlayCircle } from "lucide-react";
import { listProgress } from "@/lib/library";
import { percent } from "@/lib/format";
import { communityRequest } from "@/lib/communityApi";
import { getProfile } from "@/lib/profile";

function clock(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function mapCloudRow(row, profileId) {
  return {
    id: `cloud_${row.anime_id}`,
    owner_ref: profileId,
    kind: "anime",
    ref_id: String(row.anime_id),
    title: row.title,
    cover: row.cover,
    episode: Number(row.episode) || 0,
    actual_episode: Number(row.episode) || 0,
    season: Number(row.season) || 1,
    position: Number(row.position) || 0,
    duration: Number(row.duration) || 0,
    link: row.link || "",
    updated_date: row.updated_at,
  };
}

export default function AnimeWatchHistory() {
  const [rows, setRows] = useState([]);
  const refresh = useCallback(async () => {
    const profileId = getProfile().id;
    const [localRows, cloudRows] = await Promise.all([
      listProgress("anime").catch(() => []),
      communityRequest(`/watch-history?profileId=${encodeURIComponent(profileId)}`)
        .then((data) => (data.history || []).map((row) => mapCloudRow(row, profileId)))
        .catch(() => []),
    ]);
    const byAnime = new Map();
    [...localRows, ...cloudRows].forEach((row) => {
      const key = String(row.ref_id);
      const current = byAnime.get(key);
      const nextTime = Date.parse(row.updated_date || "") || 0;
      const currentTime = Date.parse(current?.updated_date || "") || 0;
      if (!current || nextTime >= currentTime) byAnime.set(key, row);
    });
    setRows([...byAnime.values()].sort((a, b) =>
      (Date.parse(b.updated_date || "") || 0) - (Date.parse(a.updated_date || "") || 0)
    ));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("pri-anime:progress-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("pri-anime:progress-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return (
    <section className="mt-8 rounded-2xl border border-border/60 bg-card/35 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h2 className="font-display text-xl">Continue Watching</h2>
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Watch history</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-5 text-sm text-muted-foreground">Your anime progress will appear here as you watch.</p>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {rows.slice(0, 8).map((row) => {
            const episode = Number(row.actual_episode || row.episode) || 0;
            const progress = percent(row.position, row.duration);
            const params = new URLSearchParams({
              anime: String(row.ref_id),
              season: String(Number(row.season) || 1),
              episode: String(episode || 1),
            });
            const target = episode > 0
              ? `/watch?${params.toString()}`
              : row.link || `/anime/${encodeURIComponent(row.ref_id)}`;
            return (
              <Link key={row.id} to={target} className="group flex min-w-0 gap-3 rounded-xl border border-border/50 bg-background/45 p-3 transition hover:border-primary/50">
                <span className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {row.cover ? <img src={row.cover} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center"><PlayCircle className="h-6 w-6 text-muted-foreground" /></span>}
                </span>
                <span className="min-w-0 flex-1 self-center">
                  <span className="block truncate text-sm font-medium group-hover:text-primary">{row.title || "Untitled anime"}</span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    {episode ? `Season ${row.season || 1} · Episode ${episode}` : "Recently viewed"}
                    {row.duration > 0 ? ` · ${clock(row.position)} / ${clock(row.duration)}` : ""}
                  </span>
                  <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
