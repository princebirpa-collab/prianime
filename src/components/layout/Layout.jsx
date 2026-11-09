import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import InteractiveSmoke from "@/components/effects/InteractiveSmoke";
import CursorGlow from "@/components/effects/CursorGlow";
import { MessageCircle } from "lucide-react";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-40 top-[-10%] h-[520px] w-[520px] rounded-full bg-primary/[0.07] blur-[130px] animate-pulse-glow" />
        <div className="absolute right-[-10%] top-1/3 h-[460px] w-[460px] rounded-full bg-amethyst/40 blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/3 h-[380px] w-[380px] rounded-full bg-primary/[0.05] blur-[120px]" />
      </div>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <NavBar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CursorGlow />
      <InteractiveSmoke />
      <a href="https://discord.gg/2meCrBHQw" target="_blank" rel="noopener noreferrer" aria-label="Join the PRI-ANIME Discord community" className="fixed bottom-5 right-5 z-[90] inline-flex items-center gap-2 rounded-full border border-indigo-200/30 bg-[#5865F2]/90 px-4 py-3 text-xs font-bold text-white shadow-[0_12px_40px_rgba(88,101,242,.35)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-[#5865F2] focus-visible:outline-white"><MessageCircle className="h-4 w-4" /><span className="hidden sm:inline">Join Discord</span><span className="sm:hidden">Discord</span></a>
    </div>
  );
}
