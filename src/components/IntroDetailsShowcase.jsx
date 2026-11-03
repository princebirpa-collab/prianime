const features = [
  {
    number: "01",
    title: "Discover your next anime",
    description: "Explore anime worlds, trending picks, genres, movies, and detailed titles in one place.",
    tags: ["Discover", "Browse", "Genres"],
  },
  {
    number: "02",
    title: "Your watch journey",
    description: "Keep your anime experience organized with your library and Continue Watching area.",
    tags: ["Library", "Watch history"],
  },
  {
    number: "03",
    title: "Reels & video stories",
    description: "A dedicated space for short anime-style clips alongside longer video experiences.",
    tags: ["Reels", "Videos"],
  },
  {
    number: "04",
    title: "Creator & AI Studio",
    description: "Explore creative tools for stories, original concepts, and creator-focused projects.",
    tags: ["Creator", "Studio"],
  },
  {
    number: "05",
    title: "A world beyond one language",
    description: "Designed around anime discovery with language choices and a growing viewing experience.",
    tags: ["Language options", "Anime culture"],
  },
  {
    number: "06",
    title: "A cinematic home",
    description: "A dark, immersive interface with glass panels and a soft rose-gold glow that follows the intro’s mood.",
    tags: ["Glass UI", "Cinematic design"],
  },
];

export default function IntroDetailsShowcase() {
  return (
    <section className="relative isolate overflow-hidden border-t border-white/10 bg-[#08050b] px-5 py-20 text-white sm:px-8 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[110px]" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-rose-400/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(216,181,109,0.08),transparent_55%)]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-5 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8b56d]">
              Welcome to PRI-ANIME
            </p>
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">
              One universe.
              <span className="block bg-gradient-to-r from-rose-300 via-[#d8b56d] to-fuchsia-300 bg-clip-text text-transparent">
                Endless stories.
              </span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
              Your anime destination for discovery, watching, short-form stories, and creative
              exploration—wrapped in a cinematic interface.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 self-start rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/60 backdrop-blur-xl sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-rose-300 shadow-[0_0_12px_rgba(251,113,133,0.8)]" />
            Scroll to explore
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-rose-300/30 hover:bg-white/[0.06] sm:p-7"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.2em] text-[#d8b56d]">
                  {feature.number}
                </span>
                <span className="h-px w-12 bg-gradient-to-r from-rose-300/60 to-transparent" />
              </div>
              <h3 className="text-xl font-bold text-white sm:text-2xl">{feature.title}</h3>
              <p className="mt-3 min-h-[5.5rem] text-sm leading-6 text-white/60">
                {feature.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {feature.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="pointer-events-none absolute -bottom-16 -right-12 h-36 w-36 rounded-full bg-fuchsia-400/[0.06] blur-3xl transition group-hover:bg-rose-300/[0.12]" />
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-7 text-center backdrop-blur-2xl sm:mt-16 sm:px-10">
          <p className="text-sm leading-6 text-white/65">
            Keep scrolling to reach the PRI-ANIME website. Use <span className="font-semibold text-white">Enter PRI-ANIME</span> or
            <span className="font-semibold text-white"> Skip intro</span> whenever you’re ready.
          </p>
        </div>
      </div>
    </section>
  );
}
