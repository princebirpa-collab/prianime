import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, X } from "lucide-react";

const DISMISS_KEY = "prianime-discord-popup-dismissed:v1";

export default function DiscordCommunityPopup() {
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem(DISMISS_KEY) === "1") return; } catch {}
    const timer = window.setTimeout(() => setVisible(true), 4500);
    return () => window.clearTimeout(timer);
  }, []);

  const close = () => {
    if (dontShow) {
      try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
    }
    setVisible(false);
  };

  if (!visible) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="discord-popup-title">
      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-indigo-300/20 bg-[#11111b] p-6 text-white shadow-2xl">
        <button type="button" onClick={close} aria-label="Close community popup" className="absolute right-4 top-4 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#5865F2] shadow-lg"><MessageCircle className="h-7 w-7" /></div>
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-indigo-300">PRI-ANIME Community</p>
        <h2 id="discord-popup-title" className="mt-2 text-2xl font-bold">Join the anime community</h2>
        <p className="mt-3 text-sm leading-6 text-white/70">Meet fellow anime fans, share recommendations, and join community events.</p>
        <a href="https://discord.gg/2meCrBHQw" target="_blank" rel="noopener noreferrer" onClick={close} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3 font-semibold text-white transition hover:bg-[#4752c4]"><MessageCircle className="h-4 w-4" /> Join Discord</a>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={dontShow} onChange={(event) => setDontShow(event.target.checked)} className="accent-indigo-500" /> Don't show again</label>
        <button type="button" onClick={close} className="mt-3 w-full rounded-xl px-4 py-2 text-sm text-white/65 hover:bg-white/5">Not now</button>
      </section>
    </div>, document.body
  );
}
