import { useProfile } from "@/lib/profile";
import { Sparkles } from "lucide-react";

const frames = [
 {id:"neon",name:"Neon Ring",className:"fx-neon"},
 {id:"pulse",name:"Pulse Glow",className:"fx-pulse"},
 {id:"stars",name:"Orbit Stars",className:"fx-stars"},
 {id:"sakura",name:"Sakura Drift",className:"fx-sakura"},
 {id:"glitch",name:"Glitch Frame",className:"fx-glitch"},
 {id:"flame",name:"Ember Aura",className:"fx-flame"},
];
const titles = [
 {id:"shimmer",name:"Shimmer",className:"title-shimmer"},
 {id:"flow",name:"Gradient Flow",className:"title-flow"},
 {id:"glow",name:"Neon Glow",className:"title-glow"},
 {id:"wave",name:"Wave",className:"title-wave"},
 {id:"type",name:"Typewriter",className:"title-type"},
 {id:"plain",name:"Classic",className:""},
];
export default function ProfileEffects(){
 const [profile,update]=useProfile();
 const frame=frames.find(x=>x.id===profile.avatarDecorationEffect)||frames[0];
 const title=titles.find(x=>x.id===profile.titleEffect)||titles[0];
 const avatar=profile.avatar||"/avatar-default.svg";
 return <section className="rounded-2xl border border-border/60 bg-card/40 p-5 lg:col-span-2">
 <div className="flex items-center gap-2 text-primary"><Sparkles className="h-4 w-4"/><span className="text-xs uppercase tracking-[.18em]">Profile animation lab</span></div>
 <h2 className="mt-2 font-display text-xl">Decorations & animated titles</h2><p className="mt-1 text-sm text-muted-foreground">Preview and equip lightweight effects. Your choices are saved to this browser profile.</p>
 <div className="mt-5 flex flex-wrap items-center gap-5 rounded-xl border border-border/50 bg-background/40 p-4">
 <div className={"profile-effect-avatar "+frame.className}><img src={avatar} alt="Avatar preview"/></div>
 <div><p className={"profile-effect-title "+title.className}>{profile.displayTitle||profile.name||"Moon traveller"}</p><p className="mt-1 text-xs text-muted-foreground">Live preview · {frame.name}</p></div>
 </div>
 <label className="mt-5 block text-xs text-muted-foreground">Custom title<input value={profile.displayTitle||""} maxLength={32} onChange={e=>update({displayTitle:e.target.value})} placeholder="Enter a profile title" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/></label>
 <p className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">Avatar effects</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{frames.map(x=><button key={x.id} type="button" aria-pressed={profile.avatarDecorationEffect===x.id} onClick={()=>update({avatarDecorationEffect:x.id})} className={"rounded-xl border p-3 text-sm transition "+(profile.avatarDecorationEffect===x.id?"border-primary bg-primary/10":"border-border/60 hover:border-primary/50")}>{x.name}</button>)}</div>
 <p className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">Title animation</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{titles.map(x=><button key={x.id} type="button" aria-pressed={profile.titleEffect===x.id} onClick={()=>update({titleEffect:x.id})} className={"rounded-xl border p-3 text-sm transition "+(profile.titleEffect===x.id?"border-primary bg-primary/10":"border-border/60 hover:border-primary/50")}>{x.name}</button>)}</div>
 <style>{`
 .profile-effect-avatar{position:relative;width:88px;height:88px;border-radius:50%;isolation:isolate}
 .profile-effect-avatar img{position:relative;z-index:1;width:100%;height:100%;border-radius:50%;object-fit:cover}
 .profile-effect-avatar:after{content:"";position:absolute;inset:-8px;border-radius:50%;pointer-events:none}
 .fx-neon:after{border:3px solid #a78bfa;box-shadow:0 0 12px #a78bfa,0 0 28px #6366f1;animation:ring 4s linear infinite}
 .fx-pulse:after{border:3px solid #60a5fa;box-shadow:0 0 20px #60a5fa;animation:pulse 2.4s ease-in-out infinite}
 .fx-stars:after{border:2px dotted #f5d0fe;animation:ring 12s linear infinite}
 .fx-sakura:after{border:3px dashed #f9a8d4;box-shadow:0 0 18px #f472b6;animation:ring 8s linear infinite}
 .fx-glitch:after{border:3px double #67e8f9;box-shadow:4px 0 #f472b6,-4px 0 #67e8f9;animation:pulse 1.8s steps(2) infinite}
 .fx-flame:after{border:3px solid #fb923c;box-shadow:0 0 18px #f97316,0 0 32px #ef4444;animation:pulse 2s ease-in-out infinite}
 .profile-effect-title{font-weight:800;font-size:1.25rem;letter-spacing:.02em;overflow-wrap:anywhere}
 .title-shimmer{background:linear-gradient(90deg,currentColor,#c4b5fd,#fff,currentColor);background-size:220%;color:transparent;background-clip:text;animation:shine 3s linear infinite}
 .title-flow{background:linear-gradient(90deg,#a78bfa,#60a5fa,#f0abfc,#a78bfa);background-size:300%;color:transparent;background-clip:text;animation:shine 5s linear infinite}
 .title-glow{text-shadow:0 0 6px #a78bfa,0 0 18px #6366f1}
 .title-wave{animation:pulse 1.8s ease-in-out infinite}
 .title-type{overflow:hidden;white-space:nowrap;border-right:2px solid currentColor;max-width:100%;animation:type 3s steps(24,end) infinite}
 @keyframes ring{to{transform:rotate(360deg)}} @keyframes pulse{50%{opacity:.55;transform:scale(1.04)}} @keyframes shine{to{background-position:220%}} @keyframes type{0%,100%{max-width:0}50%{max-width:100%}}
 @media(prefers-reduced-motion:reduce){.profile-effect-avatar:after,.profile-effect-title{animation:none!important}}
 `}</style>
 </section>;
}
