import { Link } from "react-router-dom";
import { Shield, Sparkles, Instagram, MessageCircle, Heart, Coffee } from "lucide-react";
import { NAV_LINKS } from "@/components/layout/NavBar";

const DISCORD_URL = "https://discord.gg/2meCrBHQw";
const INSTAGRAM_URL = "https://www.instagram.com/pri-ani-anime/";

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10 bg-[#08060b]/90 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(244,63,94,.08),transparent_42%),radial-gradient(ellipse_at_90%_100%,rgba(168,85,247,.07),transparent_42%)]" />
      <div className="relative mx-auto grid w-full max-w-[1600px] gap-9 px-4 py-11 sm:px-6 lg:grid-cols-[1.35fr_1fr_1.2fr] lg:px-10">
        <div>
          <p className="font-display text-2xl tracking-[0.14em]">PRI<span className="text-primary">·</span>ANIME</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
            Discover anime, keep your watch journey together, and connect with the community.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-indigo-300/25 bg-indigo-400/10 px-4 py-2.5 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-400/20">
              <MessageCircle className="h-4 w-4" /> Discord
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-pink-300/25 bg-pink-400/10 px-4 py-2.5 text-xs font-semibold text-pink-100 transition hover:bg-pink-400/20">
              <Instagram className="h-4 w-4" /> Instagram
            </a>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-white/40">
            <Shield className="h-3.5 w-3.5 text-primary" /> Support official releases and their creators.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] p-4">
          <div className="flex items-center gap-2 text-amber-200">
            <Coffee className="h-5 w-5" /><span className="font-semibold">Support the project</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/60">
            Optional support helps with hosting, maintenance, and future improvements.
          </p>
          <p className="mt-4 text-[11px] text-white/35">Thank you for being part of PRI-ANIME.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Explore</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.to}><Link className="text-white/60 transition hover:text-primary" to={link.to}>{link.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">About</p>
            <div className="mt-3 grid gap-2 text-sm text-white/60">
              <Link className="transition hover:text-primary" to="/about-owner">About the owner</Link>
              <Link className="transition hover:text-primary" to="/policy">Policies</Link>
              <Link className="transition hover:text-primary" to="/community">Community</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/10 px-4 py-5 text-center sm:px-6 lg:px-10">
        <p className="text-xs text-white/45">Made with <Heart className="inline h-3 w-3 text-rose-400" /> for anime fans · PRI-ANIME</p>
        <p className="mt-1 text-[10px] text-white/30">Respect creators. Choose authorized releases.</p>
      </div>
    </footer>
  );
}
