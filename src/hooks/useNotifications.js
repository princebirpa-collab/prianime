import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const SEEN_KEY = "pri-anime:seen-notifications";

/**
 * Notifications are derived from real app state: finished AI render jobs and
 * the newest published reels. Nothing is invented â€” an empty account shows an
 * empty tray.
 */
export function useNotifications() {
  const [items, setItems] = useState([]);
  const [seenAt, setSeenAt] = useState(() => localStorage.getItem(SEEN_KEY) || "");

  const load = useCallback(async () => {
    try {
      const [jobs, reels] = await Promise.all([
        base44.entities.VideoJob.list("-created_date", 5),
        base44.entities.Reel.filter({ status: "published" }, { sort: "-created_date", limit: 4 }),
      ]);

      const jobItems = (Array.isArray(jobs) ? jobs : jobs?.items || [])
        .filter((job) => job.status === "completed" || job.status === "failed")
        .map((job) => ({
          id: `job-${job.id}`,
          title: job.status === "completed" ? "Your AI film is ready" : "A render job failed",
          body:
            job.status === "completed"
              ? `${job.style || "Cinematic"} Â· ${job.aspect_ratio || "16:9"}`
              : job.error || "The provider rejected the request.",
          to: "/creator",
          at: job.updated_date || job.created_date,
        }));

      const reelItems = (reels?.items || []).map((reel) => ({
        id: `reel-${reel.id}`,
        title: "New reel in the vortex",
        body: `${reel.title} â€” ${reel.creator_name || "creators"}`,
        to: "/reels",
        at: reel.created_date,
      }));

      setItems(
        [...jobItems, ...reelItems]
          .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
          .slice(0, 8)
      );
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  const unread = items.filter((item) => !seenAt || new Date(item.at || 0) > new Date(seenAt)).length;

  useEffect(() => {
    if (items.length && !seenAt) {
      const now = new Date().toISOString();
      localStorage.setItem(SEEN_KEY, now);
    }
  }, [items, seenAt]);

  return { items, unread };
}

export default useNotifications;
