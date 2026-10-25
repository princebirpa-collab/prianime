import { useCallback, useEffect, useState } from "react";
import { callAniList } from "@/lib/animeApi";

export function useAnimeList(body, enabled = true) {
  const key = JSON.stringify(body);
  const [state, setState] = useState({ items: [], loading: enabled, error: null, pageInfo: null });

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    callAniList(JSON.parse(key))
      .then((data) => {
        if (!alive) return;
        setState({ items: data.items || [], loading: false, error: null, pageInfo: data.pageInfo || null });
      })
      .catch((error) => {
        if (!alive) return;
        setState({ items: [], loading: false, error: error.message, pageInfo: null });
      });
    return () => {
      alive = false;
    };
  }, [key, enabled]);

  return state;
}

export function useAnimeDetail(id) {
  const [state, setState] = useState({ item: null, loading: true, error: null });

  const reload = useCallback(() => {
    if (!id) return;
    setState({ item: null, loading: true, error: null });
    callAniList({ action: "by_id", id })
      .then((data) => setState({ item: data.item, loading: false, error: null }))
      .catch((error) => setState({ item: null, loading: false, error: error.message }));
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}

export function usePaginatedAnime(body) {
  const key = JSON.stringify(body);
  const [page, setPage] = useState(1);
  const [retryNonce, setRetryNonce] = useState(0);
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: null, hasNext: false, total: 0 });

  // A new query, genre or sort always restarts from page 1 and clears the
  // previous list before the fresh request goes out.
  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [key]);

  useEffect(() => {
    let alive = true; // stale responses of outdated requests can never overwrite newer results
    setState((prev) => ({ ...prev, loading: true, error: null }));
    callAniList({ ...JSON.parse(key), page })
      .then((data) => {
        if (!alive) return;
        setItems((prev) => (page === 1 ? data.items || [] : [...prev, ...(data.items || [])]));
        setState({
          loading: false,
          error: null,
          hasNext: Boolean(data.pageInfo?.hasNextPage),
          total: data.pageInfo?.total || 0,
        });
      })
      .catch((error) => {
        if (!alive) return;
        // A failed request is an error state, never a zero-results state.
        const offline = typeof navigator !== "undefined" && !navigator.onLine;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: offline
            ? "You appear to be offline. Check your connection, then retry."
            : error.message,
        }));
      });
    return () => {
      alive = false;
    };
  }, [key, page, retryNonce]);

  const loadMore = useCallback(() => setPage((current) => current + 1), []);
  const retry = useCallback(() => setRetryNonce((current) => current + 1), []);

  return { items, ...state, loadMore, retry, reset: () => setPage(1) };
}
