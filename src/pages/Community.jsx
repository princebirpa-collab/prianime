import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Send, Users, Hash, RefreshCw, ShieldCheck, MessageCircle } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { communityRequest } from "@/lib/communityApi";

export default function Community() {
  const [profile] = useProfile();
  const [servers,setServers]=useState([]);
  const [channels,setChannels]=useState([{id:"world-general",name:"world-chat"},{id:"world-introductions",name:"introductions"},{id:"world-recommendations",name:"anime-recommendations"}]);
  const [active,setActive]=useState("world-general");
  const [messages,setMessages]=useState([]);
  const [draft,setDraft]=useState("");
  const [serverName,setServerName]=useState("");
  const [serverDesc,setServerDesc]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const bottom=useRef(null);
  const loadServers=useCallback(async()=>{try{const r=await communityRequest("/servers");setServers(r.servers||[]);}catch(e){setError(e.message);}},[]);
  const loadMessages=useCallback(async()=>{try{const r=await communityRequest("/messages?channel="+encodeURIComponent(active));setMessages(r.messages||[]);setError("");}catch(e){setError(e.message);}},[active]);
  useEffect(()=>{loadServers();},[loadServers]);
  useEffect(()=>{let live=true;const run=async()=>{try{const r=await communityRequest("/messages?channel="+encodeURIComponent(active));if(live)setMessages(r.messages||[]);}catch(e){if(live)setError(e.message);}};run();const t=setInterval(run,5000);return()=>{live=false;clearInterval(t);};},[active]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  const joinWorld=async()=>{try{await communityRequest("/servers/join",{method:"POST",body:{profileId:profile.id,serverId:"pri-world"}});}catch(e){setError(e.message);}};
  useEffect(()=>{joinWorld();},[profile.id]);
  const send=async(e)=>{e.preventDefault();if(!draft.trim())return;setBusy(true);try{await communityRequest("/messages",{method:"POST",body:{profileId:profile.id,displayName:profile.name,channelId:active,message:draft}});setDraft("");await loadMessages();}catch(e){setError(e.message);}finally{setBusy(false);}};
  const createServer=async(e)=>{e.preventDefault();setBusy(true);try{const r=await communityRequest("/servers",{method:"POST",body:{profileId:profile.id,displayName:profile.name,name:serverName,description:serverDesc}});setServers(v=>[r.server,...v]);setChannels([r.channel]);setActive(r.channel.id);setServerName("");setServerDesc("");}catch(e){setError(e.message);}finally{setBusy(false);}};
  const joinServer=async(s)=>{try{const r=await communityRequest("/servers/join",{method:"POST",body:{profileId:profile.id,serverId:s.id}});setChannels(r.channels||[]);if(r.channels?.[0])setActive(r.channels[0].id);setError("");}catch(e){setError(e.message);}};
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#090a10] pb-10 text-slate-100">
      <div className="border-b border-white/10 bg-[#10121b]/90 px-4 py-4">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div><p className="text-[10px] font-bold tracking-[.24em] text-[#8994ff]">PRI-ANIME SOCIAL</p><h1 className="mt-1 font-display text-xl">Community</h1></div>
          <a href="https://discord.gg/2meCrBHQw" target="_blank" rel="noreferrer" className="rounded-xl border border-[#5865F2]/50 bg-[#5865F2]/15 px-3 py-2 text-xs font-semibold text-[#aab3ff] hover:bg-[#5865F2]/25">Open Discord invite</a>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1600px] gap-0 px-2 pt-4 sm:px-4 lg:grid-cols-[64px_250px_minmax(0,1fr)] xl:grid-cols-[64px_250px_minmax(0,1fr)_230px]">
        <aside className="hidden flex-col items-center gap-3 rounded-l-2xl border border-white/10 bg-[#11131d] py-4 lg:flex">
          <button type="button" onClick={()=>{setActive("world-general");setChannels([{id:"world-general",name:"world-chat"},{id:"world-introductions",name:"introductions"},{id:"world-recommendations",name:"anime-recommendations"}]);}} title="PRI-ANIME World" className={"grid h-11 w-11 place-items-center rounded-2xl text-sm font-black transition "+(active.startsWith("world-")?"bg-[#5865F2] text-white":"bg-white/10 text-slate-200 hover:rounded-xl hover:bg-[#5865F2]")}>PA</button>
          <div className="h-px w-7 bg-white/10"/>
          {servers.filter(s=>s.id!=="pri-world").map(s=><button key={s.id} type="button" title={s.name} onClick={()=>joinServer(s)} className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-sm font-bold text-slate-300 transition hover:rounded-xl hover:bg-[#5865F2] hover:text-white">{(s.name||"S").slice(0,1).toUpperCase()}</button>)}
          <button type="button" title="Create a server" onClick={()=>document.getElementById("community-create-server")?.scrollIntoView({behavior:"smooth",block:"center"})} className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/15 text-xl text-emerald-300 hover:bg-emerald-500/25">+</button>
        </aside>
        <aside className="flex min-h-[680px] flex-col border border-white/10 bg-[#151722] p-3 lg:border-l-0">
          <div className="border-b border-white/10 px-2 pb-4"><p className="font-display text-sm font-bold">PRI-ANIME World</p><p className="mt-1 text-[10px] text-slate-500">Your anime community space</p></div>
          <div className="mt-4 flex items-center justify-between px-2"><span className="text-[10px] font-bold tracking-[.18em] text-slate-500">TEXT CHANNELS</span><Hash className="h-3.5 w-3.5 text-slate-500"/></div>
          <div className="mt-2 space-y-1">{channels.map(ch=><button key={ch.id} type="button" onClick={()=>setActive(ch.id)} className={"flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition "+(active===ch.id?"bg-white/10 text-white":"text-slate-400 hover:bg-white/[.06] hover:text-slate-200")}><Hash className="h-4 w-4 text-slate-500"/><span className="truncate">{ch.name}</span></button>)}</div>
          <form id="community-create-server" onSubmit={createServer} className="mt-auto rounded-xl border border-white/10 bg-black/20 p-3">
            <h3 className="flex items-center gap-2 text-xs font-bold"><Plus className="h-4 w-4 text-[#8994ff]"/> Create a server</h3>
            <input value={serverName} onChange={e=>setServerName(e.target.value)} placeholder="Server name" maxLength={40} className="mt-3 w-full rounded-lg border border-white/10 bg-[#0d0f17] px-3 py-2 text-xs text-white outline-none focus:border-[#8994ff]/60"/>
            <input value={serverDesc} onChange={e=>setServerDesc(e.target.value)} placeholder="Short description" maxLength={180} className="mt-2 w-full rounded-lg border border-white/10 bg-[#0d0f17] px-3 py-2 text-xs text-white outline-none focus:border-[#8994ff]/60"/>
            <button disabled={busy||serverName.trim().length<3} className="mt-3 w-full rounded-lg bg-[#5865F2] px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Create server</button>
          </form>
        </aside>
        <section className="flex min-h-[680px] min-w-0 flex-col border-y border-r border-white/10 bg-[#1b1d29]">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-4"><div><p className="text-[9px] font-bold tracking-[.2em] text-[#8994ff]">COMMUNITY CHAT</p><h2 className="mt-1 flex items-center gap-2 font-display text-lg"><Hash className="h-4 w-4 text-slate-500"/>{channels.find(ch=>ch.id===active)?.name||"server-chat"}</h2></div><button onClick={loadMessages} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Refresh chat"><RefreshCw className="h-4 w-4"/></button></header>
          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">{messages.length===0?<div className="grid h-full min-h-64 place-items-center text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#5865F2]/15"><MessageCircle className="h-7 w-7 text-[#9da7ff]"/></div><p className="mt-4 font-display text-xl">Welcome to #{channels.find(ch=>ch.id===active)?.name||"server-chat"}</p><p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">This is the beginning of the conversation. Be respectful, avoid personal details and mark spoilers clearly.</p></div></div>:messages.map(m=><article key={m.id} className="group flex gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[.035]"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#5865F2] to-[#a855f7] text-sm font-black text-white">{(m.display_name||"A").slice(0,1).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline gap-2"><b className="text-sm text-slate-100">{m.display_name||"Anime fan"}</b><time className="text-[10px] text-slate-500">{new Date(m.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</time></div><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{m.body}</p></div></article>)}<div ref={bottom}/></div>
          <form onSubmit={send} className="border-t border-white/10 p-4"><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#10121b] px-3"><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={"Message #"+(channels.find(ch=>ch.id===active)?.name||"server-chat")} maxLength={500} className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-500"/><button disabled={busy||!draft.trim()} aria-label="Send message" className="grid h-9 w-9 place-items-center rounded-lg bg-[#5865F2] text-white disabled:opacity-40"><Send className="h-4 w-4"/></button></div><p className="mt-2 px-1 text-[10px] text-slate-500">Posting as {profile.name} · Keep the community friendly.</p></form>
        </section>
        <aside className="hidden min-h-[680px] flex-col gap-4 border-y border-r border-white/10 bg-[#151722] p-4 xl:flex">
          <section><p className="text-[10px] font-bold tracking-[.18em] text-slate-500">YOUR PROFILE</p><div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[.04] p-3"><div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#5865F2] text-sm font-bold">{profile.avatar?<img src={profile.avatar} alt="" className="h-full w-full object-cover"/>:profile.name.slice(0,1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{profile.name}</p><p className="text-[10px] text-emerald-300">PRI-ANIME member</p></div></div></section>
          <section><div className="flex items-center justify-between"><p className="text-[10px] font-bold tracking-[.18em] text-slate-500">PUBLIC SERVERS</p><Users className="h-3.5 w-3.5 text-slate-500"/></div><div className="mt-3 space-y-2">{servers.map(s=><div key={s.id} className="rounded-xl border border-white/10 bg-black/15 p-3"><p className="truncate text-xs font-semibold">{s.name}</p><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{s.description||"Anime fan server"}</p><button onClick={()=>joinServer(s)} className="mt-2 text-[10px] font-bold text-[#aab3ff] hover:text-white">Join server →</button></div>)}</div></section>
          <section className="mt-auto rounded-xl border border-[#5865F2]/30 bg-[#5865F2]/10 p-3"><ShieldCheck className="h-5 w-5 text-[#aab3ff]"/><p className="mt-2 text-xs font-bold">Community safety</p><p className="mt-1 text-[10px] leading-4 text-slate-400">Never share passwords, private contact details or your location. Use the Discord invite for the wider community.</p><a href="https://discord.gg/2meCrBHQw" target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg bg-[#5865F2] px-3 py-2 text-[10px] font-bold text-white">Join Discord</a></section>
        </aside>
      </div>
      {error&&<p role="alert" className="mx-auto mt-4 max-w-3xl rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">{error}</p>}
    </div>
  );
}
