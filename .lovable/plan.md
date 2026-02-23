

# Multi-langue Soma Gate + Champ Nationalite

## Objectif
Rendre l'application entierement traduisible en 8 langues (Francais, Anglais, Indonesien, Espagnol, Allemand, Hollandais, Russe, Chinois) avec un selecteur visible dans le hero et le profil. Ajouter un champ "nationalite" facultatif pour les proprietaires.

---

## Architecture technique

### Systeme de traduction

On utilise **react-i18next** (standard React pour l'i18n) avec des fichiers de traduction JSON statiques. Une edge function Supabase appellera l'API Google Translate pour generer les traductions initiales a partir du francais.

**Langues supportees :**

| Code | Langue |
|------|--------|
| `fr` | Francais (defaut) |
| `en` | Anglais |
| `id` | Indonesien |
| `es` | Espagnol |
| `de` | Allemand |
| `nl` | Hollandais |
| `ru` | Russe |
| `zh` | Chinois |

### Stockage de la preference
- La langue choisie est sauvegardee dans `localStorage` pour les visiteurs non connectes
- Pour les utilisateurs connectes, un nouveau champ `preferred_language` dans la table `profiles` persiste le choix

---

## Etapes d'implementation

### 1. Migration base de donnees
Ajouter deux colonnes a la table `profiles` :
- `preferred_language TEXT DEFAULT 'fr'` -- langue preferee
- `nationality TEXT` -- nationalite du proprietaire (facultatif)

### 2. Installer react-i18next
Ajouter les dependances `i18next` et `react-i18next`.

### 3. Creer les fichiers de traduction
Creer `src/i18n/` avec :
- `index.ts` -- configuration i18next
- `locales/fr.json` -- toutes les chaines francaises extraites
- `locales/en.json`, `locales/id.json`, `locales/es.json`, `locales/de.json`, `locales/nl.json`, `locales/ru.json`, `locales/zh.json`

Les fichiers contiendront les traductions pour :
- Navigation (Explorer, Matches, Favoris, Profil, Messages, etc.)
- Pages principales (Home hero, auth, profil, parametres)
- Composants partages (boutons, labels, filtres)
- Notifications et toasts
- Textes legaux (titres uniquement, le contenu legal reste en francais)

### 4. Creer le composant LanguageSelector
`src/components/ui/LanguageSelector.tsx` -- un dropdown avec les drapeaux/noms des 8 langues. Utilise dans :
- **Hero** (Home.tsx) : a cote du bouton "Connexion"
- **Profil** (ProfileForm.tsx) : dans la section parametres
- **AccountSettings** : dans les preferences
- **Header** et **AppSidebar** : pour acces rapide

### 5. Edge Function Google Translate (utilitaire admin)
`supabase/functions/translate/index.ts` -- permet de traduire un lot de chaines via l'API Google Cloud Translation. Utilisee comme outil d'administration pour generer les fichiers JSON, pas en temps reel.

### 6. Integrer `useTranslation()` dans les composants
Remplacer les chaines francaises hardcodees par `t('cle')` dans les fichiers principaux :
- `src/pages/Home.tsx`
- `src/pages/Auth.tsx` (AuthForm)
- `src/components/layout/Header.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/layout/AppSidebar.tsx`
- `src/components/profile/ProfileForm.tsx`
- `src/pages/AccountSettings.tsx`
- `src/pages/ProfileSetup.tsx`
- `src/components/explore/ExploreFilters.tsx`
- `src/components/properties/PropertyDetail.tsx`
- Et les autres pages/composants progressivement

### 7. Champ Nationalite proprietaire
- Ajouter un input "Nationalite" (facultatif) dans :
  - `src/pages/ProfileSetup.tsx` (visible si role owner)
  - `src/pages/AccountSettings.tsx`
  - `src/components/dashboard/OwnerProfileTab.tsx`

### 8. Wrapper App
Ajouter le provider i18next dans `src/main.tsx` et synchroniser la langue avec le profil utilisateur dans `AuthContext`.

---

## Fichiers concernes

| Action | Fichier |
|--------|---------|
| Creer | `src/i18n/index.ts` |
| Creer | `src/i18n/locales/fr.json` |
| Creer | `src/i18n/locales/en.json` |
| Creer | `src/i18n/locales/id.json` |
| Creer | `src/i18n/locales/es.json` |
| Creer | `src/i18n/locales/de.json` |
| Creer | `src/i18n/locales/nl.json` |
| Creer | `src/i18n/locales/ru.json` |
| Creer | `src/i18n/locales/zh.json` |
| Creer | `src/components/ui/LanguageSelector.tsx` |
| Creer | `supabase/functions/translate/index.ts` |
| Migration | `profiles` : ajouter `preferred_language`, `nationality` |
| Modifier | `src/main.tsx` |
| Modifier | `src/pages/Home.tsx` |
| Modifier | `src/components/layout/Header.tsx` |
| Modifier | `src/components/layout/BottomNav.tsx` |
| Modifier | `src/components/layout/AppSidebar.tsx` |
| Modifier | `src/components/profile/ProfileForm.tsx` |
| Modifier | `src/pages/AccountSettings.tsx` |
| Modifier | `src/pages/ProfileSetup.tsx` |
| Modifier | `src/components/auth/AuthForm.tsx` |
| Modifier | `src/components/dashboard/OwnerProfileTab.tsx` |
| Modifier | `src/contexts/AuthContext.tsx` |
| Modifier | Autres composants (explore, properties, etc.) |

---

## Pre-requis
- **Cle API Google Cloud Translation** : necessaire pour l'edge function de traduction. Elle devra etre ajoutee comme secret Supabase (`GOOGLE_TRANSLATE_API_KEY`).

