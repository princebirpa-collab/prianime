import { useMemo, useState } from "react";
import { MessageCircle, X, Sparkles, Compass, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const suggestions = [
  { label: "Dark fantasy", text: "Try Demon Slayer, Jujutsu Kaisen, and Solo Leveling." },
  { label: "Power progression", text: "Try Solo Leveling, Black Clover, and Mashle." },
  { label: "Action + demons", text: "Try Demon Slayer, Jujutsu Kaisen, and Blue Exorcist." },
  { label: "Beginner picks", text: "Start with Demon Slayer, Fullmetal Alchemist: Brotherhood, or Mob Psycho 100." },
  { label: "Hindi dub", text: "Open Browse and check each title's available audio options, because dub availability can vary by region and season." }
];

export default function AnimeGuide() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("");
  const answer = useMemo(() => suggestions.find((item) => item.label === choice)?.text || "", [choice]);
  return (
    <div className="fixed bottom-5 right-4 z-[55] sm:bottom-7 sm:right-7">
      {open && (
        <section className="mb-3 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-primary/30 bg-[#101018]/95 text-white shadow-2xl backdrop-blur-xl">
          <header className="flex items-center justify-between border-b border-white/10 bg-primary/10 p-4">
            <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-primary"><Sparkles className="h-4 w-4" /></span><div><p className="text-sm font-semibold">PRI Guide</p><p className="text-[10px] text-white/50">Anime discovery assistant</p></div></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close guide" className="rounded-full p-2 text-white/60 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </header>
          <div className="p-4"><p className="text-sm text-white/80">What kind of anime are you in the mood for?</p>
            <div className="mt-3 flex flex-wrap gap-2">{suggestions.map((item) => <button key={item.label} type="button" onClick={() => setChoice(item.label)} className={"rounded-full border px-3 py-2 text-[11px] transition " + (choice === item.label ? "border-primary bg-primary/20 text-white" : "border-white/15 text-white/70 hover:border-primary/60")}>{item.label}</button>)}</div>
            {answer && <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 p-3"><p className="text-xs leading-5 text-white/85">{answer}</p><Link to="/browse" onClick={() => setOpen(false)} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-rose-200">Explore catalogue <ArrowRight className="h-3 w-3" /></Link></div>}
            <Link to="/browse" onClick={() => setOpen(false)} className="mt-4 flex items-center gap-2 text-xs text-white/50 hover:text-white"><Search className="h-3.5 w-3.5" /> Search the full anime catalogue</Link>
          </div>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close PRI Guide" : "Open PRI Guide"} className="group flex items-center gap-2 rounded-full border border-primary/50 bg-[#17121d]/95 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(0,0,0,.4)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-primary">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/20 text-primary"><MessageCircle className="h-4 w-4" /></span><span>PRI Guide</span><Compass className="h-3.5 w-3.5 text-rose-200" />
      </button>
    </div>
  );
}
