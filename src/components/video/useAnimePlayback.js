import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getProfile } from "@/lib/profile";
import { listProgress, saveProgress, recordAnimeView } from "@/lib/library";
import { communityRequest } from "@/lib/communityApi";
import { buildVidstuckUrl } from "@/components/video/vidstuckUrls";

function coordinate(value, min) {
  if (value == null || value === "") return undefined;
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= 9999 ? number : undefined;
}

function newestRow(rows) {
  return rows.filter(Boolean).sort((a, b) => {
    const aTime = Date.parse(a.updated_date || a.updated_at || a.created_date || 0) || 0;
    const bTime = Date.parse(b.updated_date || b.updated_at || b.created_date || 0) || 0;
    return bTime - aTime;
  })[0] || null;
}

export default function useAnimePlayback(anime, match) {
  const [params, setParams] = useSearchParams();
  const lastSaved = useRef(0);
  const ownerRef = getProfile().id;

  // Record the title as soon as its watch page opens. This makes Recently
  // viewed reliable even when an embedded provider does not send time updates.
  useEffect(() => {
    if (!anime?.id) return;
    recordAnimeView(anime).catch(() => {});
  }, [anime?.id]);

  const history = useQuery({
    queryKey: ["anime-playback-resume", anime.id, ownerRef],
    queryFn: async () => {
      const [localRows, cloudRows] = await Promise.all([
        listProgress("anime").catch(() => []),
        communityRequest(`/watch-history?profileId=${encodeURIComponent(ownerRef)}`)
          .then((data) => (data.history || []).map((row) => ({
            id: `cloud_${row.anime_id}`,
            owner_ref: ownerRef,
            kind: "anime",
            ref_id: String(row.anime_id),
            title: row.title,
            cover: row.cover,
            episode: row.episode,
            actual_episode: row.episode,
            season: row.season,
            position: Number(row.position) || 0,
            duration: Number(row.duration) || 0,
            link: row.link,
            updated_date: row.updated_at,
          })))
          .catch(() => []),
      ]);
      const local = localRows.find((entry) => String(entry.ref_id) === String(anime.id));
      const cloud = cloudRows.find((entry) => String(entry.ref_id) === String(anime.id));
      return newestRow([local, cloud]);
    },
    retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: true,
  });

  const save = useMutation({
    mutationFn: async (entry) => {
      const local = await saveProgress(entry);
      try {
        await communityRequest("/watch-history", { method: "POST", body: {
          profileId: ownerRef, displayName: getProfile().name, animeId: String(anime.id),
          title: anime.display, cover: anime.cover || "", season: entry.season,
          episode: entry.actualEpisode, position: entry.position,
          duration: entry.duration, link: entry.link,
        }});
      } catch {
        // Device-local history remains available when the cloud API is offline.
      }
      return local;
    },
  });

  const saved = history.data;
  const prior = new URLSearchParams(saved?.link?.split("?")[1] || "");
  const explicit = coordinate(params.get("episode"), 1) !== undefined;
  const season = coordinate(params.get("season"), 0) ?? (!explicit ? coordinate(prior.get("season"), 0) : undefined) ?? match.season;
  const episode = coordinate(params.get("episode"), 1) ?? coordinate(prior.get("episode"), 1) ?? Math.max(1, 1 + match.episodeOffset);
  const sameEpisode = Number(prior.get("season")) === season && Number(prior.get("episode")) === episode;
  const startAt = sameEpisode && Number(saved?.duration) - Number(saved?.position) > 10 ? Number(saved.position) : 0;
  const link = (s, e) => `/watch?anime=${anime.id}&season=${s}&episode=${e}`;

  const selectEpisode = (s, e) => {
    const next = new URLSearchParams(params);
    next.set("season", String(s));
    next.set("episode", String(e));
    lastSaved.current = 0;
    setParams(next);
  };

  const onProgress = (position, duration, detail = {}) => {
    const now = Date.now();
    if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0 || position < 0 || now - lastSaved.current < 5000 || save.isPending) return;
    lastSaved.current = now;
    const s = detail.season ?? season;
    const e = detail.episode ?? episode;
    save.mutate({
      kind: "anime", ref_id: anime.id, title: anime.display, cover: anime.cover,
      episode: s === match.season ? Math.max(1, e - match.episodeOffset) : e,
      season: s, actualEpisode: e, position, duration, link: link(s, e),
    });
  };

  return {
    season, episode, startAt, selectEpisode, onProgress,
    src: buildVidstuckUrl({ ...match, season, episode }),
    ready: !history.isPending,
    historyError: history.error || save.error,
  };
}
