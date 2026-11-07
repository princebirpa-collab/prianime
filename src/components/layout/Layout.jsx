import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import AnimeGuide from "@/components/AnimeGuide";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-[-10%] h-[420px] w-[420px] rounded-full bg-primary/[0.055] blur-[90px]" />
        <div className="absolute right-[-10%] top-1/3 h-[360px] w-[360px] rounded-full bg-amethyst/25 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-primary/[0.04] blur-[80px]" />
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
      <AnimeGuide />
    </div>
  );
}
