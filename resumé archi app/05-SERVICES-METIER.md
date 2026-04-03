# 05 — Services Métier

## 1. MessageDetectionService (`src/services/messageDetectionService.ts`)

### Objectif
Analyser les messages envoyés dans le cadre des transactions pour détecter et bloquer les tentatives de contournement de la plateforme.

### Détection de Numéros de Téléphone

**Patterns regex** :
```typescript
const PHONE_PATTERNS = [
  /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4}/g,
  /\b\d{10}\b/g,                                    // 10 chiffres consécutifs
  /\b0[67]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\b/g,    // Numéros FR mobiles
  /\+\d{1,3}\s?\d{1,2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/g,  // International
];
```

**Règle** : Un match est considéré comme un numéro si la séquence de chiffres ≥ 8 caractères.

**Résultat** : Le message est **BLOQUÉ** — il n'est pas enregistré en base.

### Détection de Comportement Suspect

**Mots-clés surveillés** (30+) :
- Plateformes externes : `whatsapp`, `telegram`, `signal`, `viber`
- Contact direct : `appelle-moi`, `contacte-moi`, `mon numéro`
- Paiements hors plateforme : `virement`, `western union`, `bitcoin`, `cash`, `espèces`
- Contournement : `hors plateforme`, `directement`, `en direct`
- Données bancaires : `iban`, `rib`, `compte bancaire`

**Résultat** : Le message est ENREGISTRÉ mais **flaggé** (`flagged_suspicious = true`), et une notification d'avertissement est envoyée à l'expéditeur.

### Méthode Principale

```typescript
static async analyzeAndSaveMessage(transactionId, senderId, receiverId, content):
  → Si numéro détecté : return { success: false, blocked: true, reason: "..." }
  → Si suspect : insert message + create warning notification, return { success: true, suspicious: true }
  → Sinon : insert message, return { success: true }
```

---

## 2. DocumentGenerationService (`src/services/documentGenerationService.ts`)

### Objectif
Générer automatiquement les documents juridiques nécessaires après une offre.

### Documents Générés

| Type | Titre | Quand |
|---|---|---|
| `loi` | Lettre d'Intention (LOI) | Toujours après une offre |
| `term_sheet` | Term Sheet | Toujours après une offre |
| `contrat_vente` | Contrat de Vente | Si opération = vente (freehold) |
| `contrat_location` | Contrat de Location | Si opération ≠ vente |

### Flux

1. `makeOffer()` dans WorkflowService déclenche `generateDocumentsForOffer(transactionId)`
2. Récupère transaction, property, buyer profile, seller profile
3. Génère le contenu JSON structuré pour chaque document
4. Insert dans `wf_documents` (version 1, non validé)
5. Met à jour le statut transaction → `documents_generated`
6. Notifie les deux parties

### Contenu des Documents

#### LOI (Lettre d'Intention)
```json
{
  "document_type": "Lettre d'Intention",
  "reference": "LOI-XXXXXXXX",
  "parties": { "acheteur": {...}, "vendeur": {...} },
  "bien": { type, adresse, surface, chambres, droit },
  "conditions": { prix_demande, prix_offert, type_offre, devise },
  "clauses": ["L'acheteur manifeste son intention...", ...]
}
```

#### Term Sheet
- Résumé de la transaction
- Conditions financières (montant, dépôt de garantie 10%, modalités)
- Calendrier (date offre, visite, date limite validation 15j)
- Conditions suspensives (titre foncier, financement, etc.)

#### Contrat de Vente
- Parties (vendeur/acquéreur)
- Désignation du bien (type, adresse, surface, titre propriété)
- Prix et paiement (montant, dépôt garantie 10%)
- 6 articles standards (propriété légitime, état actuel, transfert chez notaire, etc.)

#### Contrat de Location
- Parties (bailleur/locataire)
- Conditions financières (loyer, caution 2 mois, avance 1 mois)
- Durée (12 mois, tacite reconduction)
- 6 articles standards (utilisation conforme, entretien, préavis 3 mois, etc.)

### Validation de Documents

```typescript
static async validateDocument(documentId, userId, role: 'buyer' | 'seller')
```
- Met à jour `buyer_validated` ou `seller_validated`
- Si **tous** les documents de la transaction sont validés par les deux parties → transition `in_validation`

---

## 3. TransactionExportService (`src/services/transactionExportService.ts`)

### Objectif
Permettre le téléchargement d'un dossier complet de transaction pour preuve juridique.

### Contenu du Dossier Exporté (format TXT)

1. **En-tête** : ID transaction, statut, date d'export
2. **Bien immobilier** : type, adresse, prix, surface, chambres
3. **Participants** : noms acheteur/vendeur
4. **Dates clés** : match, visite demandée/confirmée/effectuée, deal finalisé
5. **Offre** : type, montant, détails
6. **Documents** : liste avec statut de validation (buyer/seller + dates)
7. **Messages** : historique complet avec flags (📞 numéro détecté, ⚠️ suspect)
8. **Historique** : tous les logs (action, statut, acteur)
9. **Footer sécurité** : "En cas de litige, SomaGate conserve l'historique complet"

### Téléchargement
- Génère un `Blob` text/plain
- Crée un lien `<a>` temporaire pour le téléchargement
- Nom du fichier : `somagate-dossier-{8chars}-{date}.txt`

---

## 4. EmailService (`src/services/emailService.ts`)

### Objectif
Abstraction pour l'envoi d'emails via l'Edge Function `send-email`.

### Méthodes

```typescript
// Envoi direct
static async send({ to, template, data }): Promise<boolean>

// Envoi par user ID (récupère l'email du profil)
static async sendToUser(userId, template, data): Promise<boolean>

// Envoi aux deux parties d'une transaction
static async sendToTransactionParties(buyerId, sellerId, template, data): Promise<void>
```

### Templates Disponibles
- `matched` : Nouveau match
- `visit_confirmed` : Visite confirmée
- `visit_reminder` : Rappel de visite
- `offer_made` : Offre reçue
- `deal_finalized` : Deal finalisé
- `generic` : Template générique

### Comportement
- **Fail silently** : les erreurs sont loggées mais ne bloquent jamais le workflow
- `sendToTransactionParties` utilise `Promise.allSettled` (pas `.all`)
- Injecte `recipient_name` depuis le profil

---

## 5. Système de Devises (`src/lib/currencies.ts`)

### Devises Supportées

| Code | Symbole | Taux vs EUR |
|---|---|---|
| EUR | € | 1 |
| USD | $ | 1.08 |
| GBP | £ | 0.86 |
| IDR | Rp | 17 200 |

### Conversion
```typescript
function convertCurrency(amount, fromCode, toCode): number
// Pivot par EUR : amount / from.rateToEur * to.rateToEur
```

### Formatage
- Séparateur de milliers : `.` (format allemand pour le look premium)
- Position du symbole : `120.000 €` / `$120.000` / `£120.000` / `120.000 Rp`

### Hook : `useDisplayPrice()`
- Récupère `preferred_currency` du profil utilisateur
- Retourne `displayPrice(amount, fromCurrency)` qui convertit et formate
