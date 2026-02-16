
# Plan d'implementation -- Retours client SOMA GATE

Ce plan regroupe tous les points du document de synthese en phases logiques et actionnables. Chaque phase est concue pour etre implementee de maniere incrementale.

---

## Phase 1 : Corrections critiques et bug fix

### 1.1 Fix build error -- Edge function send-email
- Le import `npm:resend@2.0.0` cause une erreur de build. Remplacer par un import ESM compatible Deno (`https://esm.sh/resend@2.0.0`).

### 1.2 Supprimer toutes les references a "Tinder"
**Fichiers concernes** : `src/pages/Home.tsx`, memories, composants divers
- Retirer le badge "Le Tinder de l'immobilier" de l'ecran d'accueil
- Remplacer le texte du slide 1 par :
  - Titre : **"Ta recherche immobiliere reinventee"**
  - Sous-titre : **"Soma Gate, la premiere plateforme d'intelligence immobiliere"**
- Mettre a jour le slogan dans tous les footers email : **"SOMA GATE -- LA PLATEFORME D'INTELLIGENCE IMMOBILIERE"**

### 1.3 Terminologie juridique -- Remplacer "Vente" par Leasehold/Freehold
- Dans `PropertyForm.tsx` : remplacer l'operation "Vente" par "Leasehold" et "Freehold"
- Dans `BuyerPreferencesWizard.tsx` (OPERATIONS) : meme remplacement
- Dans `ExploreFilters.tsx` et `PropertyMap.tsx` : adapter les filtres
- Dans le formulaire acheteur, ajouter une bulle d'aide explicative (point 15.1) :
  - **Freehold** = propriete complete et permanente (bien + terrain pour toujours)
  - **Leasehold** = propriete temporaire (murs uniquement, 20-40 ans, ground rent)
- Note : cela necessite potentiellement une migration DB pour le type enum `property_operation` (ajouter `leasehold`, `freehold`, retirer ou deprecier `vente`)

---

## Phase 2 : UX/UI des fiches biens

### 2.1 Ameliorer la lisibilite des specs (surface, chambres, sdb)
- Dans `SwipeCard.tsx` : augmenter la taille des icones (h-5 w-5), utiliser des couleurs plus contrastees (text-foreground au lieu de text-muted-foreground), ajouter un fond plus visible
- Appliquer les memes changements dans `PropertyDetailSheet.tsx`

### 2.2 Typographie du prix
- Utiliser un separateur de milliers avec un point (configurer `Intl.NumberFormat` avec locale `de-DE` ou custom)
- Appliquer une police plus premium au prix (font-bold, tracking plus large, taille superieure)
- Modifier `formatPrice()` dans `src/lib/currencies.ts` pour utiliser le point comme separateur

### 2.3 Ajouter le type "Entrepot"
- Deja present dans `ExploreFilters.tsx` et `PropertyForm.tsx` -- verifier la completude dans tous les composants et dans l'enum DB `property_type`

---

## Phase 3 : Carte et code couleur

### 3.1 Differenciation des biens sur la carte
- Modifier `createPriceIcon()` dans `PropertyMap.tsx` pour accepter un parametre de couleur
- Requeter les `swipes` et `favorites` de l'utilisateur connecte
- Appliquer le code couleur :
  - **Biens deja vus** (swipe left/right) : fond gris (`#9ca3af`)
  - **Biens coup de coeur** (favoris) : fond turquoise (`#06b6d4`)
  - **Autres biens** : fond blanc casse (`#faf7f2`)
  - Texte prix en couleur sombre pour lisibilite

---

## Phase 4 : Recherche avancee

### 4.1 Methode 1 -- Recherche par adresse + rayon
- Ajouter un champ de saisie d'adresse dans `ExploreFilters.tsx`
- Ajouter un slider de rayon (1-50 km)
- Ajouter un selecteur de mode de deplacement (scooter, voiture, a pied) avec icones
- Utiliser les coordonnees GPS pour filtrer cote client (calcul de distance haversine)

