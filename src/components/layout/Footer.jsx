import { Link } from "react-router-dom";
import { Shield, Sparkles } from "lucide-react";
import { NAV_LINKS } from "@/components/layout/NavBar";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/60 bg-background/60">
      <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <p className="font-display text-2xl tracking-[0.14em]">
            PRI<span className="text-primary">Â·</span>ANIME
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A cinematic anime theater: real metadata from AniList, a vertical reels network, AI-written
            original stories, and a creator studio for licensed work.
          </p>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Metadata Â© AniList. Video is creator-owned or open-licensed only.
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Explore</p>
          <ul className="mt-3 grid gap-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link className="text-muted-foreground transition hover:text-primary" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Studio</p>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>
              <Link className="text-muted-foreground transition hover:text-primary" to="/creator">
                Publish a video
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground transition hover:text-primary" to="/studio">
                Write with AI
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground transition hover:text-primary" to="/admin">
                Admin console
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground transition hover:text-primary" to="/policy">
                Policies &amp; licences
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/40 px-4 py-5 text-center text-xs text-muted-foreground sm:px-6 lg:px-10">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Built for the love of the frame â€” PRI-ANIME.
        </span>
      </div>
    </footer>
  );
}
