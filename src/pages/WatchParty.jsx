import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Users, Copy, Link2, Play, RefreshCw, Check, Film } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useProfile } from "@/lib/profile";
import { communityRequest } from "@/lib/communityApi";
import { callAniList } from "@/lib/animeApi";

export default function WatchParty() {
  const [profile] = useProfile();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [room, setRoom] = useState(null);
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const roomId = params.get("room");
  const animeId = params.get("anime");
  const invite = useMemo(() => {
    if (!room) return "";
    const url = new URL(window.location.href);
    url.searchParams.set("room", room.id);
    if (selected?.id) url.searchParams.set("anime", String(selected.id));
    return url.toString();
  }, [room, selected]);

  const searchAnime = useCallback(async (value) => {
    const term = value.trim();
    if (term.length < 2) { setResults([]); return; }
    setSearching(true);
    setError("");
    try {
      const data = await callAniList({ action: "search", q: term, page: 1 });
      setResults((data.items || []).filter((item) => item && item.source !== "mal" || item));
    } catch (e) {
      setError(e.message || "Anime search is temporarily unavailable.");
      setResults([]);
    } finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setResults([]); return undefined; }
    const timer = setTimeout(() => searchAnime(term), 350);
    return () => clearTimeout(timer);
  }, [query, searchAnime]);

  const joinRoom = useCallback(async (id) => {
    if (!id) return;
    setBusy(true);
    setError("");
    try {
      const result = await communityRequest("/servers/join", {
        method: "POST",
        body: { profileId: profile.id, serverId: id },
      });
      setRoom(result.server || { id, name: "Watch Party" });
      if (animeId) {
        try {
          const detail = await callAniList({ action: "by_id", id: animeId });
          setSelected(detail.item || null);
        } catch { setSelected(null); }
      }
    } catch (e) {
      setError(e.message || "Could not join this party. Check the invite link.");
    } finally { setBusy(false); }
  }, [profile.id, animeId]);

  useEffect(() => {
    if (roomId) joinRoom(roomId);
  }, [roomId, joinRoom]);

  const createParty = async () => {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await communityRequest("/servers", {
        method: "POST",
        body: {
          profileId: profile.id,
          displayName: profile.name,
          name: (selected.display || "Anime") + " Watch Party",
          description: "Watching together • " + (selected.format || "Anime") + (selected.episodes ? " • " + selected.episodes + " episodes" : ""),
        },
      });
      if (!result.server?.id) throw new Error("The party room could not be created.");
      setRoom(result.server);
      setParams({ room: result.server.id, anime: String(selected.id) });
    } catch (e) {
      setError(e.message || "Could not create the party.");
    } finally { setBusy(false); }
  };

  const copyInvite = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { setError("Copy failed. You can copy the invite link from the address bar."); }
  };

  const clearParty = () => {
    setRoom(null);
    setSelected(null);
    setParams({});
  };

  return <div className="min-h-[70vh] pb-16">
    <PageHeader eyebrow="PRI-ANIME TOGETHER" title="Watch Party" description="Choose an anime, create a room, and invite your friends with one link." />
    <main className="mx-auto max-w-5xl space-y-6 px-4 pt-7 sm:px-6 lg:px-8">
      {!room ? <>
        <section className="rounded-3xl border border-border/60 bg-card/55 p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary"><Film className="h-5 w-5"/></div>
            <div><h2 className="font-display text-xl">Choose your anime</h2><p className="text-sm text-muted-foreground">Search the catalogue and select what everyone will watch.</p></div>
          </div>
          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search anime titles…" className="w-full rounded-2xl border border-border bg-background/80 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary/60"/>
          </div>
          {searching && <p className="mt-3 text-xs text-muted-foreground">Searching anime…</p>}
          {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
          {results.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {results.slice(0, 10).map((anime) => <button key={anime.id} onClick={()=>setSelected(anime)} className={"flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition "+(String(selected?.id)===String(anime.id)?"border-primary bg-primary/10":"border-border/60 bg-background/50 hover:border-primary/50")}>
              <img src={anime.cover} alt="" loading="lazy" className="h-20 w-14 shrink-0 rounded-lg object-cover bg-muted"/>
              <span className="min-w-0 flex-1"><b className="block line-clamp-2 text-sm">{anime.display}</b><span className="mt-1 block text-xs text-muted-foreground">{[anime.format, anime.seasonYear, anime.episodes ? anime.episodes+" eps" : ""].filter(Boolean).join(" · ")}</span></span>
              {String(selected?.id)===String(anime.id) && <Check className="h-4 w-4 shrink-0 text-primary"/>}
            </button>)}
          </div>}
          {query.trim().length >= 2 && !searching && !results.length && !error && <p className="mt-5 text-center text-sm text-muted-foreground">No matching anime found. Try another title.</p>}
        </section>
        {selected && <section className="flex flex-col gap-4 rounded-3xl border border-primary/30 bg-primary/[.06] p-4 sm:flex-row sm:items-center sm:p-5">
          <img src={selected.cover} alt="" className="h-28 w-20 rounded-xl object-cover bg-muted"/>
          <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold tracking-[.2em] text-primary">SELECTED ANIME</p><h3 className="mt-1 font-display text-xl">{selected.display}</h3><p className="mt-1 text-xs text-muted-foreground">{[selected.format, selected.seasonYear, selected.episodes ? selected.episodes+" episodes" : ""].filter(Boolean).join(" · ")}</p></div>
          <button onClick={createParty} disabled={busy} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Users className="h-4 w-4"/>}{busy ? "Creating…" : "Create Party"}</button>
        </section>}
      </> : <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/55">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-5">
          <div><p className="text-[10px] font-semibold tracking-[.2em] text-primary">PARTY ROOM READY</p><h2 className="mt-1 font-display text-2xl">{room.name || "Your Watch Party"}</h2><p className="mt-1 text-sm text-muted-foreground">Share the invite link so your friends can join.</p></div>
          <button onClick={copyInvite} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"><Copy className="h-4 w-4"/>{copied ? "Copied!" : "Copy invite link"}</button>
        </div>
        {selected ? <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <img src={selected.cover} alt="" className="h-40 w-28 rounded-xl object-cover bg-muted"/>
          <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold tracking-[.2em] text-primary">TONIGHT'S PICK</p><h3 className="mt-2 font-display text-2xl">{selected.display}</h3><p className="mt-2 text-sm text-muted-foreground">{[selected.format, selected.seasonYear, selected.episodes ? selected.episodes+" episodes" : ""].filter(Boolean).join(" · ")}</p><Link to={"/watch?anime="+encodeURIComponent(selected.id)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"><Play className="h-4 w-4"/> Watch anime</Link></div>
        </div> : <div className="p-6 text-sm text-muted-foreground">Party joined. The selected anime details could not be loaded from this invite.</div>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-background/30 p-4"><p className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-4 w-4"/> Friends can join using the same invite link.</p><button onClick={clearParty} className="rounded-lg border border-border px-3 py-2 text-xs hover:border-primary/50">Create another party</button></div>
      </section>}
      {error && !room && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <p className="text-center text-xs text-muted-foreground">Invite only people you know. Each friend opens playback on their own device; synchronized play/pause is not included yet.</p>
    </main>
  </div>;
}