### 4.2 Methode 2 -- Filtres classiques
- Deja en place, ameliorer la presentation

### 4.3 Secteurs en menu deroulant multi-select
- Remplacer les boutons/chips de secteurs dans `ExploreFilters.tsx` et `BuyerPreferencesWizard.tsx` par un menu deroulant multi-selection (utiliser `cmdk` ou un composant custom avec checkboxes)

### 4.4 Pop-up d'autorisation de localisation
- Au chargement de la page Explore/Map, declencher `navigator.geolocation.getCurrentPosition()` avec un message explicatif prealable

---

## Phase 5 : Preferences acheteur -- Ameliorations

### 5.1 Date d'emmenagement
- Ajouter une nouvelle etape ou un champ dans le wizard avec les options :
  - Tres rapidement
  - Dans les semaines a venir
  - Choisir un mois (menu deroulant)
  - Date butoir precise
  - Je suis flexible

### 5.2 Champs Budget et Intention non obligatoires
- Dans `BuyerPreferencesWizard.tsx`, modifier `canNext()` pour l'etape 3 (budget) : retirer la condition obligatoire sur `budget_min`, `budget_max` et `intention`

### 5.3 Ecran de validation
- Apres la derniere etape du wizard, afficher un ecran de patience avec une icone et le texte :
  - **"Toutes les maisons ne sont pas faites pour tout le monde. Nous cherchons votre future connexion."**

### 5.4 Case "Contacte par un conseiller"
- Deja present (`wants_advisor` checkbox) -- verifier le wording exact et la visibilite

---

## Phase 6 : Navigation et structure

### 6.1 Nouveaux onglets/pages
Ajouter dans la sidebar et/ou les parametres :
- **Parametres** (deja present via AccountSettings -- rendre plus visible)
- **Profil** (deja present)
- **Obtenir de l'aide** (lien vers `/assistance`)
- **Confidentialite** (nouvelle page avec politique de confidentialite)
- **CGV** (nouvelle page Conditions Generales de Vente -- point 13.1)

### 6.2 Validation CI (Carte d'identite)
- Ajouter un champ d'upload de piece d'identite dans le profil ou le wizard d'inscription
- Stocker dans le bucket `avatars` ou un nouveau bucket `identity-documents`
- Ajouter un champ `id_verified` dans la table `profiles`

### 6.3 Onglet Actualites
- Creer une nouvelle page `/actualites` avec un composant de liste d'articles
- Creer une table `articles` (id, title, content, image_url, published_at, author_id)
- Ajouter le lien dans la sidebar et la bottom nav

---

## Phase 7 : Page d'accueil refonte

### 7.1 Refonte complete de `Home.tsx`
- Remplacer le carrousel a slide unique par une grille de plusieurs photos de biens
- Bouton CTA principal : **"COMMENCER MA RECHERCHE GRATUITEMENT"**
- Afficher le nombre de matchs du jour (requete sur `matches` table avec filtre date)
- Apres 3 biens swipes (dans Explore), afficher un CTA : **"COMMENCER MA RECHERCHE"**
- Faire apparaitre le slogan **"SOMA GATE -- LA PLATEFORME D'INTELLIGENCE IMMOBILIERE"** plusieurs fois

### 7.2 Conserver le swipe style Airbnb
- Le systeme de swipe pour passer entre profils vendeur/acheteur peut etre conserve dans l'interface de navigation, pas sur la landing page

---

## Phase 8 : Notifications et micro-interactions

### 8.1 Son de notification
- Ajouter un fichier audio (ex: `/public/sounds/notification.mp3`)
- Jouer le son via `new Audio('/sounds/notification.mp3').play()` lors de la reception d'une notification en temps reel (si Supabase Realtime est configure)

### 8.2 Animation et wording du match
- Refondre `MatchAnimation.tsx` avec un visuel plus premium (pas juste un coeur bouncing)
- Retravailler le texte selon le systeme de messages valide par la cliente

