import { useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getProfile } from "@/lib/profile";
import { saveProgress } from "@/lib/library";
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
      const page = await base44.entities.Progress.filter({ owner_ref: ownerRef, kind: "anime", ref_id: String(anime.id) }, { limit: 1 });
      return page.items?.[0] || null;
    },
    retry: false, staleTime: Infinity, gcTime: 0, refetchOnWindowFocus: false,
  });
  const save = useMutation({ mutationFn: saveProgress });
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
    save.mutate({ kind: "anime", ref_id: anime.id, title: anime.display, cover: anime.cover, episode: s === match.season ? Math.max(1, e - match.episodeOffset) : e, position, duration, link: link(s, e) });
  };
  return {
    season, episode, startAt, selectEpisode, onProgress,
    src: buildVidstuckUrl({ ...match, season, episode }),
    ready: !history.isPending,
    historyError: history.error || save.error,
  };
}

================================================================================
