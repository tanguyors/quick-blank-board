

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

## 🔲 Étape 4 — Edge Functions + Améliorations
- Edge Function `send-email` : emails transactionnels (notifications, rappels)
- Edge Function `send-push` : notifications push
- Edge Function `process-reminders` : traitement des wf_reminders programmés
- Edge Function `create-test-users` : création de comptes de test avec données
- Filtres avancés sur l'exploration (prix, type, surface, secteur)
- PWA manifest + service worker basique

## 🔲 Étape 5 — Polish & UX
- Animations framer-motion sur les transitions clés
- Dark mode toggle
- Responsive desktop amélioré (sidebar navigation)
- Accessibilité (aria labels, focus management)
- SEO meta tags dynamiques par page
- Performance (lazy loading routes, image optimization)
