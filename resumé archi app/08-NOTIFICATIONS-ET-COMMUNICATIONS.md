# 08 — Notifications & Communications

## Architecture des Notifications

```
┌──────────────────────────────────────────────────────┐
│                  ÉVÉNEMENT MÉTIER                     │
│  (match, visite confirmée, offre, deal finalisé...)  │
└────────┬─────────────────────────┬───────────────────┘
         │                         │
    ┌────▼──────┐            ┌────▼──────────┐
    │ In-App    │            │ Email         │
    │ (DB)      │            │ (Resend)      │
    └────┬──────┘            └────┬──────────┘
         │                         │
    ┌────▼──────┐            ┌────▼──────────┐
    │wf_notifs  │            │send-email     │
    │ table     │            │Edge Function  │
    └────┬──────┘            └───────────────┘
         │
    ┌────▼──────┐    ┌───────────────────────┐
    │Notification│    │ Push (préparé, pas    │
    │Bell widget│    │ encore intégré FCM)   │
    └───────────┘    └───────────────────────┘
```

---

## Notifications In-App

### Table `wf_notifications`
Chaque notification contient :
- `user_id` : destinataire
- `type` : catégorie (matched, visit_confirmed, security_warning, etc.)
- `title` / `message` : contenu affiché
- `action_url` : lien de redirection (ex: `/transaction/{id}`)
- `read_at` : null si non lue
- `email_sent` / `push_sent` : statut de livraison multi-canal

### Hook : `useNotifications()`

```typescript
// Récupère les 50 dernières notifications
const notifications = useQuery({
  queryKey: ['notifications', user?.id],
  queryFn: () => supabase.from('wf_notifications').select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50),
  refetchInterval: 15000,  // Polling toutes les 15 secondes
});

// Compte les non-lues
const unreadCount = useQuery({
  queryKey: ['notifications-unread-count', user?.id],
  queryFn: () => supabase.from('wf_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null),
  refetchInterval: 15000,
});
```

### Son de Notification

```typescript
function playNotificationSound() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(880, ctx.currentTime);      // La5
  osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1); // Do#6
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}
```

- Joué automatiquement quand `unreadCount` augmente
- Utilise le `prevUnreadRef` pour comparer avec le compteur précédent

### NotificationBell (`src/components/notifications/NotificationBell.tsx`)

- Icône cloche avec badge de compteur (max "99+")
- Popover affichant les 5 dernières notifications
- Clic sur une notification :
  1. Marque comme lue (`markAsRead.mutate`)
  2. Navigue vers `action_url` si présente
- Bouton footer → page `/notifications` complète

---

## Messagerie

### Deux Systèmes de Messages

#### 1. Messages Classiques (`messages` table)
- Utilisés dans les conversations entre acheteur et propriétaire
- **Realtime** via `supabase.channel().on('postgres_changes', { event: 'INSERT', table: 'messages' })`
- Auto-marquage comme lus quand le destinataire ouvre la conversation
- Pas de détection anti-fraude

#### 2. Messages Sécurisés (`wf_messages` table)
- Utilisés dans le contexte des transactions (workflow)
- **Détection anti-fraude** via `MessageDetectionService`
- Polling toutes les 5 secondes (pas de Realtime)
- Blocage des numéros de téléphone
- Flagging des comportements suspects

### Hook : `useMessages(conversationId)`
- Query avec Realtime subscription
- Auto-mark as read pour les messages non lus du destinataire
- Mutation `sendMessage` avec mise à jour du `last_message_at` de la conversation

### Hook : `useConversations()`
- Liste les conversations avec `properties` (jointure)
- Récupère les profils des interlocuteurs (otherProfile)
- Trié par `last_message_at` desc

---

## Emails Transactionnels

### Provider : Resend
- API Key stockée dans les secrets Supabase (`RESEND_API_KEY`)
- Expéditeur : `SOMA <notifications@app.somagate.com>`

### Templates Personnalisables

Les admins peuvent créer/modifier des templates dans `notification_templates` via l'interface admin.

**Priorité** :
1. Template personnalisé en base (si `is_active = true`)
2. Template hardcodé par défaut

**Variables dynamiques** : `{{recipient_name}}`, `{{property_type}}`, `{{property_address}}`, `{{offer_amount}}`, etc.

### Événements Déclencheurs

| Événement | Template | Destinataires |
|---|---|---|
| Match créé | `matched` | Acheteur + Vendeur |
| Visite confirmée | `visit_confirmed` | Acheteur + Vendeur |
| Rappel visite (J-1/H-2) | `visit_reminder` | Acheteur + Vendeur |
| Offre reçue | `offer_made` | Vendeur |
| Deal finalisé | `deal_finalized` | Acheteur + Vendeur |

---

## Push Notifications (État Actuel)

### Implémenté
- Edge Function `send-push` qui crée une notification in-app
- Flag `push_sent = true` + `push_sent_at`
- Log dans la console

### Non Implémenté (TODO)
- Intégration Firebase Cloud Messaging (FCM) ou OneSignal
- Service Worker pour les notifications push web
- Token de device registration
- Envoi via FCM API

### Préférences Utilisateur
Gérées dans le profil (`profiles` table) :
- `notif_push` : Notifications push (on/off)
- `notif_email` : Emails (on/off)
- `notif_whatsapp` : WhatsApp (on/off)
- `notif_newsletter` : Newsletter (on/off)

Composant : `NotificationSettings.tsx` dans les paramètres du compte.

---

## Messages de Sécurité Anti-Arnaque

Affichés systématiquement sur l'interface de transaction :

```typescript
const SECURITY_MESSAGES = {
  anti_scam: "De nombreuses escroqueries existent dans la location et l'immobilier...",
  no_phone_exchange: "SomaGate a été conçu pour centraliser et conserver l'ensemble des échanges...",
  no_show_warning: "Les biens proposés sur SomaGate sont publiés par des propriétaires... Les rendez-vous non honorés impactent négativement votre score de confiance.",
  visit_refusal_warning: "Les refus de visites peuvent diminuer votre score SomaGate.",
  litigation_protection: "En cas de litige ou de doute, SOMA GATE conserve l'historique complet du projet.",
};
```
