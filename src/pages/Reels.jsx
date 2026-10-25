import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Plus, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReelCard from "@/components/reels/ReelCard";
import ReelComments from "@/components/reels/ReelComments";
import ReelUploadDialog from "@/components/reels/ReelUploadDialog";
import { getProfile } from "@/lib/profile";

const PAGE_SIZE = 4;

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [commenting, setCommenting] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [saved, setSaved] = useState({ likes: {}, bookmarks: {} });
  const [message, setMessage] = useState("");

  const feedRef = useRef(null);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const viewedRef = useRef(new Set());

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const options = { sort: "-created_date", limit: PAGE_SIZE };
      if (cursor) options.cursor = cursor;
      const page = await base44.entities.Reel.filter({ status: "published" }, options);
      setReels((prev) => {
        const known = new Set(prev.map((row) => row.id));
        return [...prev, ...(page.items || []).filter((row) => !known.has(row.id))];
      });
      setCursor(page.next_cursor || null);
      setHasMore(Boolean(page.has_more));
      setError("");
    } catch (loadError) {
      setError(loadError.message || "The reel feed could not be loaded.");
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [cursor, hasMore]);

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    base44.entities.ReelLike.filter({ owner_ref: getProfile().id }, { limit: 300 })
      .then((page) => {
        const likes = {};
        const bookmarks = {};
        (page.items || []).forEach((row) => {
          if (row.kind === "bookmark") bookmarks[row.reel_id] = row.id;
          else likes[row.reel_id] = row.id;
        });
        setSaved({ likes, bookmarks });
      })
      .catch(() => setSaved({ likes: {}, bookmarks: {} }));
  }, []);

  useEffect(() => {
    const root = feedRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            setActiveId(entry.target.getAttribute("data-reel"));
          }
        });
      },
      { root, threshold: [0.55] }
    );
    root.querySelectorAll("[data-reel]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [reels.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = feedRef.current;
    if (!sentinel || !root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root, rootMargin: "600px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    if (!activeId || viewedRef.current.has(activeId)) return;
    viewedRef.current.add(activeId);
    const reel = reels.find((row) => row.id === activeId);
    if (!reel) return;
    base44.entities.Reel.update(reel.id, { views: (reel.views || 0) + 1 }).catch(() => {});
  }, [activeId, reels]);

  const toggleReaction = async (reel, kind) => {
    const store = kind === "bookmark" ? saved.bookmarks : saved.likes;
    const existingId = store[reel.id];
    try {
      if (existingId) {
        await base44.entities.ReelLike.delete(existingId);
        setSaved((prev) => {
          const next = { ...prev[kind === "bookmark" ? "bookmarks" : "likes"] };
          delete next[reel.id];
          return { ...prev, [kind === "bookmark" ? "bookmarks" : "likes"]: next };
        });
        if (kind === "like") {
          await base44.entities.Reel.update(reel.id, { likes: Math.max(0, (reel.likes || 0) - 1) });
          setReels((prev) => prev.map((row) => (row.id === reel.id ? { ...row, likes: Math.max(0, (row.likes || 0) - 1) } : row)));
        }
      } else {
        const created = await base44.entities.ReelLike.create({
          reel_id: reel.id,
          owner_ref: getProfile().id,
          kind: kind === "bookmark" ? "bookmark" : "like",
        });
        setSaved((prev) => ({
          ...prev,
          [kind === "bookmark" ? "bookmarks" : "likes"]: { ...prev[kind === "bookmark" ? "bookmarks" : "likes"], [reel.id]: created.id },
        }));
        if (kind === "like") {
          await base44.entities.Reel.update(reel.id, { likes: (reel.likes || 0) + 1 });
          setReels((prev) => prev.map((row) => (row.id === reel.id ? { ...row, likes: (row.likes || 0) + 1 } : row)));
        }
      }
    } catch (reactionError) {
      setMessage(reactionError.message || "That action did not save.");
    }
  };

  const share = async (reel) => {
    const url = `${window.location.origin}/reels?reel=${reel.id}`;
    try {
      if (navigator.share) await navigator.share({ title: reel.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setMessage("Link copied to clipboard.");
      }
    } catch {
      setMessage("Sharing was cancelled.");
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-0 right-0 top-4 z-20 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/60 bg-black/50 px-4 py-2 backdrop-blur">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/70">Reel vortex</span>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
          >
            <Plus className="h-3 w-3" aria-hidden="true" /> Upload
          </button>
        </div>
      </div>

      {message && (
        <div className="absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-xs text-white backdrop-blur">
          {message}
        </div>
      )}

      <div
        ref={feedRef}
        className="h-[calc(100dvh-4rem)] snap-y snap-mandatory overflow-y-auto overscroll-contain bg-black"
        aria-label="Vertical reels feed"
      >
        {reels.map((reel) => (
          <div key={reel.id} data-reel={reel.id}>
            <ReelCard
              reel={reel}
              active={activeId === reel.id}
              liked={Boolean(saved.likes[reel.id])}
              bookmarked={Boolean(saved.bookmarks[reel.id])}
              onLike={(item) => toggleReaction(item, "like")}
              onBookmark={(item) => toggleReaction(item, "bookmark")}
              onComment={(item) => setCommenting(item)}
              onShare={share}
            />
          </div>
        ))}

        {loading && (
          <div className="grid h-[calc(100dvh-4rem)] place-items-center text-white/60">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!loading && error && (
          <div className="grid h-[calc(100dvh-4rem)] place-items-center px-8 text-center">
            <div>
              <AlertTriangle className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
              <p className="mt-3 font-display text-xl text-white">The feed is quiet</p>
              <p className="mt-1 max-w-sm text-sm text-white/60">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setHasMore(true);
                  loadMore();
                }}
                className="mt-4 rounded-full border border-white/25 px-5 py-2 text-sm text-white transition hover:border-primary hover:text-primary"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && reels.length === 0 && (
          <div className="grid h-[calc(100dvh-4rem)] place-items-center px-8 text-center">
            <div>
              <p className="font-display text-2xl text-white">No reels yet</p>
              <p className="mt-2 max-w-sm text-sm text-white/60">
                Be the first â€” upload a clip you own or have a licence for.
              </p>
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Upload a reel
              </button>
            </div>
          </div>
        )}

        <div ref={sentinelRef} className="h-1 w-full" />
      </div>

      <ReelComments reel={commenting} open={Boolean(commenting)} onOpenChange={(next) => !next && setCommenting(null)} />

      <ReelUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => {
          setReels([]);
          setCursor(null);
          setHasMore(true);
          setUploadOpen(false);
          loadMore();
        }}
      />
    </div>
  );
}

================================================================================
