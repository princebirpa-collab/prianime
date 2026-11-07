import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, PlayCircle } from "lucide-react";
import { listProgress } from "@/lib/library";
import { percent } from "@/lib/format";

function clock(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function AnimeWatchHistory() {
  const [rows, setRows] = useState([]);
  const refresh = useCallback(() => {
    listProgress("anime").then(setRows).catch(() => setRows([]));
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
            const episode = row.actual_episode || row.episode;
            const progress = percent(row.position, row.duration);
            const target = `/watch?anime=${encodeURIComponent(row.ref_id)}&season=${row.season || 1}&episode=${episode || 1}`;
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