---

## Phase 9 : Typographies et branding

### 9.1 Polices premium
- Proposer 3 options de polices adaptees a l'immobilier premium :
  1. **Playfair Display** (titres) + **Inter** (corps)
  2. **Cormorant Garamond** (titres) + **Source Sans Pro** (corps)
  3. **DM Serif Display** (titres) + **DM Sans** (corps)
- Integrer via Google Fonts dans `index.html` et `tailwind.config.ts`

### 9.2 Icones premium
- Remplacer les emojis dans `BuyerPreferencesWizard.tsx` par des icones Lucide ou des icones SVG custom
- Creer un jeu d'icones coherent pour chaque type de bien (villa, appartement, terrain, entrepot, etc.)

### 9.3 Logos
- Necessiter des propositions de logo de la part de l'equipe design -- hors scope dev direct
- Preparer l'integration en s'assurant que `logo-soma.png` peut etre facilement remplace

---

## Phase 10 : Chatbot

### 10.1 Integration d'un chatbot
- Creer un composant `ChatBot.tsx` accessible via un bouton flottant (FAB) en bas a droite
- Utiliser Lovable AI via une edge function pour generer les reponses
- Table `chatbot_messages` pour l'historique (user_id, role, content, created_at)
- Fonctionnalites : FAQ immobiliere, aide a la navigation, explication Leasehold/Freehold

---

## Phase 11 : Legal et conformite

### 11.1 Page CGV
- Creer `/cgv` avec un contenu placeholder a remplir par l'equipe juridique
- Lien dans le footer et la page d'inscription

### 11.2 Page Confidentialite
- Creer `/confidentialite` avec politique de confidentialite
- Lien dans le footer et les parametres

---

## Phase 12 : Corrections orthographiques
- Passer en revue tous les textes de l'application (labels, placeholders, messages toast, emails)
- Corriger les fautes d'orthographe et incoherences (ex: placeholder "Plateau, Cocody, Dakar..." dans PropertyForm.tsx doit devenir "Canggu, Seminyak, Ubud...")

---

## Details techniques

### Migrations DB necessaires
1. Modifier l'enum `property_operation` : ajouter `leasehold`, `freehold`
2. Ajouter la table `articles` pour les actualites
3. Ajouter `id_verified boolean DEFAULT false` et `id_document_url text` a `profiles`
4. (Optionnel) Table `chatbot_messages` pour le chatbot

### Edge functions a modifier
- `send-email` : fix import Resend + mise a jour slogan
- `create-test-users` : mise a jour terminologie

### Fichiers principaux impactes
- `src/pages/Home.tsx` -- refonte complete
- `src/components/swipe/SwipeCard.tsx` -- ameliorations visuelles
- `src/components/explore/ExploreFilters.tsx` -- recherche avancee
- `src/components/preferences/BuyerPreferencesWizard.tsx` -- terminologie + nouvelles etapes
- `src/components/map/PropertyMap.tsx` -- code couleur
- `src/lib/currencies.ts` -- format prix avec points
- `src/components/layout/AppSidebar.tsx` et `BottomNav.tsx` -- navigation
- `src/pages/Admin.tsx` -- coherence
- Nouvelles pages : CGV, Confidentialite, Actualites

### Ordre de priorite recommande
1. Phase 1 (bug fix + corrections critiques)
2. Phase 2 (UX fiches biens)
3. Phase 5 (preferences acheteur)
4. Phase 7 (page d'accueil)
5. Phase 3 (carte)
6. Phase 4 (recherche)
7. Phase 6 (navigation)
8. Phase 12 (orthographe)
9. Phase 8-11 (notifications, typo, chatbot, legal)

> **Note** : Les propositions de logo (point 9.2) et le rendez-vous en presentiel (point 17.1) sont hors du scope technique de ce plan. Les logos doivent etre fournis par l'equipe design, et le rendez-vous est un point organisationnel.
