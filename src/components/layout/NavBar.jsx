import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Search, X, Compass, Clapperboard, Film, Sparkles, Wand2, Settings, Loader2, Users, Trophy, Users2, Tv2, BookOpen } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { callAniList } from "@/lib/animeApi";
import ThemeMenu from "@/components/layout/ThemeMenu";
import NotificationsBell from "@/components/layout/NotificationsBell";

export const NAV_LINKS = [
  { to: "/", label: "Discover", icon: Compass },
  { to: "/browse", label: "Browse", icon: Film },
  { to: "/reels", label: "Reels", icon: Clapperboard },
  { to: "/watch", label: "Theater", icon: Film },
  { to: "/channels", label: "Channels", icon: Tv2 },
  { to: "/manhwa", label: "Manhwa", icon: BookOpen },
  { to: "/studio", label: "AI Studio", icon: Sparkles },
  { to: "/creator", label: "Creator", icon: Wand2 },
  { to: "/community", label: "Community", icon: Users },
  { to: "/watch-party", label: "Watch Party", icon: Users2 },
  { to: "/missions", label: "Missions", icon: Trophy },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const navigate = useNavigate();
  const [profile] = useProfile();

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2 || !suggestionsVisible) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionsError(false);
      return undefined;
    }
    let active = true;
    const timer = setTimeout(() => {
      setSuggestionsLoading(true);
      setSuggestionsError(false);
      callAniList({ action: "search", q: term, perPage: 6 })
        .then((data) => { if (active) setSuggestions((data.items || []).slice(0, 6)); })
        .catch(() => { if (active) { setSuggestions([]); setSuggestionsError(true); } })
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
          <input id={mobile ? "nav-search-mobile" : "nav-search"} value={query} onFocus={() => setSuggestionsVisible(true)} onChange={(event) => setQuery(event.target.value)} placeholder={mobile ? "Search titles, genres, studios…" : "Search anime…"} aria-label="Search anime" aria-expanded={suggestionsVisible && query.trim().length >= 2} aria-controls={mobile ? "nav-search-suggestions-mobile" : "nav-search-suggestions"} className={(mobile ? "w-full" : "w-32 lg:w-44") + " bg-transparent text-sm outline-none placeholder:text-muted-foreground/80"} />
          {suggestionsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-label="Searching" />}
        </div>
      </form>
      {suggestionsVisible && query.trim().length >= 2 && (
        <div id={mobile ? "nav-search-suggestions-mobile" : "nav-search-suggestions"} role="listbox" className="absolute right-0 top-full z-[70] mt-2 max-h-[min(72vh,520px)] w-[min(94vw,720px)] overflow-y-auto rounded-2xl border border-border/70 bg-background/95 p-3 shadow-2xl backdrop-blur-xl">
          {suggestions.length > 0 && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">{suggestions.map((anime) => (
            <button type="button" role="option" aria-selected="false" key={anime.id} onMouseDown={(event) => event.preventDefault()} onClick={() => openAnime(anime)} className="group min-w-0 overflow-hidden rounded-xl border border-border/60 bg-card/60 text-left transition hover:border-primary/60 hover:bg-primary/10 focus:border-primary/60 focus:outline-none">
              <div className="relative aspect-[2/3] overflow-hidden bg-muted">{anime.cover && <img src={anime.cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}{anime.score != null && <span className="absolute right-1.5 top-1.5 rounded-md bg-black/75 px-1.5 py-1 text-[10px] font-semibold text-primary">{anime.score}%</span>}</div>
              <span className="block min-w-0 p-2"><span className="block line-clamp-2 min-h-9 text-xs font-semibold leading-snug text-foreground">{anime.display}</span>{anime.titleRomaji && anime.titleRomaji !== anime.display && <span className="mt-1 block truncate text-[10px] text-muted-foreground">{anime.titleRomaji}</span>}<span className="mt-1 block truncate text-[10px] uppercase tracking-wide text-muted-foreground">{(anime.format ? anime.format.replaceAll("_", " ") : "Anime") + (anime.episodes ? " · " + anime.episodes + " eps" : "")}</span></span>
            </button>
          ))}</div>}
          {suggestionsLoading && <div className="px-3 py-2 text-xs text-muted-foreground">Searching AniList and title aliases…</div>}
          {!suggestionsLoading && suggestions.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">{suggestionsError ? "Suggestions are temporarily unavailable. Press Enter to retry on the full results page." : "No quick matches yet. Press Enter to search the full catalogue."}</div>}
          <button type="button" onClick={submit} className="mt-1 w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-primary transition hover:bg-primary/10">See all results for “{query.trim()}”</button>
        </div>
      )}
    </div>
  );

  return (
    <header className="glass-strong sticky top-0 z-50 border-b border-white/[0.07]">
      <div className="mx-auto flex h-[68px] w-full max-w-[1600px] items-center gap-3 px-3 sm:px-5 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="PRI-ANIME home"><img src="/prianime-logo.jpg" alt="PRI-ANIME" className="h-9 w-9 rounded-full border border-primary/50 object-cover" /><span className="font-display text-xl font-semibold tracking-[0.16em] text-foreground">PRI<span className="text-primary">Â·</span>ANIME</span></Link>
        <div className="ml-auto flex items-center gap-1.5">{searchField(false)}<button type="button" onClick={() => setSearchOpen((value) => !value)} aria-label="Search" aria-expanded={searchOpen} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground md:hidden"><Search className="h-4 w-4" /></button><NotificationsBell /><ThemeMenu /><Link to="/settings" className="ml-1 grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-primary/50 bg-primary/15 text-sm font-semibold text-primary shadow-[0_0_16px_rgba(244,63,94,.18)] transition hover:scale-105" aria-label={"Profile settings for " + profile.name}>{profile.avatar ? <img src={profile.avatar} alt="" className="h-full w-full object-cover" /> : profile.name.slice(0, 1).toUpperCase()}</Link><button type="button" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
      </div>
      {searchOpen && <div className="border-t border-border/50 px-4 py-3 md:hidden">{searchField(true)}</div>}
      <nav aria-label="Primary navigation" className="hidden border-t border-white/[0.055] bg-black/[0.12] md:flex">
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-1 overflow-x-auto px-5 py-2 [scrollbar-width:none] lg:px-8">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={({ isActive }) => "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-[11px] font-medium tracking-wide transition " + (isActive ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-white/[0.055] hover:text-foreground")}>
              <link.icon className="h-3.5 w-3.5" aria-hidden="true" />{link.label}
            </NavLink>
          ))}
        </div>
      </nav>
      {mobileOpen && <nav aria-label="Main menu" className="absolute left-3 right-3 top-[calc(100%+8px)] z-[80] grid max-h-[min(78vh,620px)] gap-1 overflow-y-auto rounded-2xl border border-white/10 bg-[#100e14]/95 p-3 shadow-2xl backdrop-blur-2xl sm:left-auto sm:right-6 sm:w-[340px]">{NAV_LINKS.concat({ to: "/settings", label: "Profile", icon: Settings }).map((link) => <NavLink key={link.to} to={link.to} end={link.to === "/"} onClick={() => setMobileOpen(false)} className={({ isActive }) => "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm " + (isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-foreground/5")}><link.icon className="h-4 w-4" aria-hidden="true" />{link.label}</NavLink>)}</nav>}
    </header>
  );
}
