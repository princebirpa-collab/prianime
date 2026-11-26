import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from '@/lib/theme';
import Layout from '@/components/layout/Layout';
import IntroOverlay from '@/components/IntroOverlay';
import SeasonalSnowfall from '@/components/SeasonalSnowfall';
import { installPriSmartExperience } from '@/lib/priSmart';
const Home = lazy(() => import('@/pages/Home'));
const Browse = lazy(() => import('@/pages/Browse'));
const Category = lazy(() => import('@/pages/Category'));
const AnimeDetail = lazy(() => import('@/pages/AnimeDetail'));
const Reels = lazy(() => import('@/pages/Reels'));
const Videos = lazy(() => import('@/pages/Videos'));
const Watch = lazy(() => import('@/pages/Watch'));
const AniListPlayer = lazy(() => import('@/pages/AniListPlayer'));
const MegaPlayServerPage = lazy(() => import('@/pages/MegaPlayServerPage'));
const Studio = lazy(() => import('@/pages/Studio'));
const Creator = lazy(() => import('@/pages/Creator'));
const AboutOwner = lazy(() => import('@/pages/AboutOwner'));
const Library = lazy(() => import('@/pages/Library'));
const Settings = lazy(() => import('@/pages/Settings'));
const Admin = lazy(() => import('@/pages/Admin'));
const Policy = lazy(() => import('@/pages/Policy'));
const Community = lazy(() => import('@/pages/Community'));
const Missions = lazy(() => import('@/pages/Missions'));
const Arena = lazy(() => import('@/pages/Arena'));
const WorldMap = lazy(() => import('@/pages/WorldMap'));
const WatchParty = lazy(() => import('@/pages/WatchParty'));
const Channels = lazy(() => import('@/pages/Channels'));
const Manhwa = lazy(() => import('@/pages/Manhwa'));
const LunarHub = lazy(() => import('@/pages/LunarHub'));
const GuildSpace = lazy(() => import('@/pages/GuildSpace'));
const LunarrOG = lazy(() => import('@/pages/LunarrOG'));\nconst BrandLanding = lazy(() => import('@/pages/BrandLanding'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  if (window.location.pathname === '/about-owner') {
    return <Suspense fallback={<div role="status" className="grid min-h-[100dvh] place-items-center bg-[#05040b] text-sm text-white/70">Loading About Owner…</div>}><Routes><Route path="/about-owner" element={<AboutOwner />} /></Routes></Suspense>;
  }
  if (isLoadingPublicSettings || isLoadingAuth) return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  if (authError) { if (authError.type === 'user_not_registered') return <UserNotRegisteredError />; else if (authError.type === 'auth_required') { navigateToLogin(); return null; } }
  return <Suspense fallback={<div role="status" className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Loading PRI-ANIME…</div>}><Routes><Route path="/og" element={<LunarrOG />} /><Route path="/shows" element={<BrandLanding kind="series" />} /><Route path="/movies" element={<BrandLanding kind="movie" />} /><Route element={<Layout />}>
    <Route path="/" element={<Home />} /><Route path="/browse" element={<Browse />} /><Route path="/category/:slug" element={<Category />} /><Route path="/anime/:id" element={<AnimeDetail />} /><Route path="/anilist-player/:id" element={<AniListPlayer />} /><Route path="/megaplay-server/:episodeId/:language?" element={<MegaPlayServerPage />} /><Route path="/reels" element={<Reels />} /><Route path="/watch" element={<Videos />} /><Route path="/watch/:id" element={<Watch />} /><Route path="/studio" element={<Studio />} /><Route path="/creator" element={<Creator />} /><Route path="/about-owner" element={<AboutOwner />} /><Route path="/library" element={<Library />} /><Route path="/settings" element={<Settings />} /><Route path="/admin" element={<Admin />} /><Route path="/policy" element={<Policy />} /><Route path="/community" element={<Community />} /><Route path="/guild-space" element={<GuildSpace />} /><Route path="/missions" element={<Missions />} /><Route path="/arena" element={<Arena />} /><Route path="/world-map" element={<WorldMap />} /><Route path="/watch-party" element={<WatchParty />} /><Route path="/channels" element={<Channels />} /><Route path="/manhwa" element={<Manhwa />} /><Route path="/universe" element={<LunarHub />} /></Route><Route path="*" element={<PageNotFound />} /></Routes></Suspense>;
};
function App() { useEffect(() => installPriSmartExperience(), []); return <ThemeProvider><IntroOverlay /><SeasonalSnowfall /><AuthProvider><QueryClientProvider client={queryClientInstance}><Router><ScrollToTop /><AuthenticatedApp /></Router><Toaster /></QueryClientProvider></AuthProvider></ThemeProvider>; }
export default App
