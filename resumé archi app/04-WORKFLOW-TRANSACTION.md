# 04 — Workflow de Transaction (Machine à États)

## Vue d'ensemble

Le cœur métier de SomaGate est un workflow de transaction immobilière complet, implémenté comme une **machine à états stricte** avec 14 statuts et des transitions validées.

---

## Diagramme de la Machine à États

```
                    ┌──────────┐
                    │ matched  │
                    └────┬─────┘
                         │ requestVisit()
                    ┌────▼──────────┐
                    │visit_requested│
                    └──┬────────┬───┘
        proposeVisitDates() │   │ refuseVisit()
                    ┌──▼────┐  ┌▼──────────────┐
                    │visit_  │  │visit_cancelled │◄──┐
                    │proposed│  └───────┬────────┘   │
                    └──┬──┬─┘          │             │
      confirmVisit()   │  │    ┌───────▼─────┐      │
               ┌───────▼┐ │    │visit_requested│     │
               │visit_   │ │    │  (re-request) │     │
               │confirmed│ │    └──────────────┘     │
               └──┬───┬──┘ │                         │
  completeVisit() │   │    └──── rescheduleVisit() ──┘
               ┌──▼───────────┐       ┌──────────────┐
               │visit_completed│       │visit_         │
               └──────┬───────┘       │rescheduled    │
                      │               └───┬───────────┘
         expressIntention()               │confirmVisit()
               ┌──────▼────────┐     ┌────▼──────┐
               │intention_     │     │visit_      │
               │expressed      │     │confirmed   │
               └──┬────────┬───┘     └────────────┘
      makeOffer() │        │ expressIntention('stop')
               ┌──▼─────┐ ┌▼────────────┐
               │offer_   │ │deal_cancelled│
               │made     │ └──────┬───────┘
               └──┬──────┘        │
  auto-generate    │               │
               ┌──▼──────────────┐│
               │documents_       ││
               │generated        ││
               └──┬──────────────┘│
  all docs validated               │
               ┌──▼──────────┐    │
               │in_validation│    │
               └──┬──────────┘    │
  finalizeDeal()   │               │
               ┌──▼──────────┐    │
               │deal_        │    │
               │finalized    │    │
               └──┬──────────┘    │
                  │               │
               ┌──▼───────────────▼──┐
               │     archived        │
               └─────────────────────┘
```

---

## Matrice de Transitions Valides

```typescript
export const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  matched:             ['visit_requested'],
  visit_requested:     ['visit_proposed', 'visit_cancelled'],
  visit_proposed:      ['visit_confirmed', 'visit_cancelled', 'visit_rescheduled'],
  visit_confirmed:     ['visit_completed', 'visit_cancelled', 'visit_rescheduled'],
  visit_completed:     ['intention_expressed'],
  visit_cancelled:     ['visit_requested', 'archived'],
  visit_rescheduled:   ['visit_confirmed', 'visit_cancelled'],
  intention_expressed: ['offer_made', 'deal_cancelled'],
  offer_made:          ['documents_generated', 'deal_cancelled'],
  documents_generated: ['in_validation'],
  in_validation:       ['deal_finalized', 'documents_generated'],
  deal_finalized:      ['archived'],
  deal_cancelled:      ['archived'],
  archived:            [],
};
```

---

## WorkflowService (`src/services/workflowService.ts`)

### Méthodes Principales

#### `createTransaction(propertyId, buyerId, sellerId)`
- Insère dans `wf_transactions` avec status `matched`
- Crée un log `transaction_created`
- Envoie notifications aux deux parties
- Envoie emails via `EmailService.sendToTransactionParties()`

#### `updateStatus(transactionId, newStatus, actorId, additionalData?)`
- Vérifie la transition via `isValidTransition()`
- Throw error si transition invalide
- Met à jour `status` et `previous_status`
- Crée un log avec `actorRole` (buyer/seller)

#### `requestVisit(transactionId, buyerId)`
- Transition `matched → visit_requested`
- Enregistre `visit_requested_at`

#### `proposeVisitDates(transactionId, sellerId, dates[])`
- Le vendeur propose des créneaux
- Transition → `visit_proposed`
- Stocke les dates en JSONB : `[{ date: string, preference: number }]`

