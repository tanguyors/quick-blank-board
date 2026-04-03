# 13 — Sécurité, Scores & Certification

## Row-Level Security (RLS)

### Principes
- **Toutes les tables** ont RLS activé
- Les policies utilisent `auth.uid()` pour vérifier l'identité
- La fonction `has_role()` (`SECURITY DEFINER`) est utilisée pour les vérifications admin sans récursion
- Les admins ont accès en lecture à toutes les tables via des policies dédiées

### Patterns RLS Utilisés

#### Pattern 1 : Owner-based
```sql
-- L'utilisateur ne voit que ses propres données
USING (auth.uid() = user_id)
```
Tables : `buyer_preferences`, `favorites`, `swipes`, `wf_user_scores`

#### Pattern 2 : Participant-based
```sql
-- L'utilisateur voit les données où il est participant
USING (auth.uid() = buyer_id OR auth.uid() = owner_id)
```
Tables : `conversations`, `messages`, `visits`, `wf_transactions`

#### Pattern 3 : Public conditionnel
```sql
-- Données publiques sous conditions
USING (is_published = true AND status = 'available')
```
Tables : `properties`

#### Pattern 4 : Admin bypass
```sql
-- Les admins voient tout
USING (has_role(auth.uid(), 'admin'))
```
Tables : toutes les tables admin-accessibles

#### Pattern 5 : Transaction-scoped
```sql
-- Accès basé sur la participation à une transaction
USING (EXISTS (
  SELECT 1 FROM wf_transactions t
  WHERE t.id = wf_documents.transaction_id
  AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
))
```
Tables : `wf_documents`, `wf_messages`, `wf_notifications`, `wf_transaction_logs`, `wf_reminders`

---

## Score de Confiance

### Calcul (`wf_calculate_user_score`)

```sql
v_score := 50                           -- Base
  + (v_completed * 10)                  -- +10 par deal finalisé
  - (v_cancelled * 5)                   -- -5 par deal annulé
  - (v_no_shows * 10)                   -- -10 par no-show
  - (v_refusals * 5);                   -- -5 par refus de visite
v_score := GREATEST(0, LEAST(100, v_score));  -- Clamp [0, 100]
```

### Déclencheurs de Recalcul
1. **Refus de visite** (`refuseVisit()`) : pénalise le vendeur
2. **No-show** (`completeVisit(wasPresent: false)`) : pénalise le no-show
3. **Deal finalisé** (`finalizeDeal()`) : recalcule les deux parties

### Stockage (`wf_user_scores`)
- `score` : 0-100
- `total_transactions`, `completed_transactions`, `cancelled_transactions`
- `no_shows`, `visit_refusals`
- `certified` : true si au moins un deal finalisé
- `certified_at` : date de la certification
- `vip_access` : réservé (pas encore implémenté)
- `last_calculated_at` : horodatage du dernier calcul

### Affichage
- **ProfileForm** : barre de progression + score numérique
- **CertifiedBadge** : badge vert "Client Certifié" si `certified = true`

---

## Certification Client

### Conditions
Un utilisateur est certifié quand il finalise son premier deal :

```typescript
// Dans finalizeDeal() :
await supabase.from('wf_user_scores').update({
  certified: true,
  certified_at: new Date().toISOString(),
}).eq('user_id', tx.buyer_id);
// Même chose pour seller
```

### CertifiedBadge (`src/components/ui/CertifiedBadge.tsx`)
- Badge visuel avec checkmark
- Affiché sur le profil si `wf_user_scores.certified = true`

---

## Protection Anti-Fraude

### Détection dans les Messages (`MessageDetectionService`)

**Numéros de téléphone** → MESSAGE BLOQUÉ
- 4 patterns regex
- Seuil : ≥8 chiffres dans la séquence détectée

**Mots-clés suspects** → MESSAGE FLAGGÉ + AVERTISSEMENT
- 30+ mots-clés dans 6 catégories (plateformes, contact direct, paiements, contournement, données bancaires)

### Messages de Sécurité
5 messages affichés contextuellement sur l'interface de transaction :
1. Anti-scam général
2. Pas d'échange de téléphone
3. Avertissement no-show
4. Avertissement refus de visite
5. Protection en cas de litige

### Logs Immuables (`wf_transaction_logs`)
- **Aucune suppression ou modification** autorisée (pas de policy UPDATE/DELETE)
- Chaque action est loggée avec :
  - `action` : nom de l'action
  - `actor_id` : qui a agi
  - `actor_role` : buyer/seller/system
  - `previous_status` / `new_status`
  - `details` : données supplémentaires (JSONB)
  - `created_at` : horodatage

### Export de Preuves
- `TransactionExportService.exportTransaction(id)` génère un fichier TXT complet
- Contient : bien, participants, dates clés, offre, documents, messages (avec flags), historique complet
- Footer : "En cas de litige, SomaGate conserve l'historique complet du projet. Ce document fait foi."

---

## Vérification d'Identité (KYC)

### Flux
1. **Upload** : utilisateur soumet un document d'identité
2. **Stockage** : bucket privé `identity-documents` (path: `{user_id}/{filename}`)
3. **Statuts** : `pending` → `approved` | `rejected` (avec motif)
4. **Admin** : visualise le document via signed URL, approuve ou rejette

### RLS
- Users : INSERT propre, SELECT propre, UPDATE propre (seulement si pending)
- Admins : SELECT tout, UPDATE tout

### Storage Policies
- Upload : `(bucket_id = 'identity-documents') AND (auth.uid()::text = (storage.foldername(name))[1])`
- Lecture : même condition OU admin
