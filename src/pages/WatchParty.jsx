import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Users, Plus, Send, Copy, Radio, Link2, RefreshCw, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useProfile } from "@/lib/profile";
import { communityRequest } from "@/lib/communityApi";
import ServerVideoPlayer from "@/components/video/ServerVideoPlayer";
import { parseVidstuckUrl } from "@/components/video/vidstuckUrls";

export default function WatchParty() {
  const [profile] = useProfile();
  const [params, setParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [channel, setChannel] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [draft, setDraft] = useState("");
  const [watchUrl, setWatchUrl] = useState("");
  const [watchTitle, setWatchTitle] = useState("");
  const [partyVideo, setPartyVideo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef(null);

  const loadRooms = useCallback(async () => {
    try { const result = await communityRequest("/servers"); setRooms(result.servers || []); }
    catch (e) { setError(e.message); }
  }, []);

  const loadMessages = useCallback(async (channelId) => {
    if (!channelId) return;
    try { const result = await communityRequest("/messages?channel=" + encodeURIComponent(channelId)); setMessages(result.messages || []); setError(""); }
    catch (e) { setError(e.message); }
  }, []);

  const joinRoom = useCallback(async (item) => {
    setBusy(true);
    try {
      const result = await communityRequest("/servers/join", { method: "POST", body: { profileId: profile.id, serverId: item.id } });
      const nextChannel = result.channels?.[0]?.id;
      if (!nextChannel) throw new Error("This room has no chat channel yet.");
      setRoom(item); setChannel(nextChannel); setParams({ room: item.id }); setMessages(result.messages || []);
      await loadMessages(nextChannel);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }, [profile.id, setParams, loadMessages]);

  useEffect(() => { loadRooms(); }, [loadRooms]);
  useEffect(() => {
    const roomId = params.get("room");
    if (roomId && rooms.length && !room) {
      const found = rooms.find((item) => item.id === roomId);
      if (found) joinRoom(found);
      else setError("That party room was not found. Refresh the room list and try again.");
    }
  }, [params, rooms, room, joinRoom]);
  useEffect(() => {
    if (!channel) return undefined;
    loadMessages(channel);
    const timer = setInterval(() => loadMessages(channel), 4000);
    return () => clearInterval(timer);
  }, [channel, loadMessages]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const createRoom = async (event) => {
    event.preventDefault();
    if (roomName.trim().length < 3) return;
    setBusy(true);
    try {
      const result = await communityRequest("/servers", { method: "POST", body: { profileId: profile.id, displayName: profile.name, name: roomName.trim(), description: (description.trim() || "PRI-ANIME Watch Party") + " • Watch party room" } });
      const created = result.server;
      setRooms((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      setRoomName(""); setDescription("");
      if (result.channel?.id) { setRoom(created); setChannel(result.channel.id); setParams({ room: created.id }); setMessages([]); }
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !channel) return;
    setBusy(true);
    try {
      await communityRequest("/messages", { method: "POST", body: { profileId: profile.id, displayName: profile.name, channelId: channel, message: draft.trim() } });
      setDraft(""); await loadMessages(channel);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const loadPartyVideo = () => {
    const parsed = parseVidstuckUrl(watchUrl.trim());
    if (!parsed) {
      setError("Paste a valid Vidstuck movie or TV episode embed URL. The player server code is unchanged.");
      return;
    }
    setPartyVideo({ src: parsed.url.href, title: watchTitle.trim() || room?.name || "PRI-ANIME Watch Party" });
    setError("");
  };

  const shareWatchLink = async () => {
    const parsed = parseVidstuckUrl(watchUrl.trim());
    if (!parsed) {
      setError("Paste a valid Vidstuck embed URL before sharing it with the party.");
      return;
    }
    try {
      const title = watchTitle.trim() || room?.name || "Watch Party";
      await communityRequest("/messages", { method: "POST", body: { profileId: profile.id, displayName: profile.name, channelId: channel, message: "🎬 PARTY VIDEO | " + title + " | " + parsed.url.href } });
      setPartyVideo({ src: parsed.url.href, title });
      setWatchUrl("");
      await loadMessages(channel);
    } catch (e) { setError(e.message || "Could not share this video with the party."); }
  };

  const invite = typeof window !== "undefined" && room ? window.location.origin + "/watch-party?room=" + encodeURIComponent(room.id) : "";
  return <div className="pb-16">
    <PageHeader eyebrow="PRI-ANIME TOGETHER" title="Watch Party" description="Create a room, invite friends and chat while sharing what to watch." />
    <div className="mx-auto grid max-w-[1400px] gap-5 px-4 pt-7 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-10">
      <aside className="space-y-4">
        <form onSubmit={createRoom} className="rounded-2xl border border-primary/25 bg-card/60 p-4">
          <p className="flex items-center gap-2 font-display text-lg"><Plus className="h-4 w-4 text-primary"/> Create a party room</p>
          <input value={roomName} onChange={(e)=>setRoomName(e.target.value)} placeholder="Room name" maxLength={40} className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"/>
          <input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Anime / episode (optional)" maxLength={100} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"/>
          <button disabled={busy || roomName.trim().length<3} className="mt-3 w-full rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">Create room</button>
        </form>
        <section className="rounded-2xl border border-border/60 bg-card/50 p-4">
          <div className="flex items-center justify-between"><h2 className="font-display">Public party rooms</h2><button onClick={loadRooms} aria-label="Refresh rooms" className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/5"><RefreshCw className="h-4 w-4"/></button></div>
          <div className="mt-3 space-y-2">{rooms.length ? rooms.map((item)=><button key={item.id} onClick={()=>joinRoom(item)} disabled={busy} className={"w-full rounded-xl border p-3 text-left transition "+(room?.id===item.id?"border-primary/50 bg-primary/10":"border-border/50 bg-background/40 hover:border-primary/40")}><span className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-primary"/>{item.name}</span><span className="mt-1 block text-xs text-muted-foreground">{item.description || "Watch party room"}</span><span className="mt-2 block text-[10px] text-muted-foreground">{item.members || 0} members · Join room</span></button>) : <p className="py-4 text-xs text-muted-foreground">No public rooms yet. Create the first one.</p>}</div>
        </section>
      </aside>
      <section className="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/45">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4"><div><p className="flex items-center gap-2 text-[10px] tracking-[.2em] text-primary"><Radio className="h-3 w-3"/> PARTY LOUNGE</p><h2 className="mt-1 font-display text-xl">{room?.name || "Choose or create a room"}</h2></div>{room && <button onClick={()=>navigator.clipboard?.writeText(invite)} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs hover:border-primary/50"><Copy className="h-3.5 w-3.5"/> Copy invite link</button>}</header>
        {!room ? <div className="grid flex-1 place-items-center p-8 text-center"><div><Users className="mx-auto h-10 w-10 text-primary/70"/><p className="mt-3 font-display text-xl">Your watch room is waiting</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">Create a room or join a public party to open the group chat.</p></div></div> : <>
          <div className="border-b border-border/50 bg-primary/[.04] p-4">
            <p className="text-xs font-semibold">Party screening · Vidstuck + backups</p>
            <input value={watchTitle} onChange={(e)=>setWatchTitle(e.target.value)} placeholder="Anime / movie title (optional)" maxLength={100} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"/>
            <div className="mt-2 flex flex-wrap gap-2"><input value={watchUrl} onChange={(e)=>setWatchUrl(e.target.value)} placeholder="Paste Vidstuck movie / episode embed URL…" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"/><button type="button" onClick={loadPartyVideo} disabled={!watchUrl.trim()} className="rounded-xl border border-primary/40 px-4 py-2 text-xs font-semibold text-primary disabled:opacity-50">Load player</button><button type="button" onClick={shareWatchLink} disabled={!watchUrl.trim()||busy} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"><Link2 className="mr-1 inline h-3.5 w-3.5"/> Share with party</button></div>
            <p className="mt-2 text-[11px] text-muted-foreground">Vidstuck is the main server. AnimeSalt and AniKoto are available as selectable backup options in the player. Everyone opens playback on their own device; synced play/pause and seeking are not enabled.</p>
            {partyVideo && <div className="mt-4 space-y-2"><p className="text-sm font-semibold">{partyVideo.title}</p><ServerVideoPlayer key={partyVideo.src} src={partyVideo.src} title={partyVideo.title}/></div>}
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">{messages.length ? messages.map((m)=><article key={m.id} className="flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">{(m.display_name||"A").slice(0,1).toUpperCase()}</div><div className="min-w-0"><div className="flex items-baseline gap-2"><b className="text-sm">{m.display_name}</b><time className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</time></div><p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/85">{m.body}</p></div></article>) : <p className="py-12 text-center text-sm text-muted-foreground">Say hello to start the party chat.</p>}<div ref={bottom}/></div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-border/60 p-3"><input value={draft} onChange={(e)=>setDraft(e.target.value)} placeholder="Chat with your party…" maxLength={500} className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm"/><button disabled={busy||!draft.trim()} aria-label="Send party message" className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4"/></button></form>
        </>}
      </section>
      <aside className="lg:col-span-2"><div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/35 p-3 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-primary"/><span>Party rooms use PRI-ANIME community chat. Keep invites private to people you know. Do not share personal contact details. This first version shares links and chat; it does not synchronize playback between devices.</span></div>{error && <p role="alert" className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}</aside>
    </div>
  </div>;
}