

# SomaGate - Plan de reconstruction complet

## Vue d'ensemble

Reconstruction de l'application immobiliere SomaGate avec toutes les fonctionnalites principales : authentification, profil utilisateur, gestion de biens, systeme de swipe, matches, messagerie en temps reel, gestion de visites et vue carte.

La base de donnees Supabase est deja en place avec 9 tables (profiles, user_roles, properties, property_media, swipes, matches, conversations, messages, visits) et toutes les politiques RLS configurees.

---

## Phase 1 : Fondations (Auth + Layout + Theme)

### 1.1 Theme et design system
- Mise a jour des couleurs CSS pour un theme immobilier moderne (tons bleu/indigo avec accents orange pour les CTA)
- Ajout d'animations de swipe (keyframes pour slide-left, slide-right, fade-in)

### 1.2 Contexte d'authentification
- Creation d'un `AuthProvider` avec `onAuthStateChange` + `getSession`
- Hook `useAuth` pour acceder a l'utilisateur courant, son profil et ses roles
- Composant `ProtectedRoute` pour securiser les pages

### 1.3 Pages d'authentification
- Page `/auth` avec formulaire de connexion (email/mot de passe)
- Formulaire d'inscription avec choix du role (utilisateur/acheteur ou proprietaire)
- Redirection automatique apres connexion
- Attribution du role via insertion dans `user_roles` a l'inscription

### 1.4 Layout principal
- `AppLayout` avec barre de navigation inferieure (mobile-first) : Accueil, Recherche/Swipe, Matches, Messages, Profil
- Header avec logo SomaGate et bouton de deconnexion
- Navigation conditionnelle selon le role (proprietaire vs acheteur)

---

## Phase 2 : Profil utilisateur

### 2.1 Page Profil (`/profile`)
- Affichage et edition du profil (nom, prenom, bio, WhatsApp, photo)
- Upload d'avatar vers le bucket `avatars` de Supabase Storage
- Affichage du role de l'utilisateur
- Informations entreprise pour les proprietaires (nom societe, adresse)

---

## Phase 3 : Gestion des biens immobiliers (Proprietaires)

### 3.1 Dashboard proprietaire (`/dashboard`)
- Liste des biens du proprietaire avec statut (brouillon, publie, vendu, loue)
- Statistiques : nombre de vues/swipes, matches, visites

### 3.2 Creation/Edition de bien (`/properties/new`, `/properties/:id/edit`)
- Formulaire multi-etapes :
  - Etape 1 : Type de bien, operation (vente/location), adresse, secteur
  - Etape 2 : Details (surface, chambres, salles de bain, prix, devise, droit foncier)
  - Etape 3 : Description et equipements
  - Etape 4 : Photos/videos (upload vers bucket `property-media`)
- Gestion des medias avec drag-and-drop pour reordonner et choix de l'image principale

### 3.3 Detail d'un bien (`/properties/:id`)
- Carousel de photos
- Toutes les informations du bien
- Boutons d'action selon le role (editer pour le proprietaire, swiper/demander visite pour l'acheteur)

---

## Phase 4 : Systeme de Swipe (Acheteurs)

### 4.1 Page Swipe (`/explore`)
- Chargement des biens publies et disponibles non encore swipes par l'utilisateur
- Interface de carte empilable (stack) avec animation de swipe gauche/droite
- Swipe droite = like, swipe gauche = passer
- Boutons de swipe en bas de l'ecran (X et coeur)
- Affichage des infos cles sur la carte : photo principale, prix, adresse, type, surface, chambres

### 4.2 Logique de match
- Lors d'un swipe droit, insertion dans `swipes` avec direction "right"
- Creation automatique d'un match dans la table `matches` (lien acheteur-proprietaire-bien)
- Creation automatique d'une conversation dans `conversations`
- Notification visuelle du match (animation "It's a match!")

---

## Phase 5 : Matches et Messagerie

### 5.1 Page Matches (`/matches`)
- Liste des matches avec photo du bien, adresse et prix
- Clic pour ouvrir la conversation

### 5.2 Messagerie en temps reel (`/messages`, `/messages/:conversationId`)
- Liste des conversations avec dernier message et indicateur de non-lu
- Chat en temps reel utilisant Supabase Realtime (subscribe au canal de la conversation)
- Envoi de messages texte
- Marquage des messages comme lus
- Affichage de l'avatar et du nom de l'interlocuteur

---

## Phase 6 : Gestion des visites

### 6.1 Demande de visite (depuis la page du bien ou la conversation)
- Formulaire avec date/heure proposee et message optionnel
- Insertion dans la table `visits` avec statut "pending"

