const features = [
  { number: "01", symbol: "✦", title: "Anime discovery, made personal", description: "Find your next favorite through trending picks, top titles, genres, seasonal highlights, and curated discovery shelves.", tags: ["Discover", "Trending", "Top picks"], glow: "from-fuchsia-500/20" },
  { number: "02", symbol: "⌕", title: "Search that understands titles", description: "Search by title and alternate names—English, Japanese, and romanized spellings—so a title is easier to find.", tags: ["Smart search", "Alt titles", "Catalog"], glow: "from-rose-500/20" },
  { number: "03", symbol: "✧", title: "Anime details in one place", description: "Explore synopsis, genres, formats, release information, and community scores with source labels kept clear.", tags: ["Anime info", "AniList", "MAL"], glow: "from-amber-400/15" },
  { number: "04", symbol: "▣", title: "Movies & series", description: "Browse anime series and anime movies in dedicated spaces, with a catalog experience built for both.", tags: ["Series", "Movies", "Browse"], glow: "from-violet-500/20" },
  { number: "05", symbol: "◷", title: "Continue your journey", description: "Keep your viewing organized with a library, watch history, and a Continue Watching experience.", tags: ["Library", "History", "Continue"], glow: "from-pink-500/20" },
  { number: "06", symbol: "▶", title: "Reels & short stories", description: "Discover quick anime-style clips and short-form stories alongside longer video experiences.", tags: ["Reels", "Short videos"], glow: "from-fuchsia-500/20" },
  { number: "07", symbol: "✎", title: "Creator & AI Studio", description: "A creative space concept for developing original story ideas, scripts, and creator projects.", tags: ["Creator tools", "AI Studio"], glow: "from-indigo-500/20" },
  { number: "08", symbol: "文", title: "Language-friendly experience", description: "Make discovery easier with language choices and a viewing experience designed for a wider audience.", tags: ["Language options", "Hindi", "English"], glow: "from-rose-500/20" },
  { number: "09", symbol: "◇", title: "A cinematic glass interface", description: "Deep dark surfaces, layered glass panels, subtle pink light, and smooth responsive layouts.", tags: ["Glass UI", "Responsive", "Cinematic"], glow: "from-purple-500/20" },
  { number: "10", symbol: "◎", title: "Your space, your profile", description: "A home for account features, personal preferences, saved titles, and your anime journey.", tags: ["Profile", "Preferences"], glow: "from-pink-500/20" },
  { number: "11", symbol: "↻", title: "Monthly update rhythm", description: "The goal is a fresh update every month—with improvements, polished experiences, and new ideas introduced over time. Exact releases may vary.", tags: ["Monthly updates", "Improvements"], glow: "from-amber-400/15" },
  { number: "12", symbol: "♡", title: "Built to keep improving", description: "PRI-ANIME is an evolving project: feedback helps guide usability fixes, search improvements, and future feature work.", tags: ["Feedback", "Evolution"], glow: "from-rose-500/20" },
];

export default function IntroDetailsShowcase() {
  return (
    <section className="relative isolate overflow-hidden border-t border-white/10 bg-[#08050b] px-5 py-20 text-white sm:px-8 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[110px]" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-rose-400/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(216,181,109,0.08),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="relative mb-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-[0_25px_100px_rgba(0,0,0,.35)] backdrop-blur-2xl sm:mb-16 sm:p-10 lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-[90px]" />
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200/20 bg-rose-300/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-rose-100/80">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-300 shadow-[0_0_12px_rgba(251,113,133,.9)]" />
                Welcome to PRI-ANIME
              </div>
              <h2 className="text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-6xl">
                One universe.
                <span className="mt-2 block bg-gradient-to-r from-rose-300 via-[#d8b56d] to-fuchsia-300 bg-clip-text text-transparent">
                  Endless stories.
                </span>
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                Discover anime, follow your watch journey, explore short-form stories, and experience a cinematic anime-inspired home. PRI-ANIME keeps evolving with community feedback and regular improvements.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">12 feature highlights</span>
              <span className="rounded-full border border-[#d8b56d]/20 bg-[#d8b56d]/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d8b56d]">Monthly evolution</span>
            </div>
          </div>
          <div className="relative mt-8 flex items-center gap-3 border-t border-white/[0.08] pt-5 text-xs text-white/45">
            <span className="h-px w-8 bg-gradient-to-r from-rose-300/70 to-transparent" />
            A universe made for your next anime obsession
            <span className="ml-auto hidden uppercase tracking-[0.2em] text-white/25 sm:block">Scroll to explore ↓</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group relative isolate min-h-[260px] overflow-hidden rounded-[1.65rem] border border-white/[0.09] bg-[#100b15]/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1.5 hover:border-rose-200/30 hover:bg-[#160e1c] sm:p-7"
            >
              <div aria-hidden="true" className={`pointer-events-none absolute -right-12 -top-12 -z-10 h-44 w-44 rounded-full bg-gradient-to-br ${feature.glow} to-transparent blur-3xl opacity-70 transition duration-500 group-hover:scale-125 group-hover:opacity-100`} />
              <div className="mb-7 flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.22em] text-[#d8b56d]/80">{feature.number} / 12</span>
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-xl text-rose-100/80 shadow-inner shadow-white/[0.025] transition duration-300 group-hover:border-rose-200/25 group-hover:bg-rose-300/[0.08] group-hover:text-[#d8b56d]">{feature.symbol}</span>
              </div>
              <h3 className="max-w-[17rem] text-xl font-bold leading-snug tracking-[-0.025em] text-white sm:text-[1.35rem]">{feature.title}</h3>
              <p className="mt-3 min-h-[6rem] text-sm leading-6 text-white/55">{feature.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {feature.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/[0.08] bg-black/25 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50 transition group-hover:border-rose-200/15 group-hover:text-white/65">{tag}</span>
                ))}
              </div>
              <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-rose-300/0 to-transparent transition duration-500 group-hover:via-rose-300/40" />
            </article>
          ))}
        </div>

        <div className="relative mt-12 overflow-hidden rounded-[1.75rem] border border-rose-200/15 bg-gradient-to-r from-rose-400/[0.07] via-white/[0.025] to-fuchsia-400/[0.07] px-6 py-8 text-center backdrop-blur-2xl sm:mt-16 sm:px-10">
          <div aria-hidden="true" className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-rose-200/50 to-transparent" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d8b56d]">Your journey starts here</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Scroll through the feature guide at your own pace. The main website stays behind the intro until you choose <span className="font-semibold text-white">Enter PRI-ANIME</span> or <span className="font-semibold text-white">Skip intro</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
