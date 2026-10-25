import AnimeRow from "@/components/anime/AnimeRow";
import { useAnimeList } from "@/hooks/useAnime";

export default function AnimeRowRemote({ title, subtitle, body, viewAll, rank }) {
  const { items, loading, error } = useAnimeList(body);
  if (!loading && !error && items.length === 0) return null;
  return (
    <AnimeRow
      title={title}
      subtitle={subtitle}
      items={items}
      loading={loading}
      error={error}
      viewAll={viewAll}
      rank={rank}
    />
  );
}
