import { Link } from "react-router-dom";
import { Play, Clapperboard, Sparkles, ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";

const HERO_ART =
  "https://media.base44.com/images/public/6ad72c15ba384b754ca4ab11/77bc0cfd5_generated_ee3720d1.png";

const STATS = [
  { value: "Live", label: "AniList metadata" },
  { value: "6", label: "Royal themes" },
  { value: "AI", label: "Story studio" },
  { value: "9:16", label: "Reel vortex" },
];

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[88vh] items-end overflow-hidden">
      <Image
        src={HERO_ART}
        alt="An original illustration: a lone hooded warrior before a colossal gilded gate adrift in a starry void"
        fittingType="fill"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,hsl(var(--background))_4%,hsl(var(--background)/0.86)_28%,hsl(var(--background)/0.35)_62%,hsl(var(--background)/0.1)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--background)/0.9)_0%,hsl(var(--background)/0.35)_45%,transparent_78%)]"
      />

      <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-28 sm:px-6 lg:px-10 lg:pb-24">
        <div className="max-w-2xl animate-fade-up">
          <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.34em] text-primary">
            <span className="h-px w-10 bg-primary/70" aria-hidden="true" />
            Pri-Anime Â· The Gilded Theatre
          </p>

          <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.94] tracking-tight text-balance sm:text-6xl lg:text-[4.6rem]">
            Every frame
            <span className="block gold-text">feels like a ritual.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
            Discover thousands of anime through live AniList metadata, drift through a vertical reel
            vortex, and turn your own ideas into filmed stories with the AI story studio.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/browse"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground glow-soft transition hover:brightness-110"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              Enter the theatre
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              to="/reels"
              className="inline-flex items-center gap-2 rounded-full border border-border/80 px-6 py-3.5 text-sm font-medium text-foreground transition hover:border-primary/60 hover:text-primary"
            >
              <Clapperboard className="h-4 w-4" aria-hidden="true" />
              Reel vortex
            </Link>
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 rounded-full px-4 py-3.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Write with AI
            </Link>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 border-t border-border/50 pt-7 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-2xl text-primary">{stat.value}</dt>
                <dd className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
