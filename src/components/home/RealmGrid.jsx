import { Link } from "react-router-dom";
import { Swords, Flame, Sparkles, Globe2, Rocket, Fingerprint, Coffee, CalendarDays, ArrowUpRight } from "lucide-react";

export const REALMS = [
  { slug: "action", label: "Action & Adventure", icon: Swords, hue: "from-[#3a1a10] via-[#1a0d0a] to-[#07050a]" },
  { slug: "dark-fantasy", label: "Dark Fantasy & Demons", icon: Flame, hue: "from-[#3d0f1c] via-[#1c0710] to-[#07050a]" },
  { slug: "magic", label: "Magic & Supernatural", icon: Sparkles, hue: "from-[#2b1a4d] via-[#170f2b] to-[#07050a]" },
  { slug: "isekai", label: "Isekai & Other Worlds", icon: Globe2, hue: "from-[#123a33] via-[#0b1f1c] to-[#07050a]" },
  { slug: "sci-fi", label: "Sci-Fi & Future", icon: Rocket, hue: "from-[#0e2f47] via-[#081a28] to-[#07050a]" },
  { slug: "mystery", label: "Mystery & Thriller", icon: Fingerprint, hue: "from-[#241f38] via-[#121024] to-[#07050a]" },
  { slug: "comedy", label: "Comedy & Slice of Life", icon: Coffee, hue: "from-[#3d3416] via-[#1f1a0c] to-[#07050a]" },
  { slug: "seasonal", label: "New & Seasonal", icon: CalendarDays, hue: "from-[#3a2a0e] via-[#1d1507] to-[#07050a]" },
];

export default function RealmGrid() {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 pt-16 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Discover</p>
          <h2 className="mt-2 font-display text-3xl font-medium sm:text-4xl">Step into a realm</h2>
        </div>
        <Link to="/browse" className="text-sm text-muted-foreground transition hover:text-primary">
          Browse every title â†’
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {REALMS.map((realm, index) => (
          <Link
            key={realm.slug}
            to={`/category/${realm.slug}`}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${realm.hue} p-5 ring-1 ring-white/10 glow-hover`}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div aria-hidden="true" className="absolute inset-0 grain opacity-40" />
            <div className="relative">
              <realm.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-10 font-display text-lg leading-tight text-white">{realm.label}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-white/55 transition group-hover:text-primary">
                Enter
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

================================================================================
