import { Link } from "react-router-dom";
import { Sparkles, Clapperboard, Play, Wand2 } from "lucide-react";
import { Image } from "@/components/ui/image";

const CRYSTAL_ART =
  "https://media.base44.com/images/public/6ad72c15ba384b754ca4ab11/d2b8a20ae_generated_5d03313d.png";
const PORTRAIT_ART =
  "https://media.base44.com/images/public/6ad72c15ba384b754ca4ab11/b010d0bcd_generated_4f3da88c.png";

const FEATURES = [
  {
    to: "/browse",
    icon: Play,
    title: "A real catalogue",
    body: "Live AniList search, seasonal charts, trending and popularity â€” with scores, genres and episode counts.",
  },
  {
    to: "/reels",
    icon: Clapperboard,
    title: "Vertical reel vortex",
    body: "Full-screen short-form feed with likes, comments and scroll-snap playback that pauses off-screen video.",
  },
  {
    to: "/studio",
    icon: Sparkles,
    title: "AI story atelier",
    body: "Outline original manhwa arcs, generate character bibles, and save scripts in Hindi or English.",
  },
  {
    to: "/creator",
    icon: Wand2,
    title: "Creator studio",
    body: "Publish licensed videos, track render jobs and see exactly which provider is connected.",
  },
];

export default function ExperiencePanel() {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 pt-20 sm:px-6 lg:px-10">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-border/60">
          <Image
            src={CRYSTAL_ART}
            alt="Original artwork: elemental fire, frost and digital light trapped inside a shattered crystal"
            className="h-full min-h-[300px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">House artwork</p>
            <h2 className="mt-2 max-w-md font-display text-3xl leading-tight text-white">
              Gilded Midnight â€” the visual language of PRI-ANIME
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Gold, amethyst and void-black, lit like a film frame. Every theme inherits the same physics.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group rounded-2xl border border-border/60 bg-card/60 p-5 glow-hover"
            >
              <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-4 font-display text-lg text-foreground">{feature.title}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{feature.body}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 overflow-hidden rounded-3xl border border-border/60 sm:grid-cols-[1fr_1.6fr]">
        <Image
          src={PORTRAIT_ART}
          alt="Original portrait artwork of a silver-haired swordswoman with a glowing golden katana"
          className="h-full max-h-[380px] w-full object-cover"
        />
        <div className="flex flex-col justify-center bg-card/50 p-7">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary">Reel premiere</p>
          <h2 className="mt-3 font-display text-3xl leading-tight text-foreground">
            Short-form, scored like a feature.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            The vortex plays muted until you ask for sound, only ever holds three videos in memory, and
            remembers where you stopped. Upload your own licensed clip and it lands in the feed.
          </p>
          <Link
            to="/reels"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Open the vortex
          </Link>
        </div>
      </div>
    </section>
  );
}

================================================================================
