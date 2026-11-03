const features = [
  {
    number: "01",
    title: "Anime discovery, made personal",
    description: "Find your next favorite through trending picks, top titles, genres, seasonal highlights, and curated discovery shelves.",
    tags: ["Discover", "Trending", "Top picks"],
  },
  {
    number: "02",
    title: "Search that understands titles",
    description: "Search by title and alternate names—English, Japanese, and romanized spellings—so a title is easier to find.",
    tags: ["Smart search", "Alt titles", "Anime catalog"],
  },
  {
    number: "03",
    title: "Anime details in one place",
    description: "Explore synopsis, genres, formats, release information, and community scores with source labels kept clear.",
    tags: ["Anime info", "AniList", "MAL"],
  },
  {
    number: "04",
    title: "Movies & series",
    description: "Browse anime series and anime movies in dedicated spaces, with a catalog experience built for both.",
    tags: ["Series", "Movies", "Browse"],
  },
  {
    number: "05",
    title: "Continue your journey",
    description: "Keep your viewing organized with a library, watch history, and a Continue Watching experience.",
    tags: ["Library", "History", "Continue"],
  },
  {
    number: "06",
    title: "Reels & short stories",
    description: "Discover quick anime-style clips and short-form stories alongside longer video experiences.",
    tags: ["Reels", "Short videos"],
  },
  {
    number: "07",
    title: "Creator & AI Studio",
    description: "A creative space concept for developing original story ideas, scripts, and creator projects.",
    tags: ["Creator tools", "AI Studio"],
  },
  {
    number: "08",
    title: "Language-friendly experience",
    description: "Make discovery easier with language choices and a viewing experience designed for a wider audience.",
    tags: ["Language options", "Hindi", "English"],
  },
  {
    number: "09",
    title: "A cinematic glass interface",
    description: "Deep dark surfaces, layered glass panels, subtle pink light, and smooth responsive layouts.",
    tags: ["Glass UI", "Responsive", "Cinematic"],
  },
  {
    number: "10",
    title: "Your space, your profile",
    description: "A home for account features, personal preferences, saved titles, and your anime journey.",
    tags: ["Profile", "Preferences"],
  },
  {
    number: "11",
    title: "Monthly update rhythm",
    description: "The goal is a fresh update every month—with improvements, polished experiences, and new ideas introduced over time. Exact releases may vary.",
    tags: ["Monthly updates", "Improvements"],
  },
  {
    number: "12",
    title: "Built to keep improving",
    description: "PRI-ANIME is an evolving project: feedback helps guide usability fixes, search improvements, and future feature work.",
    tags: ["Feedback", "Evolution"],
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
              Discover anime, follow your watch journey, explore short-form stories, and
              experience a cinematic anime-inspired home. PRI-ANIME keeps evolving with
              community feedback and regular improvements.
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

        <div className="mt-12 rounded-3xl border border-rose-300/15 bg-white/[0.035] px-6 py-7 text-center backdrop-blur-2xl sm:mt-16 sm:px-10">
          <p className="text-sm leading-6 text-white/65">
            Explore this feature guide by scrolling. The website itself stays behind the intro
            until you choose <span className="font-semibold text-white">Enter PRI-ANIME</span> or
            <span className="font-semibold text-white"> Skip intro</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
