import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Users, Copy, Play, RefreshCw, Check, Film, MessageCircle, Send, Smile, ImagePlus, X } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useProfile } from "@/lib/profile";
import { communityRequest } from "@/lib/communityApi";
import { callAniList } from "@/lib/animeApi";

const EMOJIS = ["😀","😂","🥹","😍","🔥","❤️","💀","😭","✨","👏","👍","👀","🎉","🍿","🎬","🤝","😎","🤔","🙌","💯"];

function compressImage(file) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!file || !file.type.startsWith("image/")) return reject(new Error("Choose an image file."));
      if (file.size > 8 * 1024 * 1024) return reject(new Error("Choose an image smaller than 8 MB."));
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Could not prepare this image."));
        if (blob.size > 450 * 1024) return reject(new Error("This image is still too large. Choose a smaller image."));
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read this image."));
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.72);
    } catch {
      reject(new Error("This image could not be opened."));
    }
  });
}

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
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [pendingImage, setPendingImage] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

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
      setResults((data.items || []).filter(Boolean));
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
      setRoom({ id, name: result.server?.name || "Watch Party", channelId: result.channels?.[0]?.id || "" });
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

  useEffect(() => {
    if (!room?.channelId) return undefined;
    let active = true;
    const loadMessages = async () => {
      try {
        const data = await communityRequest("/messages?channel=" + encodeURIComponent(room.channelId) + "&profileId=" + encodeURIComponent(profile.id));
        if (active) setMessages(data.messages || []);
      } catch (e) {
        if (active) setError(e.message || "Party chat is temporarily unavailable.");
      }
    };
    loadMessages();
    const timer = setInterval(loadMessages, 2500);
    return () => { active = false; clearInterval(timer); };
  }, [room?.channelId, profile.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

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
      if (!result.server?.id || !result.channel?.id) throw new Error("The party room could not be created.");
      setRoom({ ...result.server, channelId: result.channel.id });
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
    } catch { setError("Copy failed. You can copy the invite link from the field."); }
  };

  const sendMessage = async () => {
    if ((!draft.trim() && !pendingImage) || sending || !room?.channelId) return;
    setSending(true);
    setError("");
    try {
      await communityRequest("/messages", {
        method: "POST",
        body: {
          profileId: profile.id,
          displayName: profile.name,
          channelId: room.channelId,
          message: draft.trim(),
          imageData: pendingImage || undefined,
        },
      });
      setDraft("");
      setPendingImage("");
      setShowEmoji(false);
      const data = await communityRequest("/messages?channel=" + encodeURIComponent(room.channelId) + "&profileId=" + encodeURIComponent(profile.id));
      setMessages(data.messages || []);
    } catch (e) {
      setError(e.message || "Message could not be sent.");
    } finally { setSending(false); }
  };

  const chooseImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageBusy(true);
    setError("");
    try { setPendingImage(await compressImage(file)); }
    catch (e) { setError(e.message || "Image could not be attached."); }
    finally { setImageBusy(false); }
  };

  const clearParty = () => {
    setRoom(null);
    setSelected(null);
    setMessages([]);
    setPendingImage("");
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
          <div><p className="text-[10px] font-semibold tracking-[.2em] text-primary">PARTY ROOM READY</p><h2 className="mt-1 font-display text-2xl">{room.name || "Your Watch Party"}</h2><p className="mt-1 text-sm text-muted-foreground">Your anime, invite link and party chat are all here.</p></div>
          <button onClick={copyInvite} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"><Copy className="h-4 w-4"/>{copied ? "Copied!" : "Copy invite link"}</button>
        </div>
        <div className="border-b border-border/60 bg-background/25 p-4">
          <label className="mb-2 block text-xs font-semibold text-muted-foreground">PARTY INVITE LINK</label>
          <div className="flex gap-2"><input readOnly value={invite} className="min-w-0 flex-1 rounded-xl border border-border bg-background/70 px-3 py-2.5 text-xs text-muted-foreground"/><button onClick={copyInvite} aria-label="Copy invite link" className="rounded-xl border border-border px-3 text-sm hover:border-primary/50"><Copy className="h-4 w-4"/></button></div>
        </div>
        {selected ? <div className="flex flex-col gap-5 border-b border-border/60 p-5 sm:flex-row sm:items-center">
          <img src={selected.cover} alt="" className="h-36 w-24 rounded-xl object-cover bg-muted"/>
          <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold tracking-[.2em] text-primary">TONIGHT'S PICK</p><h3 className="mt-2 font-display text-2xl">{selected.display}</h3><p className="mt-2 text-sm text-muted-foreground">{[selected.format, selected.seasonYear, selected.episodes ? selected.episodes+" episodes" : ""].filter(Boolean).join(" · ")}</p><Link to={"/watch?anime="+encodeURIComponent(selected.id)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"><Play className="h-4 w-4"/> Watch anime</Link></div>
        </div> : <div className="border-b border-border/60 p-6 text-sm text-muted-foreground">Party joined. The selected anime details could not be loaded from this invite.</div>}
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary"/><div><h3 className="font-display text-lg">Party chat</h3><p className="text-xs text-muted-foreground">Messages and images are shared with members of this room.</p></div></div>
          <div className="h-[340px] space-y-3 overflow-y-auto rounded-2xl border border-border/60 bg-background/50 p-3 sm:h-[400px]">
            {messages.length === 0 && <div className="grid h-full place-items-center text-center"><div><MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50"/><p className="text-sm text-muted-foreground">No messages yet. Say hello to your party!</p></div></div>}
            {messages.map((message) => <div key={message.id} className={"flex "+(message.profile_id===profile.id?"justify-end":"justify-start")}>
              <div className={"max-w-[85%] rounded-2xl px-3 py-2 "+(message.profile_id===profile.id?"bg-primary/15":"bg-card border border-border/60")}>
                <p className="mb-1 text-[10px] font-semibold text-primary">{message.profile_id===profile.id?"You":message.display_name}</p>
                {message.imageData && <a href={message.imageData} target="_blank" rel="noreferrer"><img src={message.imageData} alt="Shared in party chat" loading="lazy" className="mb-2 max-h-64 max-w-full rounded-xl object-contain"/></a>}
                {message.body && message.body!=="📷 Image" && <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>}
                <p className="mt-1 text-right text-[9px] text-muted-foreground">{message.created_at ? new Date(message.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : ""}</p>
              </div>
            </div>)}
            <div ref={bottomRef}/>
          </div>
          {pendingImage && <div className="mt-3 flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-2"><img src={pendingImage} alt="Image attachment preview" className="h-16 w-16 rounded-lg object-cover"/><span className="flex-1 text-xs text-muted-foreground">Image ready to send</span><button onClick={()=>setPendingImage("")} aria-label="Remove image" className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4"/></button></div>}
          <div className="relative mt-3 flex items-end gap-2">
            <input ref={fileRef} type="file" accept="image/*" onChange={chooseImage} className="hidden"/>
            <button onClick={()=>fileRef.current?.click()} disabled={imageBusy||sending} title="Attach image" aria-label="Attach image" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border hover:border-primary/50 disabled:opacity-50">{imageBusy?<RefreshCw className="h-4 w-4 animate-spin"/>:<ImagePlus className="h-4 w-4"/>}</button>
            <div className="relative min-w-0 flex-1">
              <textarea value={draft} onChange={(e)=>setDraft(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} rows={1} maxLength={500} placeholder="Message your party…" className="max-h-28 min-h-11 w-full resize-y rounded-xl border border-border bg-background px-3 py-3 pr-11 text-sm outline-none focus:border-primary/60"/>
              <button onClick={()=>setShowEmoji((v)=>!v)} title="Add emoji" aria-label="Add emoji" className="absolute right-2 top-2.5 rounded-md p-1 text-muted-foreground hover:text-primary"><Smile className="h-4 w-4"/></button>
              {showEmoji && <div className="absolute bottom-14 right-0 z-20 grid w-64 grid-cols-5 gap-1 rounded-2xl border border-border bg-card p-3 shadow-xl">{EMOJIS.map((emoji)=><button key={emoji} onClick={()=>setDraft((value)=>value+emoji)} className="rounded-lg p-2 text-xl hover:bg-muted">{emoji}</button>)}</div>}
            </div>
            <button onClick={sendMessage} disabled={sending||(!draft.trim()&&!pendingImage)||!room.channelId} aria-label="Send message" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50">{sending?<RefreshCw className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>}</button>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">Enter to send · Shift + Enter for a new line · Images are compressed before sending.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-background/30 p-4"><p className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-4 w-4"/> Invite friends to this room to chat together.</p><button onClick={clearParty} className="rounded-lg border border-border px-3 py-2 text-xs hover:border-primary/50">Create another party</button></div>
      </section>}
      {error && !room && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <p className="text-center text-xs text-muted-foreground">Invite only people you know. Each friend opens playback on their own device; synchronized play/pause is not included yet.</p>
    </main>
  </div>;
}
