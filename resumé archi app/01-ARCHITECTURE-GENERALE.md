# 01 — Architecture Générale de SomaGate

## Vue d'ensemble

**SomaGate** est une plateforme d'intelligence immobilière dédiée au marché indonésien (principalement Bali). L'application fonctionne comme un « Tinder de l'immobilier » : les acheteurs explorent des biens via un système de swipe, créent des matchs avec les propriétaires, puis suivent un workflow de transaction complet jusqu'à la finalisation du deal.

---

## Stack Technique

| Couche | Technologie | Version |
|---|---|---|
| **Frontend** | React + TypeScript | React 18.3, TS 5.8 |
| **Build** | Vite + SWC | Vite 5.4 |
| **Styling** | Tailwind CSS + shadcn/ui | Tailwind 3.4 |
| **State / Data** | TanStack React Query | v5.83 |
| **Routing** | React Router DOM | v6.30 |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Edge Functions) | supabase-js 2.95 |
| **Animations** | Framer Motion | v12.33 |
| **i18n** | i18next + react-i18next | v25.8 / v16.5 |
| **Cartographie** | React Leaflet + Leaflet | v4.2 / v1.9 |
| **Charts** | Recharts | v2.15 |
| **Formulaires** | React Hook Form + Zod | v7.61 / v3.25 |
| **PWA** | vite-plugin-pwa (Workbox) | v1.2 |
| **Mobile natif** | Capacitor (iOS) | v6.1 |
| **Emails** | Resend (via Edge Function) | v2.0 |
| **IA Chatbot** | Lovable AI Gateway (Gemini 3 Flash) | — |

---

## Architecture Haut Niveau

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (React SPA)                  │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Acheteur │  │ Proprié- │  │  Notaire │  │ Admin  │ │
│  │  (Buyer)  │  │  taire   │  │          │  │        │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
│       │              │              │             │      │
│  ┌────┴──────────────┴──────────────┴─────────────┴────┐│
│  │              React Router (SPA)                      ││
│  │  ProtectedRoute → AuthContext → Role-based redirect  ││
│  └──────────────────────┬───────────────────────────────┘│
│                         │                                │
│  ┌──────────────────────┴───────────────────────────────┐│
│  │           TanStack React Query (cache layer)          ││
│  │  staleTime: 2min | gcTime: 5min | no refetchOnFocus  ││
│  └──────────────────────┬───────────────────────────────┘│
└─────────────────────────┼────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼────────────────────────────────┐
│               SUPABASE BACKEND                           │
│  ┌──────────────────────┴──────────────────────────────┐ │
│  │  Auth (email/password, JWT, session persistence)    │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  PostgreSQL (18 tables, RLS policies, enums,        │ │
│  │  functions, triggers)                               │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  Storage (3 buckets : property-media, avatars,      │ │
│  │  identity-documents)                                │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  Edge Functions (6 fonctions Deno) :                │ │
│  │    • chatbot (IA streaming)                         │ │
│  │    • send-email (Resend)                            │ │
│  │    • send-push (in-app + futur FCM)                 │ │
│  │    • process-reminders (CRON-like)                  │ │
│  │    • create-test-users                              │ │
│  │    • seed-property-media                            │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  Realtime (Postgres Changes sur `messages`)         │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Structure du Projet

