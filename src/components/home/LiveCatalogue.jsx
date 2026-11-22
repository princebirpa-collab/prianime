import AnimeRowRemote from "@/components/anime/AnimeRowRemote";
import { currentSeason } from "@/lib/animeApi";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function LiveCatalogue() {
  const season = currentSeason();
  const seasonTitle = season.season.charAt(0) + season.season.slice(1).toLowerCase();

  return (
    <section className="pri-catalogue mx-auto w-full max-w-[1800px] px-4 pt-14 sm:px-6 lg:px-10">
      <header className="pri-catalogue-header relative overflow-hidden rounded-[2rem] border border-rose-200/15 p-6 sm:p-10 lg:p-12">
        <div className="pri-catalogue-orb" aria-hidden="true" />
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.32em] text-rose-200/80"><Sparkles className="h-4 w-4" /> Curated for your next marathon</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-6xl">The anime <span className="pri-catalogue-gradient">archive.</span></h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">Explore the classics, discover what is airing, and find a world worth getting lost in.</p>
          </div>
          <Link to="/browse" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Explore everything <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="pri-catalogue-tags relative z-10 mt-8 flex flex-wrap gap-2">
          {[{label:"POPULAR",to:"/browse?sort=popular"},{label:"CURRENT SEASON",to:"/category/seasonal"},{label:"ACTION",to:"/category/action"},{label:"DARK FANTASY",to:"/category/dark-fantasy"},{label:"ISEKAI",to:"/category/isekai"}].map((tag) => <Link key={tag.label} to={tag.to} className="pri-catalogue-chip">{tag.label}<ArrowUpRight className="h-3 w-3" /></Link>)}
        </div>
      </header>

      <div className="pri-catalogue-rows">
        <AnimeRowRemote title="Fan favourites" subtitle="The canon, ranked by followers" body={{ action: "popular", perPage: 8 }} viewAll="/browse?sort=popular" rank />
        <AnimeRowRemote title={seasonTitle + " " + season.year} subtitle="The season's current lineup" body={{ action: "seasonal", season: season.season, year: season.year, perPage: 20 }} viewAll="/category/seasonal" />
        <AnimeRowRemote title="Action & adventure" subtitle="Momentum, stakes, spectacle" body={{ action: "genre", genre: "Action", perPage: 20 }} viewAll="/category/action" />
        <AnimeRowRemote title="Dark fantasy" subtitle="Darker worlds and supernatural stories" body={{ action: "genre", genre: "Horror", perPage: 20 }} viewAll="/category/dark-fantasy" />
        <AnimeRowRemote title="Other worlds" subtitle="Isekai and fantasy journeys" body={{ action: "genre", genre: "Fantasy", perPage: 20 }} viewAll="/category/isekai" />
        <AnimeRowRemote title="Critically loved" subtitle="Highest-scored anime" body={{ action: "top", perPage: 20 }} viewAll="/browse?sort=top" />
      </div>
    </section>
  );
}
