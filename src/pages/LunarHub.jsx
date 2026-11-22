import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProfile, saveProfile } from "@/lib/profile";
import { communityRequest } from "@/lib/communityApi";
import { listSaved, listProgress } from "@/lib/library";
import { callAniList } from "@/lib/animeApi";
import PageHeader from "@/components/common/PageHeader";
import { Users, Film, Bookmark, Heart, MessageCircle, Trophy, Sparkles, RefreshCw, ExternalLink } from "lucide-react";

const tiles = [
 {title:"Watch Party",desc:"Create a shared room and chat while watching.",to:"/watch-party",icon:Users},
 {title:"Community",desc:"Servers, channels and conversations.",to:"/community",icon:MessageCircle},
 {title:"Your Library",desc:"Watchlist, favourites and viewing progress.",to:"/library",icon:Bookmark},
 {title:"Missions",desc:"Explore achievements and activity.",to:"/missions",icon:Trophy},
 {title:"AI Studio",desc:"Write original stories and episode concepts.",to:"/studio",icon:Sparkles},
 {title:"Browse anime",desc:"Find your next show.",to:"/browse",icon:Film},
];
export default function LunarHub(){
 const [profile,update]=useProfile();
 const [stats,setStats]=useState({watchlist:0,favorites:0,progress:0,community:false});
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const [name,setName]=useState(profile.name||""),[bio,setBio]=useState(profile.bio||"");
 useEffect(()=>{setName(profile.name||"");setBio(profile.bio||"");},[profile]);
 useEffect(()=>{let alive=true; Promise.all([listSaved("watchlist").catch(()=>[]),listSaved("favorite").catch(()=>[]),listProgress("anime").catch(()=>[]),communityRequest("/servers").then(()=>true).catch(()=>false)]).then(([w,f,p,c])=>{if(alive)setStats({watchlist:w.length,favorites:f.length,progress:p.length,community:c});});return()=>{alive=false};},[]);
 const save=()=>{const n=name.trim().slice(0,32);if(!n)return;update({name:n,bio:bio.trim().slice(0,160)});setMessage("Profile updated on this device.");};
 const sync=async()=>{setBusy(true);setMessage("");try{const data=await callAniList({action:"search",q:"",page:1});setMessage("AniList service connected. Use Library and anime detail pages to track titles.");}catch{setMessage("AniList service could not be reached right now.");}finally{setBusy(false)}};
 return <div className="pb-16"><PageHeader eyebrow="PRI-ANIME • SOCIAL EXPERIENCE" title="Anime Universe" description="Your profile, watch activity, community and shared experiences in one place."/><main className="mx-auto max-w-6xl space-y-8 px-4 pt-6 sm:px-6">
 <section className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card/70 to-violet-500/10 p-5 sm:p-8"><div className="flex flex-wrap items-start gap-5"><div className="grid h-20 w-20 place-items-center overflow-hidden rounded-3xl border border-primary/30 bg-primary/15 text-3xl font-bold text-primary">{profile.avatar?<img src={profile.avatar} alt="" className="h-full w-full object-cover"/>:profile.name?.slice(0,1).toUpperCase()}</div><div className="min-w-0 flex-1"><h2 className="font-display text-2xl">{profile.name}</h2><p className="mt-1 text-sm text-muted-foreground">{profile.bio||"Add a short profile bio."}</p><Link to="/settings" className="mt-3 inline-flex items-center gap-1 text-xs text-primary">Profile & appearance <ExternalLink className="h-3 w-3"/></Link></div></div>
 <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[{label:"Watchlist",value:stats.watchlist,icon:Bookmark},{label:"Favorites",value:stats.favorites,icon:Heart},{label:"Tracked titles",value:stats.progress,icon:Film},{label:"Community",value:stats.community?"Online":"Available",icon:Users}].map(s=><div key={s.label} className="rounded-2xl border border-border/50 bg-background/40 p-4"><s.icon className="h-4 w-4 text-primary"/><p className="mt-3 text-xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>)}</div></section>
 <section className="rounded-2xl border border-border/60 bg-card/40 p-5"><h2 className="font-display text-xl">Quick profile edit</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs text-muted-foreground">Display name<input value={name} maxLength={32} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"/></label><label className="text-xs text-muted-foreground">Bio<input value={bio} maxLength={160} onChange={e=>setBio(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"/></label></div><button onClick={save} className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save profile</button></section>
 <section><div className="mb-4"><h2 className="font-display text-2xl">Explore your features</h2><p className="text-sm text-muted-foreground">Integrated links to PRI-ANIME's existing social and discovery features.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tiles.map(t=><Link key={t.to} to={t.to} className="group rounded-2xl border border-border/60 bg-card/45 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5"><t.icon className="h-5 w-5 text-primary"/><h3 className="mt-3 font-semibold">{t.title}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{t.desc}</p><span className="mt-4 inline-block text-xs text-primary">Open →</span></Link>)}</div></section>
 <section className="rounded-2xl border border-border/60 bg-card/40 p-5"><h2 className="font-display text-xl">AniList catalogue</h2><p className="mt-2 text-sm text-muted-foreground">Catalogue search and anime tracking features are powered by PRI-ANIME's AniList integration. Your watch progress and saved lists remain managed through Library.</p><button disabled={busy} onClick={sync} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary disabled:opacity-50"><RefreshCw className={busy?"h-4 w-4 animate-spin":"h-4 w-4"}/>Check connection</button></section>
 {message&&<p role="status" className="text-sm text-muted-foreground">{message}</p>}
 </main></div>;
}
