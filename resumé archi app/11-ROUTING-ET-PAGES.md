# 11 — Routing & Pages

## Table de Routes (`App.tsx`)

### Routes Publiques (sans authentification)

| Route | Page | Description |
|---|---|---|
| `/` | `Index` → `Home` (si non-auth) | Landing page ou redirection par rôle |
| `/auth` | `Auth` | Login / Signup |
| `/features` | `Features` | Fonctionnalités de la plateforme |
| `/how-it-works` | `HowItWorks` | Comment ça marche |
| `/security` | `Security` | Sécurité et protection |
| `/assistance` | `Assistance` | Aide et support |
| `/install` | `Install` | Guide d'installation |
| `/cgu` | `CGU` | Conditions Générales d'Utilisation |
| `/cgv` | `CGV` | Conditions Générales de Vente |
| `/cgv-abonnement` | `CGVAbonnement` | CGV Abonnement |
| `/confidentialite` | `Confidentialite` | Politique de confidentialité |

### Routes Protégées (authentification requise)

| Route | Page | Rôle Principal | Description |
|---|---|---|---|
| `/profile-selection` | `ProfileSelection` | Tous | Choix du type de profil post-inscription |
| `/profile-setup` | `ProfileSetup` | Tous | Configuration initiale du profil |
| `/profile` | `Profile` | Tous | Profil utilisateur (vue/édition) |
| `/account-settings` | `AccountSettings` | Tous | Paramètres (notifs, KYC, etc.) |
| `/actualites` | `Actualites` | Tous | Articles d'actualité |
| `/explore` | `Explore` | Buyer | Swipe des biens |
| `/buyer` | `BuyerDashboard` | Buyer | Dashboard acheteur |
| `/buyer/preferences` | `BuyerPreferences` | Buyer | Wizard préférences (5 steps) |
| `/matches` | `Matches` | Buyer | Liste des matchs |
| `/favorites` | `Favorites` | Buyer | Biens sauvegardés |
| `/messages` | `Messages` | Tous | Liste des conversations |
| `/messages/:id` | `ConversationView` | Tous | Vue conversation (chat) |
| `/visits` | `Visits` | Buyer/Owner | Gestion des visites |
| `/map` | `MapView` | Tous | Carte interactive |
| `/dashboard` | `Dashboard` | Owner | Dashboard propriétaire |
| `/properties/new` | `PropertyNew` | Owner | Formulaire nouveau bien |
| `/properties/:id/edit` | `PropertyEdit` | Owner | Édition d'un bien |
| `/properties/:id` | `PropertyView` | Tous | Détail d'un bien |
| `/transaction/:id` | `Transaction` | Buyer/Seller | Vue transaction (workflow) |
| `/mes-transactions` | `MyTransactions` | Tous | Liste des transactions |
| `/notifications` | `Notifications` | Tous | Page notifications complète |
| `/notaire` | `NotaireDashboard` | Notaire | Dashboard notaire |
| `/admin` | `Admin` | Admin | Panel d'administration |

### Routes Alias (compatibilité)

| Alias | Pointe vers |
|---|---|
| `/swipe` | `Explore` |
| `/owner/dashboard` | `Dashboard` |
| `/owner/add-property` | `PropertyNew` |

---

## Page d'Index (`Index.tsx`) — Logique de Redirection

```typescript
if (loading) return <PageLoader />;
if (!user) return <Home />;  // Landing page

const isNotaire = roles.includes('notaire');
const isOwner = roles.includes('owner');
const isAdmin = roles.includes('admin');

const redirectPath = isNotaire ? '/notaire' 
  : (isOwner || isAdmin) ? '/profile' 
  : '/explore';

return <Navigate to={redirectPath} replace />;
```

---

## Landing Page (`Home.tsx`)

### Sections
1. **Top Bar** : Logo SomaGate + Sélecteur de langue + Bouton Login
2. **Hero** : Badge "Intelligence immobilière", titre i18n, sous-titre
3. **Matchs du jour** : Compteur temps réel (query `matches` d'aujourd'hui)
4. **Grille de propriétés** : 6 propriétés fictives avec images et prix
5. **Slogan** : "SOMA GATE — INTELLIGENCE IMMOBILIÈRE"
6. **Features** : 4 cartes avec icônes custom (Sécurité, Documents, Matching, Intelligence)
7. **CTA** : "DÉCOUVRIR DÈS MAINTENANT" + "Créer un compte"
8. **Footer** : Liens vers Features, How It Works, Security, Help, CGU, CGV, Privacy

---

## Dashboard Owner (`Dashboard.tsx`)

Onglets :
- **Biens** : Liste des propriétés du propriétaire
- **Visites** : Visites sur ses biens
- **Messages** : Conversations
- **Transactions** : Transactions du workflow
- **Profil** : En-tête profil + statistiques

---

## Dashboard Buyer (`BuyerDashboard.tsx`)

Dashboard de l'acheteur avec statistiques et raccourcis vers :
- Explorer les biens
- Voir les matchs
- Consulter les favoris
- Gérer les visites
- Suivre les transactions

---

## Admin Panel (`Admin.tsx`)

Onglets (via query params `?tab=`) :
- **Vue d'ensemble** : Statistiques globales
- **Utilisateurs** : Liste complète + panel de détail
- **Propriétés** : Toutes les propriétés de la plateforme
- **Visites** : Toutes les visites
- **Transactions** : Toutes les transactions du workflow
- **Carte** : Carte interactive de tous les biens
- **Notifications** : Templates de notifications personnalisables
- **Vérifications** : Demandes de vérification d'identité (KYC)

---

## Page Transaction (`Transaction.tsx`)

Interface principale du workflow avec :
- **TransactionStatus** : Barre de progression + actions contextuelles
- **VisitManagement** : Gestion des visites (proposer dates, confirmer, reporter)
- **SecureMessaging** : Chat sécurisé (détection anti-fraude)
- **OfferForm** : Formulaire d'offre (montant, type, détails)
- **DealFinalization** : Double validation + questionnaire de feedback
- **SecurityAlert** : Messages anti-arnaque
