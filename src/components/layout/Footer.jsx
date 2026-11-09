import { Link } from "react-router-dom";
import { Shield, Sparkles, Instagram, MessageCircle, Heart, Coffee } from "lucide-react";
import { NAV_LINKS } from "@/components/layout/NavBar";
const DISCORD_URL = "https://discord.gg/2meCrBHQw";
const INSTAGRAM_URL = "https://www.instagram.com/pri-ani-anime/";
export default function Footer() {
  return <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-[#08060b]/90 text-white">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(244,63,94,.10),transparent_42%),radial-gradient(ellipse_at_90%_100%,rgba(168,85,247,.10),transparent_42%)]" />
    <div className="relative mx-auto grid w-full max-w-[1600px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
      <div><p className="font-display text-2xl tracking-[0.14em]">PRI<span className="text-primary">·</span>ANIME</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">Watch anime online in a cinematic, ad-free experience. Discover titles, follow your watch journey, and connect with the community.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-indigo-300/25 bg-indigo-400/10 px-4 py-2.5 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-400/20"><MessageCircle className="h-4 w-4" /> Join Discord</a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-pink-300/25 bg-pink-400/10 px-4 py-2.5 text-xs font-semibold text-pink-100 transition hover:bg-pink-400/20"><Instagram className="h-4 w-4" /> Instagram</a>
        </div>
        <p className="mt-5 flex items-center gap-2 text-xs text-white/40"><Shield className="h-3.5 w-3.5 text-primary" /> Respect creators. Watch through authorized sources.</p>
      </div>
      <div><p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Support the project</p><div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4"><div className="flex items-center gap-2 text-amber-200"><Coffee className="h-5 w-5" /><span className="font-semibold">Buy us a coffee</span></div><p className="mt-2 text-xs leading-relaxed text-white/60">Enjoying PRI-ANIME? Your support can help with hosting, maintenance, and new features. Every contribution is optional.</p><span className="mt-3 inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-xs font-semibold text-amber-100/70" aria-disabled="true"><Coffee className="h-3.5 w-3.5" /> Ko-fi page coming soon</span></div></div>
      <div><p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Explore</p><ul className="mt-3 grid gap-2 text-sm">{NAV_LINKS.map((link) => <li key={link.to}><Link className="text-white/60 transition hover:text-primary" to={link.to}>{link.label}</Link></li>)}</ul></div>
      <div><p className="text-[11px] uppercase tracking-[0.22em] text-white/45">About & support</p><div className="mt-3 space-y-3 text-sm text-white/60">
        <p><span className="font-semibold text-white">About the owner</span><br />PRI-ANIME is an independent anime discovery and community project created by Prince Birla.</p>
        <Link className="block transition hover:text-primary" to="/policy">Policies & licensing</Link><Link className="block transition hover:text-primary" to="/community">Community</Link>
      </div></div>
    </div>
    <div className="relative border-t border-white/10 px-4 py-7 text-center sm:px-6 lg:px-10">
      <p className="font-display text-2xl font-black tracking-[0.12em] text-white sm:text-4xl">PIRACY IS BAD. MAYBE?</p>
      <p className="mt-2 text-xs text-white/45">Support the creators, studios, and official distributors behind the stories you love.</p>
      <p className="mt-5 inline-flex items-center gap-2 text-[11px] text-white/35"><Sparkles className="h-3.5 w-3.5 text-primary" /> Made with <Heart className="h-3 w-3 text-rose-400" /> for anime fans · PRI-ANIME</p>
    </div>
  </footer>;
}