import PageHeader from "@/components/common/PageHeader";

const SECTIONS = [
  {
    title: "What this app streams",
    body: "PRI-ANIME plays video that the creator uploaded through the creator studio, or open-licensed demo clips shipped with the app. AniList and MyAnimeList are metadata providers only â€” they do not host or licence episodes, and this app never scrapes streaming sites or stores pirate links.",
  },
  {
    title: "Metadata licence",
    body: "Titles, artwork, genres and scores are fetched from the official AniList GraphQL API at runtime. MyAnimeList ratings appear only when that provider returns real data with valid credentials. Anime artwork remains the property of its licence holders and is used here for identification only.",
  },
  {
    title: "Uploads & moderation",
    body: "Every reel and screening stores a creator-declared licence. Anyone can report a reel, a video or a comment; reports land in the admin moderation queue, which the database only exposes to workspace administrators. Admins can hide or delete content.",
  },
  {
    title: "Configuration",
    body: "Secrets live in environment variables on the server. Nothing private is written to browser storage, HTML or public API responses. Video provider checks return status only â€” never a key.",
  },
];

const ENV_VARS = [
  ["ANILIST_API_URL", "https://graphql.anilist.co", "Public GraphQL endpoint. No key required."],
  ["MAL_CLIENT_ID", "â€”", "From the MyAnimeList API panel. Required for MAL ratings."],
  ["MAL_CLIENT_SECRET", "â€”", "Only needed for refresh-token flows."],
  ["MAL_ACCESS_TOKEN", "â€”", "Bearer token from the MAL OAuth flow."],
  ["VIDEO_PROVIDER", "cloudflare | mux | generic", "Selects the adapter."],
  ["VIDEO_API_URL", "â€”", "Provider API base, e.g. Cloudflare account stream URL."],
  ["VIDEO_API_KEY", "â€”", "Server-side API token (Basic id:secret for Mux)."],
  ["VIDEO_PLAYBACK_URL", "â€”", "Playback host for signed manifests."],
];

export default function Policy() {
  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Policies & operations"
        title="Licences, secrets and deployment"
        description="Everything an operator needs to run PRI-ANIME honestly: what it plays, what it stores, and which credentials unlock the optional integrations."
      />

      <div className="mx-auto w-full max-w-[1100px] space-y-6 px-4 pt-8 sm:px-6 lg:px-10">
        <div className="grid gap-3 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <section key={section.title} className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <h2 className="font-display text-xl">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="font-display text-xl">Environment variables</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set these in the workspace environment settings â€” never in frontend files. Missing values are reported as
            â€œnot configuredâ€ rather than faked.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="py-2 pr-4">Variable</th>
                  <th className="py-2 pr-4">Example</th>
                  <th className="py-2">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {ENV_VARS.map(([name, example, purpose]) => (
                  <tr key={name} className="border-b border-border/30 last:border-0">
                    <td className="py-2.5 pr-4 font-mono text-xs text-primary">{name}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{example}</td>
                    <td className="py-2.5 text-muted-foreground">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="font-display text-xl">Run it locally (Windows PowerShell)</h2>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-border/60 bg-background/70 p-4 text-xs leading-relaxed text-foreground/85">
{`cd C:\\path\\to\\pri-anime
npm install
npm run dev
# open http://localhost:5173

# production checks
npm run lint
npm run build`}
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">
            In VS Code: open the folder, then Terminal â†’ New Terminal, and paste the commands above.
          </p>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="font-display text-xl">Going live on your own domain</h2>
          <ol className="mt-3 grid gap-2 text-sm text-muted-foreground">
            {[
              "Publish the app, then connect your domain from the dashboard's Domains page and point DNS at it.",
              "Serve over HTTPS only; HSTS protects signed playback URLs.",
              "Add the production origin to CORS allow-lists for every provider you call from the browser.",
              "Store all provider keys as environment variables â€” rotate them if a key ever appears in client code.",
              "Move metadata caching to a shared cache (Redis or edge KV) before traffic grows; the in-process cache is per instance.",
              "Put media behind object storage + CDN, and run long renders through a queue rather than a request.",
              "Add monitoring (error tracking + uptime checks) and load-test before claiming any concurrency figure.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="font-display text-xl">Honest limits</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li>â€¢ This build runs without sign-in, so saved lists live in the device profile, not an account.</li>
            <li>â€¢ MyAnimeList ratings need real credentials; until then the app says â€œunavailableâ€.</li>
            <li>â€¢ AI video rendering depends on the workspace plan and the video model's limits.</li>
            <li>â€¢ No claim is made about extreme concurrency â€” that needs load testing and shared infrastructure.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

================================================================================
