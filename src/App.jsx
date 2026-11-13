import { lazy, Suspense } from 'react';
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
// Add page imports here
const Home = lazy(() => import('@/pages/Home'));
const Browse = lazy(() => import('@/pages/Browse'));
const Category = lazy(() => import('@/pages/Category'));
const AnimeDetail = lazy(() => import('@/pages/AnimeDetail'));
const Reels = lazy(() => import('@/pages/Reels'));
const Videos = lazy(() => import('@/pages/Videos'));
const Watch = lazy(() => import('@/pages/Watch'));
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

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Keep the public About Owner page independent from Base44 auth/settings.
  // This route must render in a fresh tab even when the legacy auth service is unavailable.
  if (window.location.pathname === '/about-owner') {
    return (
      <Suspense fallback={<div role="status" className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Loading About Owner…</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/about-owner" element={<AboutOwner />} />
          </Route>
        </Routes>
      </Suspense>
    );
  }

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<div role="status" className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Loading PRI-ANIME…</div>}>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/anime/:id" element={<AnimeDetail />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/watch" element={<Videos />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/creator" element={<Creator />} />
        <Route path="/about-owner" element={<AboutOwner />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/community" element={<Community />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/world-map" element={<WorldMap />} />
        <Route path="/watch-party" element={<WatchParty />} />
        <Route path="/channels" element={<Channels />} />
        <Route path="/manhwa" element={<Manhwa />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ThemeProvider>
      <IntroOverlay />
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
