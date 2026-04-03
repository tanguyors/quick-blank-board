# 03 — Authentification & Gestion des Rôles

## Mécanisme d'Authentification

### Provider
- **Supabase Auth** avec email/password uniquement
- Pas d'OAuth (Google, GitHub, etc.) configuré

### Flux d'Inscription (`AuthForm.tsx`)

1. L'utilisateur saisit email, mot de passe, nom complet
2. Choix du rôle : `user` (acheteur) ou `owner` (propriétaire)
3. Acceptation obligatoire des CGU + Confidentialité (checkbox)
4. `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
5. Le trigger `handle_new_user()` crée automatiquement le `profile`
6. Côté client, on fait ensuite :
   - `UPSERT profiles` (first_name, full_name, email)
   - `INSERT user_roles` (user_id, role)
   - `INSERT wf_user_scores` (user_id, score: 50)
7. Redirection vers `/profile-selection`

### Flux de Connexion

1. `supabase.auth.signInWithPassword({ email, password })`
2. Redirection vers `/` qui déclenche `Index.tsx`

### Persistance de Session

```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

---

## AuthContext (`src/contexts/AuthContext.tsx`)

### État Géré
```typescript
interface AuthContextType {
  user: User | null;           // Supabase User
  session: Session | null;     // Supabase Session (JWT)
  profile: Profile | null;     // Table profiles
  roles: string[];             // Array de rôles depuis user_roles
  loading: boolean;            // true jusqu'à init complète
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

### Initialisation (CRITIQUE)
L'initialisation suit un ordre précis pour éviter les erreurs de routage :

1. **`initializeAuth()`** (async, appelé une fois) :
   - `supabase.auth.getSession()` → récupère la session existante
   - Si session : `await Promise.all([fetchProfile(), fetchRoles()])` — **attend les deux**
   - `setLoading(false)` seulement après

2. **`onAuthStateChange()`** (listener continu) :
   - Fire and forget : ne bloque pas le loading
   - Met à jour user/session/profile/roles en background

> **Pourquoi ?** Les rôles sont nécessaires pour la redirection dans `Index.tsx`. Si on ne les attend pas, l'utilisateur est redirigé vers `/explore` au lieu de `/profile` ou `/notaire`.

### Sign Out
```typescript
const signOut = async () => {
  await supabase.auth.signOut();
  setUser(null);
  setSession(null);
  setProfile(null);
  setRoles([]);
};
```

---

## Système de Rôles

### Rôles Disponibles

| Rôle | Description | Accès |
|---|---|---|
| `user` | Acheteur / Chercheur | Explore, Swipe, Matches, Favoris, Transactions, Preferences |
| `owner` | Propriétaire | Dashboard propriétés, Visites, Messages, Transactions |
| `admin` | Administrateur | Panel admin complet, gestion users/properties/verifications |
| `notaire` | Notaire | Dashboard notaire, dossiers de transaction |
| `agent` | Agent immobilier | (Défini dans l'enum mais pas encore implémenté dans l'UI) |

### Fonction de Vérification (PostgreSQL)

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

- `SECURITY DEFINER` : s'exécute avec les privileges du propriétaire de la fonction
- Évite la récursion RLS (la table `user_roles` a des policies qui utilisent `has_role`)

### Redirection par Rôle (`Index.tsx`)

```typescript
if (!user) return <Home />;  // Landing page

const isNotaire = roles.includes('notaire');
const isOwner = roles.includes('owner');
const isAdmin = roles.includes('admin');

const redirectPath = isNotaire ? '/notaire' 
  : (isOwner || isAdmin) ? '/profile' 
  : '/explore';
```

### Navigation par Rôle (`AppSidebar.tsx` + `BottomNav.tsx`)

Chaque rôle a ses propres liens de navigation :

**Buyer** : Dashboard → Découvrir → Matches → Favoris → Messages → Notifications → Transactions
**Owner** : Mes Biens → Visites → Messages → Notifications → Transactions
**Notaire** : Dossiers → Messages → Notifications
**Admin** : Vue d'ensemble → Utilisateurs → Propriétés → Visites → Transactions → Carte → Notifications

---

## Route Protection (`ProtectedRoute.tsx`)

```typescript
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
```

- **Pas de vérification de rôle** au niveau du routeur — chaque page gère ses propres permissions
- Le `loading` state empêche le flash de redirection pendant l'initialisation

---

## Vérification d'Identité (KYC)

### Flux Utilisateur
1. L'utilisateur va dans **Paramètres du compte** → section "Vérification d'identité"
2. Upload d'un document (carte d'identité, passeport)
3. Le fichier est stocké dans le bucket privé `identity-documents`
4. Une entrée est créée dans `identity_verifications` avec `status = 'pending'`
5. Badge "En attente de vérification" affiché

### Flux Admin
1. L'admin va dans le **Panel Admin** → onglet "Vérifications"
2. Voit la liste des demandes en attente
3. Peut visualiser le document via signed URL
4. Approuve ou rejette (avec motif obligatoire si rejet)
5. La mise à jour du statut déclenche l'affichage du badge "Vérifié" ou du motif de rejet

### Hook : `useIdentityVerification()`
- `verification` : query pour récupérer la vérification de l'utilisateur courant
- `submitVerification` : mutation pour uploader et créer l'entrée
- `reviewVerification` : mutation admin pour approuver/rejeter
- `getSignedUrl()` : génère une URL signée pour visualiser le document privé
