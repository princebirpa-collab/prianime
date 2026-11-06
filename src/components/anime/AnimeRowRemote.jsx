import { useEffect, useRef, useState } from "react";
import AnimeRow from "@/components/anime/AnimeRow";
import { useAnimeList } from "@/hooks/useAnime";

export default function AnimeRowRemote({ title, subtitle, body, viewAll, rank }) {
  const sectionRef = useRef(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || nearViewport) return undefined;
    if (!("IntersectionObserver" in window)) {
      setNearViewport(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: "320px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [nearViewport]);

  const { items, loading, error } = useAnimeList(body, nearViewport);
  if (nearViewport && !loading && !error && items.length === 0) return null;
  return (
    <div ref={sectionRef} className="min-h-[1px]">
      {nearViewport ? (
        <AnimeRow title={title} subtitle={subtitle} items={items} loading={loading} error={error} viewAll={viewAll} rank={rank} />
      ) : null}
    </div>
  );
}
