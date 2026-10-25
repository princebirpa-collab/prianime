import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Loader2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import VideoCard from "@/components/video/VideoCard";
import VidstuckSource from "@/components/video/VidstuckSource";
import AkaSource from "@/components/video/AkaSource";
import AnimeScreening from "@/components/video/AnimeScreening";
import EmptyState from "@/components/common/EmptyState";
import { listProgress } from "@/lib/library";
import { percent } from "@/lib/format";

export default function Videos() {
  const [params] = useSearchParams();
  const requestedAnime = Number(params.get("anime"));
  const animeId = Number.isSafeInteger(requestedAnime) && requestedAnime > 0 && requestedAnime <= 100000000 ? requestedAnime : null;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({});
  const [showVidstuck, setShowVidstuck] = useState(() => new URLSearchParams(window.location.search).get("source") === "vidstuck");
  const [showAka, setShowAka] = useState(() => new URLSearchParams(window.location.search).get("source") === "aka");

  useEffect(() => {
    if (animeId) return;
    let alive = true;
    const timer = setTimeout(() => {
      setLoading(true);
      const filter = { status: "published" };
      if (query.trim()) filter.title = { $regex: query.trim(), $options: "i" };
      base44.entities.Video.filter(filter, { sort: "-created_date", limit: 48 })
        .then((page) => {
          if (!alive) return;
          setVideos(page.items || []);
          setError("");
        })
        .catch((loadError) => alive && setError(loadError.message))
        .finally(() => alive && setLoading(false));
    }, 300);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query, animeId]);

  useEffect(() => {
    if (animeId) return;
    listProgress("video")
      .then((rows) => {
        const map = {};
        rows.forEach((row) => {
          map[row.ref_id] = percent(row.position, row.duration);
        });
        setProgress(map);
      })
      .catch(() => setProgress({}));
  }, [animeId]);

  if (animeId) return <AnimeScreening key={animeId} animeId={animeId} />;

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Theatre"
        title="Long-form screenings"
        description="Full episodes, original shorts and manhwa-style films published by creators â€” played from licensed sources only."
      >
        <button
          type="button"
          aria-pressed={showVidstuck}
          onClick={() => setShowVidstuck((visible) => !visible)}
          className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${showVidstuck ? "border-primary bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:border-primary/60 hover:text-primary"}`}
        >
          Vidstuck source
        </button>
        <button
          type="button"
          aria-pressed={showAka}
          onClick={() => setShowAka((visible) => !visible)}
          className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${showAka ? "border-primary bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:border-primary/60 hover:text-primary"}`}
        >
          Aka source
        </button>
        <Link
          to="/creator"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Publish
        </Link>
        <div className="flex h-11 items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="video-search" className="sr-only">
            Search videos
          </label>
          <input
            id="video-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the theatreâ€¦"
            className="w-44 bg-transparent text-sm outline-none"
          />
        </div>
      </PageHeader>

      <div className="mx-auto w-full max-w-[1600px] px-4 pt-8 sm:px-6 lg:px-10">
        {showVidstuck && <VidstuckSource />}
        {showAka && <AkaSource />}
        {error ? (
          <EmptyState title="The theatre could not be loaded" body={error} />
        ) : loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-border/40">
                <div className="aspect-video animate-pulse bg-muted" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-1/3 animate-pulse rounded bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <EmptyState
            icon={Loader2}
            title={query ? "Nothing matched that search" : "No screenings yet"}
            body={query ? "Try a different word." : "Publish the first video from the creator studio."}
            actionLabel={query ? undefined : "Open creator studio"}
            actionTo={query ? undefined : "/creator"}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} progress={progress[video.id] || 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
