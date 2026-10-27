import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function useAnimeSource(animeId) {
  return useQuery({
    queryKey: ["anime-stream-source", Number(animeId)],
    queryFn: async () => {
      const { data } = await base44.functions.invoke("videoProvider", { action: "resolveAnime", animeId: Number(animeId) });
      if (!data?.ok) throw new Error(data?.error || "The streaming source could not be matched.");
      return data.match || null;
    },
    enabled: Number.isSafeInteger(Number(animeId)) && Number(animeId) > 0,
    staleTime: 12 * 60 * 60 * 1000,
    retry: false,
  });
}
