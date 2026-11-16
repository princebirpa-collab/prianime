const features = [
  { title: "Discover anime", description: "Trending titles, seasonal picks, genres, and curated collections." },
  { title: "Find any title", description: "Search with English, Japanese, and alternate title names." },
  { title: "Your watch journey", description: "Keep saved titles and recent viewing progress together." },
  { title: "Community & creation", description: "Explore Reels, creator spaces, and the PRI-ANIME community." },
];

export default function IntroDetailsShowcase() {
  return (
    <section className="relative border-t border-white/10 bg-[#08050b] px-5 py-14 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-rose-200/75">PRI-ANIME</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Made for anime fans.</h2>
          </div>
          <a href="https://discord.gg/2meCrBHQw" target="_blank" rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:border-rose-200/35 hover:bg-white/10">
            Join Discord <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <article key={feature.title} className="rounded-2xl border border-white/[0.09] bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-rose-200/25 hover:bg-white/[0.055]">
              <span className="font-mono text-xs tracking-widest text-rose-200/65">0{index + 1}</span>
              <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
