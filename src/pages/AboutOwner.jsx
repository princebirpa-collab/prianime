import { Instagram, ArrowUpRight, PlayCircle, UserRound } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

export default function AboutOwner() {
  return (
    <main className="relative min-h-[calc(100vh-68px)] overflow-hidden bg-[#08050b] pb-16 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(244,114,182,.16),transparent_45%),radial-gradient(ellipse_at_90%_80%,rgba(216,181,109,.12),transparent_40%)]" />
      <div className="relative mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.32em] text-rose-200/75"><UserRound className="h-4 w-4" /> Behind PRI-ANIME</div>
        <section className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.045] shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-xl">
          <div className="relative grid min-h-[300px] place-items-center bg-[linear-gradient(135deg,rgba(20,12,24,.96),rgba(5,8,15,.95))] p-8 text-center sm:min-h-[420px]">
            <div aria-hidden="true" className="absolute inset-0 opacity-25" style={{backgroundImage:"radial-gradient(circle at 20% 30%, #f9a8d4 0 1px, transparent 2px), radial-gradient(circle at 75% 65%, #d8b56d 0 1px, transparent 2px)",backgroundSize:"52px 52px"}} />
            <div className="relative max-w-xl">
              <PlayCircle className="mx-auto h-14 w-14 text-rose-200/75" />
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.3em] text-[#d8b56d]">Creator introduction</p>
              <h1 className="mt-3 font-display text-4xl font-semibold sm:text-6xl">Prince Birla</h1>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/65">The personal introduction video will appear here. This space is ready for your own video.</p>
            </div>
          </div>
          <div className="flex flex-col gap-5 border-t border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div><p className="text-[10px] font-bold uppercase tracking-[.28em] text-rose-200/75">Founder & creator</p><h2 className="mt-2 text-2xl font-semibold">About the owner</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/60">PRI-ANIME is an independent project created and developed by Prince Birla.</p></div>
            <a href="https://www.instagram.com/prin.birlaa/" target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-rose-200/50 hover:bg-rose-300/10"><Instagram className="h-4 w-4" /> @prin.birlaa <ArrowUpRight className="h-4 w-4" /></a>
          </div>
        </section>
        <a href="/" className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-white/25 bg-white/[0.07] px-6 py-3.5 font-mono text-sm font-bold text-white shadow-lg backdrop-blur-xl transition hover:border-white/45 hover:bg-white/[0.13]">☷ Browse Catalog</a>
      </div>
    </main>
  );
}
