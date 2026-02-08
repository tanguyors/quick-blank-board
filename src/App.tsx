import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Eager: critical path
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy: all protected routes
const Profile = lazy(() => import("./pages/Profile"));
const ProfileSelection = lazy(() => import("./pages/ProfileSelection"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard"));
const NotaireDashboard = lazy(() => import("./pages/NotaireDashboard"));
const PropertyNew = lazy(() => import("./pages/PropertyNew"));
const PropertyEdit = lazy(() => import("./pages/PropertyEdit"));
const PropertyView = lazy(() => import("./pages/PropertyView"));
const Explore = lazy(() => import("./pages/Explore"));
const Matches = lazy(() => import("./pages/Matches"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Messages = lazy(() => import("./pages/Messages"));
const ConversationView = lazy(() => import("./pages/ConversationView"));
const Visits = lazy(() => import("./pages/Visits"));
const MapView = lazy(() => import("./pages/MapView"));
const Transaction = lazy(() => import("./pages/Transaction"));
const MyTransactions = lazy(() => import("./pages/MyTransactions"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Admin = lazy(() => import("./pages/Admin"));
const BuyerPreferences = lazy(() => import("./pages/BuyerPreferences"));
const Features = lazy(() => import("./pages/Features"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Security = lazy(() => import("./pages/Security"));
const Assistance = lazy(() => import("./pages/Assistance"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Index />} />
                <Route path="/features" element={<Features />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/security" element={<Security />} />
                <Route path="/assistance" element={<Assistance />} />
                <Route path="/profile-selection" element={<ProtectedRoute><ProfileSelection /></ProtectedRoute>} />
                <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/buyer" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
                {/* Alias routes for test guide compatibility */}
                <Route path="/swipe" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
                <Route path="/owner/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/owner/add-property" element={<ProtectedRoute><PropertyNew /></ProtectedRoute>} />
                <Route path="/notaire" element={<ProtectedRoute><NotaireDashboard /></ProtectedRoute>} />
                <Route path="/properties/new" element={<ProtectedRoute><PropertyNew /></ProtectedRoute>} />
                <Route path="/properties/:id/edit" element={<ProtectedRoute><PropertyEdit /></ProtectedRoute>} />
                <Route path="/properties/:id" element={<ProtectedRoute><PropertyView /></ProtectedRoute>} />
                <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
                <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/messages/:id" element={<ProtectedRoute><ConversationView /></ProtectedRoute>} />
                <Route path="/visits" element={<ProtectedRoute><Visits /></ProtectedRoute>} />
                <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
                <Route path="/transaction/:id" element={<ProtectedRoute><Transaction /></ProtectedRoute>} />
                <Route path="/mes-transactions" element={<ProtectedRoute><MyTransactions /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/buyer/preferences" element={<ProtectedRoute><BuyerPreferences /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
