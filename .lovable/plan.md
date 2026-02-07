

# Plan SomaGate

## ✅ Étape 1 — Bugs critiques + Workflow transactionnel
- Corrigé bug PropertyMap (react-leaflet lazy loading)
- Stats profil dynamiques (swipes, matches, visites, score)
- 7 tables workflow créées (wf_transactions, logs, messages, documents, notifications, scores, reminders)
- WorkflowService (14 statuts, transitions validées)
- MessageDetectionService (anti-fraude, détection téléphone/mots-clés)
- Pages Transaction + Mes Transactions
- Création auto de transaction au match

## ✅ Étape 2 — Dashboard owner, notifications, onboarding
- Dashboard propriétaire avec onglets (Mes biens, Visites, Messages, Profil)
- Système de notifications in-app avec NotificationBell
- Flux onboarding post-inscription (sélection rôle → configuration profil)
- Page Notifications

## ✅ Étape 3 — Landing page, Admin, Documents
- Landing page desktop (Home.tsx) avec hero, features, stats, CTA
- Page Admin avec 4 onglets (Vue globale, Utilisateurs, Transactions, Biens)
- Service de génération automatique de documents (LOI, Term Sheet, Contrat Vente/Location)
- Validation croisée des documents (acheteur + vendeur)
- Auto-génération après makeOffer dans WorkflowService
- Route /admin avec accès restreint aux rôles admin

## ✅ Étape 3.5 — Dashboards par rôle
- Dashboard Acheteur (BuyerDashboard) : transactions actives, stats, quick actions, score
- Dashboard Owner enrichi : ajout onglet Transactions avec stats en cours/finalisées
- Dashboard Notaire (NotaireDashboard) : dossiers actifs, documents en attente, validation status
- BottomNav adaptatif par rôle (buyer 5 items, owner 4, notaire 3, admin ajouté dynamiquement)
- Routing intelligent selon le rôle à la connexion (/ → /buyer, /dashboard, /notaire)

## ✅ Étape 4 — Edge Functions + Améliorations
- Edge Function `create-test-users` : 6 comptes de test (2 buyers, 2 owners, 1 notaire, 1 admin) avec biens, matches et transactions
- Edge Function `process-reminders` : traitement des wf_reminders programmés → notifications in-app
- Edge Function `send-push` : notifications push (mock/log, prêt pour FCM/OneSignal)
- Filtres avancés sur Explore (opération, type, budget slider, surface, chambres, secteur)
- PWA manifest + meta tags mobile (apple-mobile-web-app, theme-color)
- SEO meta tags (title, description, OG tags, Twitter cards)

## 🔲 Étape 5 — Polish & UX
- Animations framer-motion sur les transitions clés
- Dark mode toggle
- Responsive desktop amélioré (sidebar navigation)
- Accessibilité (aria labels, focus management)
- Performance (lazy loading routes, image optimization)
- Capacitor setup pour build natif iOS/Android
