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
// Add page imports here
import Home from '@/pages/Home';
import Browse from '@/pages/Browse';
import Category from '@/pages/Category';
import AnimeDetail from '@/pages/AnimeDetail';
import Reels from '@/pages/Reels';
import Videos from '@/pages/Videos';
import Watch from '@/pages/Watch';
import Studio from '@/pages/Studio';
import Creator from '@/pages/Creator';
import Library from '@/pages/Library';
import Settings from '@/pages/Settings';
import Admin from '@/pages/Admin';
import Policy from '@/pages/Policy';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/policy" element={<Policy />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ThemeProvider>
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