### 6.2 Page Visites (`/visits`)
- Vue acheteur : liste des visites demandees avec statut
- Vue proprietaire : liste des demandes de visite avec actions (confirmer/annuler)
- Mise a jour du statut (pending -> confirmed/cancelled/completed)
- Raison d'annulation optionnelle

---

## Phase 7 : Vue Carte

### 7.1 Carte interactive (`/map`)
- Integration d'une carte (Leaflet via react-leaflet, gratuit et sans cle API)
- Affichage des biens publies comme marqueurs sur la carte
- Popup au clic sur un marqueur avec apercu du bien (photo, prix, adresse)
- Lien vers la page de detail du bien
- Filtres : type de bien, fourchette de prix, operation (vente/location)

---

## Architecture des fichiers

```text
src/
  contexts/
    AuthContext.tsx          -- Provider d'authentification
  hooks/
    useAuth.ts               -- Hook d'acces au contexte auth
    useProperties.ts         -- Hooks React Query pour les biens
    useSwipes.ts             -- Hook pour le systeme de swipe
    useMatches.ts            -- Hook pour les matches
    useConversations.ts      -- Hook pour les conversations
    useMessages.ts           -- Hook pour les messages (avec Realtime)
    useVisits.ts             -- Hook pour les visites
    useProfile.ts            -- Hook pour le profil
  components/
    layout/
      AppLayout.tsx          -- Layout avec navigation
      BottomNav.tsx          -- Navigation inferieure mobile
      Header.tsx             -- En-tete
    auth/
      AuthForm.tsx           -- Formulaire login/signup
      ProtectedRoute.tsx     -- Route protegee
    properties/
      PropertyCard.tsx       -- Carte de bien (swipe)
      PropertyForm.tsx       -- Formulaire creation/edition
      PropertyDetail.tsx     -- Detail complet
      PropertyList.tsx       -- Liste des biens
      MediaUpload.tsx        -- Upload de medias
    swipe/
      SwipeStack.tsx         -- Pile de cartes swipables
      SwipeCard.tsx          -- Carte individuelle
      MatchAnimation.tsx     -- Animation "It's a match!"
    matches/
      MatchList.tsx          -- Liste des matches
      MatchCard.tsx          -- Carte de match
    messages/
      ConversationList.tsx   -- Liste des conversations
      ChatView.tsx           -- Vue de chat
      MessageBubble.tsx      -- Bulle de message
    visits/
      VisitForm.tsx          -- Formulaire de demande
      VisitList.tsx          -- Liste des visites
      VisitCard.tsx          -- Carte de visite
    map/
      PropertyMap.tsx        -- Carte Leaflet
      MapMarker.tsx          -- Marqueur personnalise
      MapFilters.tsx         -- Filtres de la carte
    profile/
      ProfileForm.tsx        -- Formulaire de profil
      AvatarUpload.tsx       -- Upload d'avatar
  pages/
    Auth.tsx
    Index.tsx                -- Landing / redirection
    Explore.tsx              -- Page de swipe
    Dashboard.tsx            -- Dashboard proprietaire
    PropertyNew.tsx          -- Creation de bien
    PropertyEdit.tsx         -- Edition de bien
    PropertyView.tsx         -- Detail d'un bien
    Matches.tsx
    Messages.tsx
    ConversationView.tsx
    Visits.tsx
    MapView.tsx
    Profile.tsx
```

---

## Details techniques

### Authentification
- `onAuthStateChange` configure AVANT `getSession()` pour eviter les race conditions
- `emailRedirectTo: window.location.origin` dans signUp
- Profil cree automatiquement via le trigger `handle_new_user` existant
- Role insere dans `user_roles` cote client apres inscription

### Swipe et Matches
- Requete pour les biens : `properties` ou `is_published = true` et `status = 'available'`, filtrees par les swipes deja effectues (sous-requete sur `swipes`)
- Lors d'un swipe droit : insertion dans `swipes`, puis insertion dans `matches` (avec `owner_id` du bien), puis creation de la `conversation` liee au match

### Messagerie temps reel
- Utilisation de `supabase.channel()` pour s'abonner aux INSERT sur la table `messages` filtres par `conversation_id`
- Mise a jour optimiste de la liste des messages
- Marquage automatique des messages comme lus quand la conversation est ouverte

### Vue carte
- Installation de `leaflet` et `react-leaflet` (pas de cle API requise)
- Tuiles OpenStreetMap gratuites
- Marqueurs positionnes via `latitude`/`longitude` des biens

### Dependances a ajouter
- `leaflet` + `react-leaflet` + `@types/leaflet` pour la carte

