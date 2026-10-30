import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Search, X, Compass, Clapperboard, Film, Sparkles, Wand2, Library, Settings, Loader2 } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { callAniList } from "@/lib/animeApi";
import ThemeMenu from "@/components/layout/ThemeMenu";
import NotificationsBell from "@/components/layout/NotificationsBell";

export const NAV_LINKS = [
  { to: "/", label: "Discover", icon: Compass },
  { to: "/browse", label: "Browse", icon: Film },
  { to: "/reels", label: "Reels", icon: Clapperboard },
  { to: "/watch", label: "Theater", icon: Film },
  { to: "/studio", label: "AI Studio", icon: Sparkles },
  { to: "/creator", label: "Creator", icon: Wand2 },
  { to: "/library", label: "Library", icon: Library },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const navigate = useNavigate();
  const [profile] = useProfile();

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2 || !suggestionsVisible) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return undefined;
    }
    let active = true;
    const timer = setTimeout(() => {
      setSuggestionsLoading(true);
      callAniList({ action: "search", q: term, perPage: 6 })
        .then((data) => { if (active) setSuggestions((data.items || []).slice(0, 6)); })
        .catch(() => { if (active) setSuggestions([]); })
        .finally(() => { if (active) setSuggestionsLoading(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [query, suggestionsVisible]);

  const submit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate("/browse?q=" + encodeURIComponent(query.trim()));
    setSearchOpen(false);
    setSuggestionsVisible(false);
    setMobileOpen(false);
  };

  const openAnime = (anime) => {
    navigate("/anime/" + anime.id);
    setSuggestionsVisible(false);
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const searchField = (mobile = false) => (
    <div className={"relative " + (mobile ? "w-full" : "")}>
      <form onSubmit={submit} className={mobile ? "w-full" : "hidden items-center md:flex"}>
        <label htmlFor={mobile ? "nav-search-mobile" : "nav-search"} className="sr-only">Search anime</label>
        <div className={"flex h-9 items-center gap-2 rounded-full border border-border/70 bg-foreground/[0.04] px-3 transition focus-within:border-primary/60 " + (mobile ? "w-full" : "")}>
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            id={mobile ? "nav-search-mobile" : "nav-search"}
            value={query}
            onFocus={() => setSuggestionsVisible(true)}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={mobile ? "Search titles, genres, studios…" : "Search anime…"}
            aria-label="Search anime"
            aria-expanded={suggestionsVisible && query.trim().length >= 2}
            aria-controls={mobile ? "nav-search-suggestions-mobile" : "nav-search-suggestions"}
            className={(mobile ? "w-full" : "w-32 lg:w-44") + " bg-transparent text-sm outline-none placeholder:text-muted-foreground/80"}
          />
          {suggestionsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-label="Searching" />}
        </div>
      </form>
      {suggestionsVisible && query.trim().length >= 2 && (suggestions.length > 0 || suggestionsLoading) && (
        <div id={mobile ? "nav-search-suggestions-mobile" : "nav-search-suggestions"} role="listbox" className="absolute right-0 top-full z-[70] mt-2 max-h-[min(70vh,420px)] w-[min(92vw,360px)] overflow-y-auto rounded-2xl border border-border/70 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
          {suggestions.map((anime) => (
            <button type="button" role="option" aria-selected="false" key={anime.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => openAnime(anime)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-primary/10 focus:bg-primary/10 focus:outline-none">
              <img src={anime.cover} alt="" loading="lazy" className="h-14 w-10 shrink-0 rounded-md object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{anime.display}</span>
                {anime.titleRomaji && anime.titleRomaji !== anime.display && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{anime.titleRomaji}</span>}
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {(anime.format ? anime.format.replaceAll("_", " ") : "Anime") + (anime.episodes ? " · " + anime.episodes + " eps" : "")}
                </span>
              </span>
              {anime.score != null && <span className="shrink-0 text-xs text-primary">{anime.score}%</span>}
            </button>
          ))}
          {suggestionsLoading && <div className="px-3 py-2 text-xs text-muted-foreground">Finding anime…</div>}
          <button type="button" onClick={submit} className="mt-1 w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-primary transition hover:bg-primary/10">
            See all results for “{query.trim()}”
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header className="glass-strong sticky top-0 z-50">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="PRI-ANIME home">
          <img src="/prianime-logo.jpg" alt="PRI-ANIME" className="h-9 w-9 rounded-full border border-primary/50 object-cover" />
          <span className="font-display text-xl font-semibold tracking-[0.16em] text-foreground">
            PRI<span className="text-primary">Â·</span>ANIME
          </span>
        </Link>
        <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"}
              className={({ isActive }) => "rounded-full px-3.5 py-2 text-[13px] font-medium tracking-wide transition " +
                (isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          {searchField(false)}
          <button type="button" onClick={() => setSearchOpen((value) => !value)} aria-label="Search" aria-expanded={searchOpen}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground md:hidden">
            <Search className="h-4 w-4" />
          </button>
          <NotificationsBell />
          <ThemeMenu />
          <Link to="/settings" className="ml-1 grid h-9 w-9 place-items-center rounded-full border border-primary/40 bg-primary/15 text-sm font-semibold text-primary transition hover:bg-primary/25" aria-label={"Profile settings for " + profile.name}>
            {profile.name.slice(0, 1).toUpperCase()}
          </Link>
          <button type="button" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground lg:hidden">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {searchOpen && <div className="border-t border-border/50 px-4 py-3 md:hidden">{searchField(true)}</div>}
      {mobileOpen && (
        <nav aria-label="Mobile" className="grid gap-1 border-t border-border/50 px-4 py-4 lg:hidden">
          {NAV_LINKS.concat({ to: "/settings", label: "Settings", icon: Settings }).map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm " +
                (isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-foreground/5")}>
              <link.icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
