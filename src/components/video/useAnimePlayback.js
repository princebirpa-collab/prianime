import { useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getProfile } from "@/lib/profile";
import { listProgress, saveProgress } from "@/lib/library";
import { communityRequest } from "@/lib/communityApi";
import { buildVidstuckUrl } from "@/components/video/vidstuckUrls";

function coordinate(value, min) {
  if (value == null || value === "") return undefined;
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= 9999 ? number : undefined;
}

export default function useAnimePlayback(anime, match) {
  const [params, setParams] = useSearchParams();
  const lastSaved = useRef(0);
  const ownerRef = getProfile().id;
  const history = useQuery({
    queryKey: ["anime-playback-resume", anime.id, ownerRef],
    queryFn: async () => {
      try {
        const data = await communityRequest(`/watch-history?profileId=${encodeURIComponent(ownerRef)}`);
        const row = (data.history || []).find((entry) => String(entry.anime_id) === String(anime.id));
        if (row) return { ...row, position: Number(row.position) || 0, duration: Number(row.duration) || 0 };
      } catch {
        // Device-local history remains available if the community API is offline.
      }
      const local = await listProgress("anime");
      return local.find((entry) => String(entry.ref_id) === String(anime.id)) || null;
    },
    retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: true,
  });
  const save = useMutation({
    mutationFn: async (entry) => {
      const local = await saveProgress(entry);
      try {
        await communityRequest("/watch-history", { method: "POST", body: {
          profileId: ownerRef, displayName: getProfile().name, animeId: String(anime.id),
          title: anime.display, cover: anime.cover || "", season: entry.season, episode: entry.actualEpisode,
          position: entry.position, duration: entry.duration, link: entry.link,
        }});
      } catch {
        // Keep local progress as a resilient fallback.
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
  const startAt = sameEpisode && saved?.duration - saved?.position > 10 ? saved.position : 0;
  const link = (s, e) => `/watch?anime=${anime.id}&season=${s}&episode=${e}`;
  const selectEpisode = (s, e) => {
    const next = new URLSearchParams(params);
    next.set("season", String(s)); next.set("episode", String(e));
    lastSaved.current = 0;
    setParams(next);
  };
  const onProgress = (position, duration, detail = {}) => {
    const now = Date.now();
    if (now - lastSaved.current < 5000 || save.isPending) return;
    lastSaved.current = now;
    const s = detail.season ?? season;
    const e = detail.episode ?? episode;
    save.mutate({ kind: "anime", ref_id: anime.id, title: anime.display, cover: anime.cover, episode: s === match.season ? Math.max(1, e - match.episodeOffset) : e, season: s, actualEpisode: e, position, duration, link: link(s, e) });
  };
  return {
    season, episode, startAt, selectEpisode, onProgress,
    src: buildVidstuckUrl({ ...match, season, episode }),
    ready: !history.isPending,
    historyError: history.error || save.error,
  };
}
