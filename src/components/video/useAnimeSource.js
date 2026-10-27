import { useQuery } from "@tanstack/react-query";

export default function useAnimeSource(animeId) {
  return useQuery({
    queryKey: ["anime-stream-source", Number(animeId)],
    queryFn: async () => {
      const response = await fetch("/api/video-provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action: "resolveAnime",
          animeId: Number(animeId),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || `Source lookup failed (HTTP ${response.status}).`);
      }
      return data.match || null;
    },
    enabled: Number.isSafeInteger(Number(animeId)) && Number(animeId) > 0,
    staleTime: 12 * 60 * 60 * 1000,
    retry: 1,
  });
}
