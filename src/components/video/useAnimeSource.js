import { useQuery } from "@tanstack/react-query";

export default function useAnimeSource(animeId) {
  const id = String(animeId || "").trim();
  return useQuery({
    queryKey: ["anime-stream-source", id],
    queryFn: async () => {
      const response = await fetch("/api/video-provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action: "resolveAnime",
          animeId: id,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || `Source lookup failed (HTTP ${response.status}).`);
      }
      return data.match || null;
    },
    enabled: /^(?:[1-9]\d{0,8}|mal-[1-9]\d{0,11}|kitsu-[1-9]\d{0,11})$/.test(id),
    staleTime: 12 * 60 * 60 * 1000,
    retry: 1,
  });
}
