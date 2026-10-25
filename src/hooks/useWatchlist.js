import { useCallback, useEffect, useState } from "react";
import { listSaved, toggleSaved } from "@/lib/library";

export function useWatchlist(kind) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const rows = await listSaved(kind);
      setItems(rows);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isSaved = useCallback(
    (animeId) => items.some((row) => row.anime_id === animeId),
    [items]
  );

  const toggle = useCallback(
    async (anime) => {
      const active = await toggleSaved(anime, kind);
      await refresh();
      return active;
    },
    [kind, refresh]
  );

  return { items, loading, isSaved, toggle, refresh };
}
