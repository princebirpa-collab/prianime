import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Search, X, Compass, Clapperboard, Film, Sparkles, Wand2, Library, Settings } from "lucide-react";
import { useProfile } from "@/lib/profile";
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
  const navigate = useNavigate();
  const [profile] = useProfile();

  const submit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setMobileOpen(false);
  };

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
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-[13px] font-medium tracking-wide transition ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <form onSubmit={submit} className="hidden items-center md:flex">
            <label htmlFor="nav-search" className="sr-only">Search anime</label>
            <div className="flex h-9 items-center gap-2 rounded-full border border-border/70 bg-foreground/[0.04] px-3 transition focus-within:border-primary/60">
              <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <input id="nav-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anime…" className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground/80 lg:w-44" />
            </div>
          </form>
          <button type="button" onClick={() => setSearchOpen((value) => !value)} aria-label="Search" aria-expanded={searchOpen} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground md:hidden">
            <Search className="h-4 w-4" />
          </button>
          <NotificationsBell />
          <ThemeMenu />
          <Link to="/settings" className="ml-1 grid h-9 w-9 place-items-center rounded-full border border-primary/40 bg-primary/15 text-sm font-semibold text-primary transition hover:bg-primary/25" aria-label={`Profile settings for ${profile.name}`}>
            {profile.name.slice(0, 1).toUpperCase()}
          </Link>
          <button type="button" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground lg:hidden">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submit} className="border-t border-border/50 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-foreground/[0.04] px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, genres, studios…" aria-label="Search anime" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/80" />
          </div>
        </form>
      )}

      {mobileOpen && (
        <nav aria-label="Mobile" className="grid gap-1 border-t border-border/50 px-4 py-4 lg:hidden">
          {NAV_LINKS.concat({ to: "/settings", label: "Settings", icon: Settings }).map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} onClick={() => setMobileOpen(false)} className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-foreground/5"
              }`
            }>
              <link.icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
