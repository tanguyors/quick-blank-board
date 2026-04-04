import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PushNotificationsSetup } from "@/components/push/PushNotificationsSetup";

import { PageLoader } from "@/components/ui/PageLoader";

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
const Install = lazy(() => import("./pages/Install"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const CGU = lazy(() => import("./pages/CGU"));
const CGV = lazy(() => import("./pages/CGV"));
const CGVAbonnement = lazy(() => import("./pages/CGVAbonnement"));
const Confidentialite = lazy(() => import("./pages/Confidentialite"));
const Actualites = lazy(() => import("./pages/Actualites"));
const ExchangeBrowse = lazy(() => import("./pages/exchange/ExchangeBrowse"));
const ExchangeMyProperties = lazy(() => import("./pages/exchange/ExchangeMyProperties"));
const ExchangeRequests = lazy(() => import("./pages/exchange/ExchangeRequests"));
const ExchangeProfile = lazy(() => import("./pages/exchange/ExchangeProfile"));
import { ExchangeGate } from './components/exchange/ExchangeGate';
const Premium = lazy(() => import("./pages/Premium"));
const PropertyEmotionalProfile = lazy(() => import("./pages/PropertyEmotionalProfile"));
const BuyerEmotionalProfile = lazy(() => import("./pages/BuyerEmotionalProfile"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});


const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PushNotificationsSetup />
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
                <Route path="/install" element={<Install />} />
                <Route path="/cgu" element={<CGU />} />
                <Route path="/cgv" element={<CGV />} />
                <Route path="/cgv-abonnement" element={<CGVAbonnement />} />
                <Route path="/confidentialite" element={<Confidentialite />} />
                <Route path="/actualites" element={<ProtectedRoute><Actualites /></ProtectedRoute>} />
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
                <Route path="/buyer/emotional" element={<ProtectedRoute><BuyerEmotionalProfile /></ProtectedRoute>} />
                <Route path="/properties/:id/emotional" element={<ProtectedRoute><PropertyEmotionalProfile /></ProtectedRoute>} />
                <Route path="/home-exchange" element={<ProtectedRoute><ExchangeGate><ExchangeBrowse /></ExchangeGate></ProtectedRoute>} />
                <Route path="/home-exchange/my-properties" element={<ProtectedRoute><ExchangeGate><ExchangeMyProperties /></ExchangeGate></ProtectedRoute>} />
                <Route path="/home-exchange/requests" element={<ProtectedRoute><ExchangeGate><ExchangeRequests /></ExchangeGate></ProtectedRoute>} />
                <Route path="/home-exchange/profile" element={<ProtectedRoute><ExchangeGate><ExchangeProfile /></ExchangeGate></ProtectedRoute>} />
                <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
                <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
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
