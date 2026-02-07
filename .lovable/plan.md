

# Etape 1 : Corriger les bugs existants et ajouter les fonctionnalites manquantes prioritaires

## Analyse de l'existant vs le cahier des charges

### Bugs a corriger en priorite

1. **Erreur critique sur `/explore`** : Le composant `PropertyMap` utilise `react-leaflet` de maniere incompatible avec React 18. L'erreur `render2 is not a function` vient d'un conflit `Context.Consumer` dans `MapContainer`. Il faut corriger l'import et le rendu de la carte.

2. **Pas de page de selection de role (`/profile-selection`)** : Le cahier des charges prevoit qu'apres l'inscription, l'utilisateur passe par une page de selection de role PUIS une page de configuration de profil (`/profile-setup`). Actuellement, le role est choisi dans le formulaire d'inscription directement, mais il manque le flux post-inscription complet.

3. **Pas de page d'accueil desktop (`Home.tsx`)** : Le cahier des charges prevoit une page d'accueil pour le desktop, avec la landing page. Actuellement, `/` redirige directement vers `/explore` ou `/dashboard`.

4. **Statistiques du profil en dur** : Les stats (Biens vus, Matches, Visites) affichent toutes `0` en dur. Elles doivent etre alimentees par les vraies donnees depuis Supabase.

### Fonctionnalites manquantes (par priorite)

**Priorite haute - Workflow de base manquant :**

5. **Tables workflow manquantes** : Le cahier des charges prevoit 7 tables supplementaires (`wf_transactions`, `wf_transaction_logs`, `wf_messages`, `wf_documents`, `wf_notifications`, `wf_user_scores`, `wf_reminders`). Aucune n'existe encore. Ce sont les fondations du workflow transactionnel.

6. **Page Transaction** : La page `/transaction/:id` qui centralise tout le workflow (apercu, visite, messages securises, documents) n'existe pas.

7. **Messagerie securisee** : Le cahier des charges prevoit un `MessageDetectionService` qui bloque les numeros de telephone et detecte les mots-cles suspects. La messagerie actuelle est basique sans aucune protection.

**Priorite moyenne :**

8. **Page "Mes Transactions"** : Page `/mes-transactions` listant toutes les transactions actives.
9. **Dashboard Owner avec onglets** : Le dashboard proprietaire doit avoir des onglets (Mes biens, Visites, Messages, Profil).
10. **Systeme de notifications in-app** (`wf_notifications`).
11. **Score utilisateur** et badge "Client Certifie".

**Priorite basse (future) :**

12. Edge Functions (send-email, send-push, process-reminders, create-test-users).
13. Page Admin.
14. Generation de documents PDF.
15. PWA / Capacitor.

---

## Plan d'implementation - Etape 1 (cette iteration)

On se concentre sur les **bugs critiques** et les **fondations du workflow** :

### 1. Corriger le bug `PropertyMap` (crash react-leaflet)

- Le composant `MapContainer` de react-leaflet a un probleme de compatibilite Context.Consumer avec React 18
- Corriger en supprimant les enfants JSX directs qui causent le probleme
- Wrapper correctement les composants Leaflet

### 2. Alimenter les statistiques du profil avec de vraies donnees

- Compter les swipes de l'utilisateur pour "Biens vus"
- Compter les matches pour "Matches"  
- Compter les visites pour "Visites"
- Ajouter les requetes dans `ProfileForm.tsx`

### 3. Creer les tables du workflow transactionnel

Migration SQL pour creer les 7 tables manquantes :
- `wf_transactions` : Table centrale avec statuts, dates, validations croisees
- `wf_transaction_logs` : Historique des actions/transitions
- `wf_messages` : Messagerie securisee liee aux transactions
- `wf_documents` : Documents generes (LOI, contrats, etc.)
- `wf_notifications` : Notifications in-app
- `wf_user_scores` : Score et certification utilisateur
- `wf_reminders` : Rappels programmes

Avec RLS policies appropriees pour chaque table.

### 4. Creer le WorkflowService

- Service TypeScript implementant la state machine avec les 14 statuts
- Transitions validees (`VALID_TRANSITIONS`)
- Methodes : `createTransaction`, `updateStatus`, `requestVisit`, `proposeVisitDates`, `confirmVisit`, `completeVisit`, `expressIntention`, `makeOffer`

### 5. Creer le MessageDetectionService

- Detection de numeros de telephone (regex)
- Detection de mots-cles suspects (whatsapp, telegram, virement, etc.)
- Blocage des messages avec numeros
- Flagging des messages suspects
- Integration dans le `ChatView` existant

### 6. Creer la page Transaction (`/transaction/:id`)

- 4 onglets : Apercu, Visite, Messages, Documents
- Affichage du statut avec `TransactionStatusBadge`
- Timeline de la transaction
- Composants workflow selon le statut actuel
- Integration de la messagerie securisee

### 7. Modifier le flux de match pour creer une transaction

- Quand un match est cree (swipe droit), creer aussi une `wf_transaction` avec statut `matched`
- Lier la transaction au match
- Rediriger vers la page transaction depuis les matches

---

## Details techniques

### Tables SQL a creer

```text
wf_transactions (24+ colonnes)
  - Statut, liens buyer/seller/property
  - Dates de chaque etape
  - Validations croisees
  - Offre et intention

wf_transaction_logs
  - Historique des transitions
  - Actor et details JSON

wf_messages
  - Messages lies a une transaction
  - Flags securite (phone, suspicious)

wf_documents  
  - Documents generes
  - Validation croisee buyer/seller

wf_notifications
  - Notifications in-app
  - Support push/email

wf_user_scores
  - Score 0-100
  - Compteurs et certification

wf_reminders
  - Rappels programmes
  - Types : visit_j1, visit_h2, relance_12h
```

### Fichiers a creer/modifier

**Nouveaux fichiers :**
- `src/services/workflowService.ts`
- `src/services/messageDetectionService.ts`
- `src/types/workflow.ts`
- `src/hooks/useTransaction.ts`
- `src/pages/Transaction.tsx`
- `src/pages/MyTransactions.tsx`
- `src/components/workflow/TransactionStatus.tsx`
- `src/components/workflow/SecureMessaging.tsx`
- `src/components/workflow/VisitManagement.tsx`
- `src/components/workflow/SecurityAlert.tsx`

**Fichiers a modifier :**
- `src/App.tsx` : Ajouter routes `/transaction/:id` et `/mes-transactions`
- `src/components/map/PropertyMap.tsx` : Corriger le bug react-leaflet
- `src/components/profile/ProfileForm.tsx` : Stats dynamiques
- `src/hooks/useSwipes.ts` : Ajouter creation de `wf_transaction` au match
- `src/components/matches/MatchList.tsx` : Lien vers la transaction
- `src/components/layout/BottomNav.tsx` : Ajouter lien transactions si pertinent

