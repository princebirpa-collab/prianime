import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, ListVideo, Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import VideoPlayer from "@/components/video/VideoPlayer";
import EmptyState from "@/components/common/EmptyState";
import ReportDialog from "@/components/common/ReportDialog";
import { saveProgress, listProgress } from "@/lib/library";
import { formatClock, relativeDate } from "@/lib/format";

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startAt, setStartAt] = useState(0);
  const lastSaved = useRef(0);
  const counted = useRef(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setStartAt(0);
    base44.entities.Video.get(id)
      .then(async (row) => {
        if (!alive) return;
        setVideo(row);
        setLoading(false);
        const [progressRows, siblings] = await Promise.all([
          listProgress("video").catch(() => []),
          base44.entities.Video.filter({ status: "published" }, { sort: "-created_date", limit: 24 }).catch(() => ({ items: [] })),
        ]);
        if (!alive) return;
        const mine = progressRows.find((entry) => entry.ref_id === String(row.id));
        if (mine?.position) setStartAt(mine.position);
        setRelated((siblings.items || []).filter((item) => item.id !== row.id).slice(0, 6));
        if (!counted.current) {
          counted.current = true;
          base44.entities.Video.update(row.id, { views: (row.views || 0) + 1 }).catch(() => {});
        }
      })
      .catch((loadError) => {
        if (!alive) return;
        setError(loadError.message || "This video could not be found.");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const handleProgress = (position, duration) => {
    if (!video) return;
    const now = Date.now();
    if (now - lastSaved.current < 5000) return;
    lastSaved.current = now;
    saveProgress({
      kind: "video",
      ref_id: video.id,
      title: video.title,
      cover: video.thumbnail_url,
      episode: video.episode_number || 1,
      position,
      duration,
      link: `/watch/${video.id}`,
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          title="This screening is unavailable"
          body={error || "The video may have been unpublished."}
          actionLabel="Back to the theatre"
          actionTo="/watch"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <VideoPlayer
            src={video.video_url}
            title={video.title}
            poster={video.thumbnail_url}
            subtitles={video.subtitles_url}
            startAt={startAt}
            onProgress={handleProgress}
          />

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.26em] text-primary">{video.category || "Screening"}</p>
              <h1 className="mt-2 font-display text-3xl font-medium leading-tight sm:text-4xl">{video.title}</h1>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {[video.creator_name, video.licence, relativeDate(video.created_date), video.duration ? formatClock(video.duration) : null]
                  .filter(Boolean)
                  .join(" Â· ")}
              </p>
              {video.description && (
                <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">{video.description}</p>
              )}
              {video.tags?.length > 0 && (
                <p className="mt-4 flex flex-wrap gap-1.5">
                  {video.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </p>
              )}
            </div>

            <ReportDialog
              targetType="video"
              targetId={video.id}
              targetLabel={video.title}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                >
                  <Flag className="h-3.5 w-3.5" aria-hidden="true" /> Report
                </button>
              }
            />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <ListVideo className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="font-display text-lg">Up next</h2>
          </div>
          <div className="mt-3 space-y-2">
            {related.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">No other screenings are published yet.</p>
            ) : (
              related.map((item) => (
                <Link
                  key={item.id}
                  to={`/watch/${item.id}`}
                  className="flex gap-3 rounded-xl border border-transparent p-2 transition hover:border-border/60 hover:bg-card/50"
                >
                  <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-[13px] leading-snug text-foreground">{item.title}</span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {item.category || "Screening"}
                    </span>
                  </span>
                </Link>
              ))
            )}
          </div>

          <Link
            to="/watch"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-border/70 px-4 py-2.5 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary"
          >
            All screenings
          </Link>
        </aside>
      </div>
    </div>
  );
}
