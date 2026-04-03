# 06 — Edge Functions (Supabase Deno)

## Configuration

Fichier : `supabase/config.toml`

```toml
project_id = "glefjdbehtumybpabkzj"

[functions.create-test-users]
verify_jwt = false

[functions.process-reminders]
verify_jwt = false

[functions.send-push]
verify_jwt = false

[functions.send-email]
verify_jwt = false

[functions.chatbot]
verify_jwt = false
```

> **Note** : Toutes les fonctions ont `verify_jwt = false` pour simplifier les appels (certaines sont appelées par des CRON ou entre elles). La sécurité est gérée au niveau de chaque fonction.

---

## Secrets Disponibles

| Secret | Usage |
|---|---|
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_ANON_KEY` | Clé publique |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé admin (bypass RLS) |
| `SUPABASE_PUBLISHABLE_KEY` | = Anon key |
| `SUPABASE_DB_URL` | URL directe PostgreSQL |
| `RESEND_API_KEY` | API Resend pour l'envoi d'emails |
| `LOVABLE_API_KEY` | API Lovable AI Gateway |

---

## 1. `chatbot` — Assistant IA Streaming

**Fichier** : `supabase/functions/chatbot/index.ts`

### Fonctionnement
- Reçoit un tableau de `messages` (historique de conversation)
- Appelle `https://ai.gateway.lovable.dev/v1/chat/completions` avec :
  - Modèle : `google/gemini-3-flash-preview`
  - Mode : streaming (SSE)
  - System prompt personnalisé pour l'immobilier à Bali
- Proxy transparent du stream SSE vers le client

### System Prompt
```
Tu es l'assistant IA de Soma Gate, la première plateforme d'intelligence immobilière à Bali.
- Questions immobilier Bali (prix, quartiers, tendances)
- Explication Freehold vs Leasehold
- Navigation dans l'application
- Transactions et sécurité
- Conseils d'investissement
```

### Gestion d'Erreurs
- `429` : Rate limit → "Trop de requêtes"
- `402` : Crédits insuffisants
- `500` : Erreur générique

### Côté Client (`ChatBot.tsx`)
- Widget flottant (FAB) en bas à droite
- Streaming SSE : lecture du body via `ReadableStream` + `TextDecoder`
- Parse les lignes `data: {...}` et extrait `choices[0].delta.content`
- Questions pré-remplies : "Freehold vs Leasehold ?", "Prix à Canggu ?", "Comment matcher ?"

---

## 2. `send-email` — Envoi d'Emails (Resend)

**Fichier** : `supabase/functions/send-email/index.ts`

### Fonctionnement

1. Reçoit `{ to, template, data, recipient_role }`
2. **Tente d'abord** de récupérer un template personnalisé depuis `notification_templates` :
   - Filtre par `step = template`, `channel = 'email'`, `recipient = recipient_role`, `is_active = true`
   - Si trouvé : remplace les variables `{{variable}}` dans le body
3. **Sinon** : utilise le template hardcodé correspondant
4. Envoie via **Resend** (`resend.emails.send()`)
5. Optionnellement met à jour `wf_notifications.email_sent`

### Templates Hardcodés (6)

| Template | Sujet | Gradient |
|---|---|---|
| `matched` | 🎉 Nouveau match | purple |
| `visit_confirmed` | 📅 Visite confirmée | green |
| `visit_reminder` | ⏰ Rappel visite | pink |
| `offer_made` | 💰 Offre reçue | orange |
| `deal_finalized` | 🎊 Deal finalisé | purple |
| `generic` | (dynamique) | purple |

### Expéditeur
```
SOMA <notifications@app.somagate.com>
```

---

## 3. `send-push` — Notifications Push (Préparé)

**Fichier** : `supabase/functions/send-push/index.ts`

### Fonctionnement Actuel
- Reçoit `{ user_id, title, message, action_url, transaction_id, data }`
- Crée une notification in-app dans `wf_notifications` (type: 'push')
- **Log seulement** : "Real push delivery will be enabled with FCM/OneSignal integration"

### Intégration Future
Le code est préparé pour intégrer :
- **Firebase Cloud Messaging (FCM)** pour les push natifs
- **OneSignal** comme alternative
- Le `TODO` est documenté dans le code

---

## 4. `process-reminders` — Traitement des Rappels (CRON)

**Fichier** : `supabase/functions/process-reminders/index.ts`

### Fonctionnement

#### Phase 1 : Traiter les rappels planifiés
1. Récupère les rappels non envoyés dont `scheduled_at ≤ now()`
2. Pour chaque rappel, selon le type :
   - `visit_reminder` : "Votre visite est prévue demain/dans 2h"
   - `document_pending` : "Des documents attendent votre validation"
   - `offer_follow_up` : "Une offre attend une réponse"
   - `score_update` : "Votre score a été recalculé"
   - `inactivity_12h` : "Action requise — transaction en attente depuis 12h"
3. Crée une notification in-app
4. Pour les rappels de visite : **envoie un email** en appelant la fonction `send-email`
5. Marque le rappel comme `sent = true`

#### Phase 2 : Détecter l'inactivité
1. Cherche les transactions stagnantes (>12h sans mise à jour)
2. Statuts ciblés : `visit_requested`, `visit_proposed`, `documents_generated`
3. Identifie qui doit agir :
   - `visit_requested` → le vendeur doit proposer des dates
   - `visit_proposed` → l'acheteur doit confirmer
   - `documents_generated` → l'acheteur doit valider
4. Vérifie qu'un rappel d'inactivité n'a pas déjà été envoyé dans les 24h
5. Crée un rappel immédiat si nécessaire

### Déclenchement
- Doit être appelé via un **CRON job** (Supabase cron ou webhook externe)
- Pas de fréquence codée — recommandé : toutes les 15 minutes

---

## 5. `create-test-users` — Création d'Utilisateurs de Test

**Fichier** : `supabase/functions/create-test-users/index.ts`
- Utilisé pour le développement et les tests
- Crée des utilisateurs avec des rôles prédéfinis

---

## 6. `seed-property-media` — Seed de Médias

**Fichier** : `supabase/functions/seed-property-media/index.ts`
- Peuple les médias des propriétés avec des images de test
