import AnimeRowRemote from "@/components/anime/AnimeRowRemote";
import { currentSeason } from "@/lib/animeApi";

export default function LiveCatalogue() {
  const season = currentSeason();
  const seasonTitle = season.season.charAt(0) + season.season.slice(1).toLowerCase();

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pt-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border/50 pt-10">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Live from AniList</p>
          <h2 className="mt-2 font-display text-3xl font-medium sm:text-4xl">The living catalogue</h2>
        </div>
        <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
          Every row below is a live metadata query â€” scores, episode counts and artwork come straight from the
          AniList GraphQL API, cached for five minutes.
        </p>
      </div>

      <AnimeRowRemote title="Trending now" subtitle="What the world is watching this hour" body={{ action: "trending", perPage: 20 }} viewAll="/browse?sort=trending" />
      <AnimeRowRemote title="All-time popular" subtitle="The canon, ranked by followers" body={{ action: "popular", perPage: 20 }} viewAll="/browse?sort=popular" rank />
      <AnimeRowRemote
        title={`${seasonTitle} ${season.year} season`}
        subtitle="Airing this season"
        body={{ action: "seasonal", season: season.season, year: season.year, perPage: 20 }}
        viewAll="/category/seasonal"
      />
      <AnimeRowRemote title="Action & adventure" subtitle="Momentum, stakes, spectacle" body={{ action: "genre", genre: "Action", perPage: 20 }} viewAll="/category/action" />
      <AnimeRowRemote title="Dark fantasy & demons" subtitle="Where the light does not reach" body={{ action: "genre", genre: "Horror", perPage: 20 }} viewAll="/category/dark-fantasy" />
      <AnimeRowRemote title="Isekai & other worlds" subtitle="Portal fantasy and strange kingdoms" body={{ action: "genre", genre: "Fantasy", perPage: 20 }} viewAll="/category/isekai" />
      <AnimeRowRemote title="Highest rated" subtitle="Scored by the community" body={{ action: "top", perPage: 20 }} viewAll="/browse?sort=top" />
    </div>
  );
}

================================================================================
