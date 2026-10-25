import { useState } from "react";

export default function AnimeSaltLinkForm({ onSelect, mediaType, defaultValue = "" }) {
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("animeSaltLink") || "").trim();
    let url;
    try { url = new URL(value); } catch { setError("Enter a valid AnimeSalt page link."); return; }
    if (url.origin !== "https://animesalt.cx" || url.username || url.password || !/^\/(?:(?:series|movies)\/[a-z0-9-]+|episode\/[a-z0-9-]+-\d+x\d+)\/?$/i.test(url.pathname)) {
      setError("Use an animesalt.cx series, episode or movie link."); return;
    }
    if ((mediaType === "movie" && !url.pathname.startsWith("/movies/")) || (mediaType === "tv" && url.pathname.startsWith("/movies/"))) {
      setError(mediaType === "tv" ? "Use a series or episode link for this title." : "Use a movie link for this title."); return;
    }
    url.search = ""; url.hash = "";
    if (!url.pathname.endsWith("/")) url.pathname += "/";
    setError("");
    onSelect(url.href);
  };
  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor="anime-salt-link" className="block text-xs text-muted-foreground">Matching AnimeSalt episode, series or movie link</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input id="anime-salt-link" name="animeSaltLink" type="url" required maxLength={500} defaultValue={defaultValue} placeholder="https://animesalt.cx/episode/â€¦" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Load backup</button>
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </form>
  );
}

================================================================================