#### `refuseVisit(transactionId, sellerId, reason, details?)`
- Transition → `visit_cancelled`
- Enregistre `visit_refusal_reason` et `visit_refusal_details`
- **Pénalise le score du vendeur** via `wf_calculate_user_score()`

#### `confirmVisit(transactionId, userId, confirmedDate)`
- Mécanisme de **double confirmation** :
  - Si buyer confirme : `visit_confirmed_by_buyer = true`
  - Si seller confirme : `visit_confirmed_by_seller = true`
  - Si les deux ont confirmé → transition `visit_confirmed`
- Quand les deux confirment :
  - Crée des rappels J-1 et H-2 pour les deux parties
  - Envoie des notifications enrichies (avec détails du bien)
  - Envoie des emails de confirmation

#### `rescheduleVisit(transactionId, userId)`
- Transition → `visit_rescheduled`
- Reset : `visit_confirmed_date`, `visit_confirmed_by_buyer/seller`, `visit_proposed_dates` → null/false

#### `completeVisit(transactionId, userId, wasPresent)`
- Si `wasPresent = false` : marque le no-show et pénalise le score
- Transition → `visit_completed`

#### `expressIntention(transactionId, buyerId, intention, reason?, details?)`
- `intention = 'stop'` → transition `deal_cancelled` (avec motifs de rejet)
- `intention = 'continue'` ou `'offer'` → transition `intention_expressed`

#### `makeOffer(transactionId, buyerId, offerType, amount, details?)`
- Transition → `offer_made`
- Enregistre `offer_type`, `offer_amount`, `offer_details`
- **Déclenche auto-génération de documents** via `DocumentGenerationService`
- Envoie email au vendeur avec détails de l'offre

#### `finalizeDeal(transactionId, userId)`
- Mécanisme de **double validation** :
  - Buyer valide → `buyer_validated = true`, `buyer_validated_at`
  - Seller valide → `seller_validated = true`, `seller_validated_at`
  - Si les deux ont validé → transition `deal_finalized`
- Quand les deux valident :
  - **Certifie les deux utilisateurs** (`certified = true`)
  - **Recalcule les scores** des deux parties
  - Envoie notifications de félicitations
  - Envoie emails

#### `submitFeedback(transactionId, userId, feedback)`
- Stocke le feedback dans les logs de transaction

---

## Rappels Automatiques

### Rappels de Visite (J-1 et H-2)
Créés dans `createVisitReminders()` :
- **J-1** : 24 heures avant la visite
- **H-2** : 2 heures avant la visite
- Un rappel pour l'acheteur ET pour le vendeur

### Rappels d'Inactivité (12h)
Créés par l'Edge Function `process-reminders` :
- Détecte les transactions stagnantes depuis >12h
- Statuts surveillés : `visit_requested`, `visit_proposed`, `documents_generated`
- Identifie qui doit agir (ex: vendeur doit proposer des dates)
- Ne renvoie pas si déjà envoyé dans les dernières 24h

---

## Motifs de Rejet Structurés

### Refus de Visite (3 motifs)
Implémentés dans `VisitManagement.tsx`.

### Arrêt d'Intention (8 motifs)
Implémentés dans `TransactionStatus.tsx` :
1. Bien ne correspond pas
2. Budget dépassé
3. Localisation inadaptée
4. État du bien décevant
5. Conditions défavorables
6. Autre opportunité trouvée
7. Délai trop long
8. Autre (champ libre)

---

## Hook : `useTransaction(transactionId)`

Retourne :
- `transaction` : query avec données enrichies (property, buyer_profile, seller_profile)
- `logs` : historique complet
- `messages` : messages sécurisés (polling 5s)
- `documents` : documents générés
- `requestVisit`, `proposeVisitDates`, `refuseVisit`, `confirmVisit`, `completeVisit`, `rescheduleVisit`, `expressIntention`, `makeOffer`, `finalizeDeal`, `submitFeedback`, `sendMessage` : mutations

### `useMyTransactions()`
- Query toutes les transactions où l'utilisateur est buyer OU seller
- Enrichit avec les données du bien (type, adresse, prix, media)
