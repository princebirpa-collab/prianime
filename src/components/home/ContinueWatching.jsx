import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { Image } from "@/components/ui/image";
import { listProgress } from "@/lib/library";
import { percent } from "@/lib/format";

export default function ContinueWatching() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([listProgress("video"), listProgress("anime")])
      .then(([videos, anime]) => {
        if (!alive) return;
        const merged = [...videos, ...anime]
          .filter((row) => row.title)
          .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
          .slice(0, 10);
        setRows(merged);
      })
      .catch(() => setRows([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading || rows.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 pt-14 sm:px-6 lg:px-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Pick up where you left off</p>
          <h2 className="mt-2 font-display text-2xl font-medium sm:text-3xl">Continue watching</h2>
        </div>
        <Link to="/library" className="text-xs uppercase tracking-[0.16em] text-muted-foreground transition hover:text-primary">
          Library
        </Link>
      </div>

      <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto pb-1">
        {rows.map((row) => (
          <Link
            key={row.id}
            to={row.link || (row.kind === "anime" ? `/anime/${row.ref_id}` : `/watch/${row.ref_id}`)}
            className="group w-[220px] shrink-0 overflow-hidden rounded-xl border border-border/50 bg-card/50 glow-hover"
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              {row.cover ? (
                <Image src={row.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-secondary to-background" />
              )}
              <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition group-hover:opacity-100">
                <Play className="h-5 w-5 fill-primary text-primary" aria-hidden="true" />
              </span>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20">
                <span className="block h-full bg-primary" style={{ width: `${percent(row.position, row.duration)}%` }} />
              </span>
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm text-foreground">{row.title}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {row.episode ? `Episode ${row.episode}` : row.kind === "anime" ? "Browsing" : "Video"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