```
src/
├── App.tsx                    # Root component, providers, routes
├── main.tsx                   # Entry point (render + i18n init)
├── index.css                  # Tailwind base + design tokens HSL
│
├── contexts/
│   ├── AuthContext.tsx         # Session, profile, roles, loading
│   └── ThemeContext.tsx        # Light/Dark mode (localStorage)
│
├── hooks/                     # 15+ custom hooks (data + mutations)
│   ├── useAuth.ts             # Context consumer
│   ├── useProfile.ts          # Profile CRUD
│   ├── useProperties.ts       # Property CRUD
│   ├── useSwipes.ts           # Explorable properties + swipe mutation
│   ├── useMatches.ts          # Matches query
│   ├── useFavorites.ts        # Favorites CRUD
│   ├── useVisits.ts           # Visit requests + status updates
│   ├── useConversations.ts    # Conversation list + profiles
│   ├── useMessages.ts         # Messages + Realtime subscription
│   ├── useNotifications.ts    # Notifications + unread count + sound
│   ├── useTransaction.ts      # Transaction workflow + mutations
│   ├── useBuyerPreferences.ts # Buyer search preferences
│   ├── useDisplayPrice.ts     # Currency conversion
│   ├── useIdentityVerification.ts # KYC upload + status
│   └── use-mobile.tsx         # Responsive breakpoint detection
│
├── services/                  # Business logic services (classes)
│   ├── workflowService.ts     # Transaction state machine
│   ├── messageDetectionService.ts # Anti-fraud message analysis
│   ├── documentGenerationService.ts # Auto-generate LOI, Term Sheet, Contracts
│   ├── transactionExportService.ts  # Export dossier complet (TXT)
│   └── emailService.ts        # Email sending via Edge Function
│
├── components/
│   ├── auth/                  # AuthForm, ProtectedRoute
│   ├── layout/                # AppLayout, AppSidebar, BottomNav, Header, PageTopBar, ThemeToggle
│   ├── swipe/                 # SwipeStack, SwipeCard, MatchAnimation
│   ├── properties/            # PropertyForm, PropertyDetail, PropertyList, MediaUpload, EquipmentIcon
│   ├── explore/               # ExploreFilters (2 méthodes de recherche)
│   ├── map/                   # PropertyMap (Leaflet), PropertyDetailSheet
│   ├── matches/               # MatchList
│   ├── messages/              # ConversationList, ChatView
│   ├── notifications/         # NotificationBell (popover + sound)
│   ├── visits/                # VisitForm, VisitList, VisitStatusBadge
│   ├── workflow/              # TransactionStatus, VisitManagement, OfferForm, DealFinalization, SecureMessaging, FeedbackQuestionnaire, SecurityAlert
│   ├── preferences/           # BuyerPreferencesWizard (5 steps)
│   ├── profile/               # ProfileForm, AvatarUpload
│   ├── settings/              # IdentityVerification, NotificationSettings
│   ├── chatbot/               # ChatBot (floating widget, streaming)
│   ├── admin/                 # AdminOverviewTab, AdminPropertiesTab, AdminUsersTab, AdminVisitsTab, AdminTransactionsTab, AdminNotificationsTab, AdminVerificationsTab, AdminProfilePanel
│   ├── dashboard/             # OwnerPropertyTab, OwnerVisitsTab, OwnerMessagesTab, OwnerProfileTab, OwnerTransactionsTab, OwnerProfileHeader
│   ├── pwa/                   # PwaInstallFloat (iOS guide + Android prompt)
│   └── ui/                    # 40+ shadcn/ui components
│
├── pages/                     # 30+ route pages
├── i18n/                      # Internationalisation (8 langues)
├── integrations/supabase/     # Client + Types auto-générés
├── types/                     # workflow.ts (TransactionStatus, interfaces)
├── lib/                       # currencies.ts, utils.ts (cn helper)
└── assets/                    # Images, icônes PNG custom
```

---

## Flux de Données Principal

1. **Utilisateur → AuthContext** : `supabase.auth.getSession()` + `onAuthStateChange()` → `setUser`, `setProfile`, `setRoles`
2. **Composants → React Query** : Chaque hook fait un `useQuery` / `useMutation` avec des `queryKey` pour le cache
3. **React Query → Supabase Client** : Appels REST via `@supabase/supabase-js` (PostgREST)
4. **Supabase → PostgreSQL** : RLS policies filtrent les données par `auth.uid()`
5. **Realtime** : Subscription `postgres_changes` sur la table `messages` pour le chat en temps réel
6. **Edge Functions** : Invoquées via `supabase.functions.invoke()` (emails, chatbot, push, reminders)

---

## Providers (ordre d'imbrication dans App.tsx)

```tsx
<ThemeProvider defaultTheme="light">
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>...</Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
</ThemeProvider>
```

---

## Configuration React Query

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,     // 2 minutes
      gcTime: 5 * 60 * 1000,         // 5 minutes garbage collection
      refetchOnWindowFocus: false,    // Pas de refetch au focus
    },
  },
});
```

---

## Lazy Loading

Toutes les pages protégées sont chargées via `React.lazy()` pour réduire le bundle initial. Seules 3 pages sont eagerly loaded :
- `Index` (page d'accueil / redirection)
- `Auth` (login/signup)
- `NotFound` (404)
