

## Personnalisation des Templates de Notifications (Admin Desktop)

### Objectif
Ajouter un nouvel onglet "Notifications" dans l'interface d'administration (desktop uniquement) permettant de personnaliser les templates d'emails et de messages WhatsApp pour chaque etape du workflow de transaction. L'admin pourra editer le sujet, le contenu HTML des emails, et le texte des messages WhatsApp, avec un apercu en temps reel.

### Architecture

L'interface reproduira le design de reference fourni :
- **Ligne 1** : Selecteur d'etape du workflow (chips horizontaux)
- **Ligne 2** : Onglets par canal et destinataire (Email Acheteur, Email Vendeur, WhatsApp Acheteur, WhatsApp Vendeur)
- **Zone principale** : Editeur a gauche (sujet + contenu HTML/texte) et Preview live a droite

### Etapes du workflow couvertes

Les etapes correspondent aux templates email existants + les rappels automatiques :

| Etape | Cle | Templates actuels |
|-------|-----|-------------------|
| Match | `matched` | Email existant |
| Visite confirmee | `visit_confirmed` | Email existant |
| Rappel visite | `visit_reminder` | Email existant |
| Offre recue | `offer_made` | Email existant |
| Deal finalise | `deal_finalized` | Email existant |
| Generique | `generic` | Email existant |
| Relance inactivite | `inactivity_12h` | Nouveau |

### Ce qui va changer

**1. Base de donnees -- Nouvelle table `notification_templates`**

```text
notification_templates
  id           UUID (PK, default gen_random_uuid())
  step         TEXT NOT NULL          -- ex: 'matched', 'visit_confirmed'
  channel      TEXT NOT NULL          -- 'email' ou 'whatsapp'
  recipient    TEXT NOT NULL          -- 'buyer' ou 'seller'
  subject      TEXT                   -- sujet email (null pour WhatsApp)
  body         TEXT NOT NULL          -- HTML pour email, texte pour WhatsApp
  variables    JSONB                  -- liste des variables disponibles
  is_active    BOOLEAN DEFAULT true
  updated_by   UUID REFERENCES profiles(id)
  created_at   TIMESTAMPTZ DEFAULT now()
  updated_at   TIMESTAMPTZ DEFAULT now()
  UNIQUE(step, channel, recipient)
```

- RLS : lecture/ecriture reservee aux admins via `has_role(auth.uid(), 'admin')`
- Les templates seront pre-remplis avec les contenus HTML actuels lors de la migration (seed)

**2. Interface Admin -- Nouvel onglet "Notifications"**

Ajout d'un onglet dans `Admin.tsx` entre "Transactions" et "Carte" :

```text
Vue globale | Utilisateurs | Biens | Visites | Transactions | Notifications | Carte
```

**3. Nouveau composant `AdminNotificationsTab.tsx`**

Structure en 3 niveaux :

```text
+------------------------------------------------------------------+
|  [Match] [Visite confirmee] [Rappel visite] [Offre] [Deal] ...   |  <- Chips etape
+------------------------------------------------------------------+
|  Match                                                           |
|  Personnalisez les messages envoyes lors d'un match              |
+------------------------------------------------------------------+
|  [Email Acheteur] [Email Vendeur] | [WhatsApp Acheteur] [WA V.] |  <- Onglets canal
+------------------------------------------------------------------+
|  Template Editor        |  Preview                               |
|  ---------------------- |  ------------------------------------- |
|  Email Subject          |  Subject: Nouveau match - Jean Dupont  |
|  [____________________] |                                        |
|                         |  +-------------------------------+     |
|  Content (HTML)         |  |  Rendu HTML en temps reel     |     |
|  [____________________] |  |                               |     |
|  [____________________] |  |                               |     |
|  [____________________] |  +-------------------------------+     |
|                         |                                        |
|  Variables disponibles: |                                        |
|  {{recipient_name}}     |                                        |
|  {{property_type}}      |                                        |
|  {{property_address}}   |                                        |
+------------------------------------------------------------------+
|                    [Sauvegarder]  [Reinitialiser]                 |
+------------------------------------------------------------------+
```

Fonctionnalites :
- Editeur de sujet (Input) pour les emails
- Editeur de contenu (Textarea) pour le HTML ou le texte WhatsApp
- Panneau de variables cliquables qui s'inserent dans l'editeur
- Preview en temps reel avec remplacement des variables par des valeurs fictives
- Bouton "Reinitialiser" pour revenir au template par defaut
- Sauvegarde via upsert dans `notification_templates`

**4. Modification de la Edge Function `send-email`**

La edge function sera modifiee pour :
1. Verifier d'abord s'il existe un template personnalise dans `notification_templates` pour le `step` + `channel` + `recipient`
2. Si oui, utiliser ce template (sujet + HTML) au lieu du template code en dur
3. Si non, utiliser le template par defaut existant (comportement actuel)
4. Remplacer les variables `{{variable_name}}` dans le template personnalise par les valeurs reelles

**5. Types TypeScript**

Mise a jour de `src/integrations/supabase/types.ts` pour inclure la nouvelle table `notification_templates`.

### Variables disponibles par etape

Chaque etape disposera d'un jeu de variables documentees dans l'interface :

| Variable | Description | Disponible pour |
|----------|-------------|-----------------|
| `{{recipient_name}}` | Prenom du destinataire | Toutes |
| `{{property_type}}` | Type de bien (Villa, Appartement...) | Toutes |
| `{{property_address}}` | Adresse du bien | Toutes |
| `{{property_price}}` | Prix du bien | Toutes |
| `{{property_currency}}` | Devise | Toutes |
| `{{action_url}}` | Lien vers la transaction | Toutes |
| `{{visit_date_formatted}}` | Date de visite formatee | visit_confirmed, visit_reminder |
| `{{reminder_type}}` | Type de rappel (j-1, h-2) | visit_reminder |
| `{{offer_amount}}` | Montant de l'offre | offer_made |
| `{{offer_type}}` | Type d'offre | offer_made |

### Fichiers concernes

1. **Nouvelle migration SQL** -- Creation de la table `notification_templates` + seed des templates par defaut
2. **`src/integrations/supabase/types.ts`** -- Ajout du type `notification_templates`
3. **`src/pages/Admin.tsx`** -- Ajout de l'onglet "Notifications" avec icone `Mail`
4. **`src/components/admin/AdminNotificationsTab.tsx`** -- Nouveau composant principal (editeur + preview + variables)
5. **`supabase/functions/send-email/index.ts`** -- Lecture du template personnalise depuis la BDD avant d'utiliser le template par defaut

### Securite
- La table `notification_templates` sera protegee par RLS : seuls les admins pourront lire et modifier les templates
- Le contenu HTML est rendu dans un iframe sandbox dans la preview pour eviter les attaques XSS
- Les variables sont remplacees cote serveur dans la edge function, donc l'admin ne peut pas injecter de code executable

