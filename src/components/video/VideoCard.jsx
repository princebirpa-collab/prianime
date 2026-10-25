import { Link } from "react-router-dom";
import { Play, Clock } from "lucide-react";
import { Image } from "@/components/ui/image";
import { formatClock, formatCount } from "@/lib/format";

export default function VideoCard({ video, progress }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border/50 bg-card/50 glow-hover">
      <Link to={`/watch/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={video.thumbnail_url || ""}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-primary/70 bg-black/50 backdrop-blur">
              <Play className="ml-0.5 h-4 w-4 fill-primary text-primary" aria-hidden="true" />
            </span>
          </span>
          {video.duration ? (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[11px] text-white">
              <Clock className="h-2.5 w-2.5" aria-hidden="true" />
              {formatClock(video.duration)}
            </span>
          ) : null}
          {progress > 0 ? (
            <span className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
              <span className="block h-full bg-primary" style={{ width: `${Math.min(100, progress)}%` }} />
            </span>
          ) : null}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/watch/${video.id}`}>
          <h3 className="line-clamp-2 font-display text-lg leading-snug text-foreground transition group-hover:text-primary">
            {video.title}
          </h3>
        </Link>
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {[video.category, video.creator_name, video.views ? `${formatCount(video.views)} views` : null]
            .filter(Boolean)
            .join(" Â· ")}
        </p>
      </div>
    </article>
  );
}

================================================================================
