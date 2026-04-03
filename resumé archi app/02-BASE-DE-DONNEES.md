# 02 — Base de Données (Supabase PostgreSQL)

## Informations de Connexion

- **Project ID** : `glefjdbehtumybpabkzj`
- **URL** : `https://glefjdbehtumybpabkzj.supabase.co`
- **Anon Key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZWZqZGJlaHR1bXlicGFia3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NDc0NTEsImV4cCI6MjA4NjAyMzQ1MX0.2GQ_ufVzpUJF941Ipq53UOfmdDRx_F4Nh_2wK4ucLxU`

---

## Schéma des Tables (18 tables)

### 1. `profiles`
Profil utilisateur, créé automatiquement via le trigger `handle_new_user()`.

| Colonne | Type | Nullable | Default |
|---|---|---|---|
| id | uuid (PK) | No | — (= auth.users.id) |
| email | text | Yes | — |
| full_name | text | Yes | — |
| first_name | text | Yes | — |
| last_name | text | Yes | — |
| avatar_url | text | Yes | — |
| bio | text | Yes | — |
| birth_date | date | Yes | — |
| nationality | text | Yes | — |
| whatsapp | text | Yes | — |
| company_name | text | Yes | — |
| company_address | text | Yes | — |
| preferred_currency | text | No | 'EUR' |
| preferred_language | text | No | 'fr' |
| notif_push | boolean | No | true |
| notif_email | boolean | No | true |
| notif_whatsapp | boolean | No | true |
| notif_newsletter | boolean | No | true |
| created_at | timestamptz | No | now() |
| updated_at | timestamptz | No | now() |

**RLS** :
- SELECT : tous les `authenticated` peuvent lire tous les profils
- INSERT : `auth.uid() = id`
- UPDATE : `auth.uid() = id`

---

### 2. `user_roles`
Rôles des utilisateurs (table séparée pour éviter l'escalade de privilèges).

| Colonne | Type | Nullable | Default |
|---|---|---|---|
| id | uuid (PK) | No | gen_random_uuid() |
| user_id | uuid | No | — |
| role | app_role (enum) | No | — |
| created_at | timestamptz | No | now() |

**Contrainte UNIQUE** : `(user_id, role)`

**Enum `app_role`** : `'user'` | `'owner'` | `'admin'` | `'notaire'` | `'agent'`

**RLS** :
- SELECT : `auth.uid() = user_id` OU `has_role(auth.uid(), 'admin')`
- INSERT : `auth.uid() = user_id`
- ALL (admin) : `has_role(auth.uid(), 'admin')`

---

### 3. `properties`
Biens immobiliers publiés par les propriétaires.

| Colonne | Type | Nullable | Default |
|---|---|---|---|
| id | uuid (PK) | No | gen_random_uuid() |
| owner_id | uuid | No | — |
| type | property_type (enum) | No | — |
| operations | property_operation (enum) | No | 'vente' |
| droit | property_droit (enum) | Yes | — |
| status | property_status (enum) | No | 'available' |
| adresse | text | No | — |
| prix | numeric | No | — |
| prix_currency | text | No | 'EUR' |
| surface | numeric | Yes | — |
| chambres | integer | No | 0 |
| salles_bain | integer | No | 0 |
| description | text | Yes | — |
| equipements | jsonb | Yes | '[]' |
| secteur | text | Yes | — |
| latitude | double precision | Yes | — |
| longitude | double precision | Yes | — |
| is_published | boolean | No | false |
| created_at | timestamptz | No | now() |
| updated_at | timestamptz | No | now() |

**Enum `property_type`** : `villa`, `appartement`, `terrain`, `studio`, `maison`, `bureau`, `commerce`, `entrepot`, `commercial`, `construction`, `maison_a_renover`, `colocation_longue`, `colocation_courte`, `hebergement_service`, `hebergement_animaux`, `guesthouse`

**Enum `property_operation`** : `vente`, `location`, `achat`, `leasehold`, `freehold`, `home_exchange`

**Enum `property_droit`** : `titre_foncier`, `bail`, `deliberation`, `freehold`, `leasehold`

**Enum `property_status`** : `available`, `sold`, `rented`, `draft`

**RLS** :
- SELECT : `is_published = true AND status = 'available'` (public) OU `owner_id = auth.uid()` OU admin
- INSERT/UPDATE/DELETE : `owner_id = auth.uid()` OU admin

---

### 4. `property_media`
Photos et vidéos associées aux biens.

| Colonne | Type | Default |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| property_id | uuid (FK → properties) | — |
| url | text | — |
| type | media_type (enum: 'image' \| 'video') | 'image' |
| is_primary | boolean | false |
| position | integer | 0 |
| created_at | timestamptz | now() |

---

### 5. `swipes`
Historique des swipes (left = passe, right = match).

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| user_id | uuid |
| property_id | uuid (FK → properties) |
| direction | swipe_direction ('left' \| 'right') |
| created_at | timestamptz |

---

### 6. `matches`
Résultat d'un swipe right.

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| user_id | uuid (acheteur) |
| owner_id | uuid (propriétaire) |
| property_id | uuid (FK → properties) |
| created_at | timestamptz |

---

### 7. `favorites`
Biens sauvegardés par les acheteurs.

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| user_id | uuid |
| property_id | uuid (FK → properties) |
| created_at | timestamptz |

---

### 8. `conversations`
Canal de discussion entre acheteur et propriétaire pour un bien donné.

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| buyer_id | uuid |
| owner_id | uuid |
| property_id | uuid (FK → properties) |
| match_id | uuid (FK → matches, nullable) |
| last_message_at | timestamptz |
| created_at | timestamptz |

---

### 9. `messages`
Messages dans les conversations classiques (hors workflow de transaction).

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| conversation_id | uuid (FK → conversations) |
| sender_id | uuid |
| content | text |
| is_read | boolean (default false) |
| created_at | timestamptz |

**Realtime** : Subscription `postgres_changes` (INSERT) active côté client.

---

### 10. `visits`
Demandes de visite directes (hors workflow).

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| property_id | uuid (FK → properties) |
| buyer_id | uuid |
| owner_id | uuid |
| proposed_date | timestamptz |
| message | text (nullable) |
| status | visit_status ('pending' \| 'confirmed' \| 'cancelled' \| 'completed') |
| cancel_reason | text (nullable) |
| created_at / updated_at | timestamptz |

---

### 11. `buyer_preferences`
Préférences de recherche de l'acheteur (wizard en 5 étapes).

| Colonne | Type | Description |
|---|---|---|
| id | uuid (PK) | — |
| user_id | uuid | — |
| preferred_types | text[] | Types de bien recherchés |
| preferred_operation | text | Freehold/Leasehold/Location/Home Exchange |
| preferred_chambres | integer[] | Nombres de chambres souhaités |
| preferred_salles_bain | integer[] | Nombres de SdB souhaités |
| preferred_sectors | text[] | Secteurs (quartiers de Bali) |
| custom_sector | text | Secteur personnalisé |
| budget_min / budget_max | numeric | Fourchette budget |
| budget_currency | text | 'EUR' par défaut |
| intention | text | Intention d'achat |
| cash_available | text | Disponibilité cash |
| payment_knowledge | text | Connaissance modes de paiement |
| visit_availability | text[] | Disponibilités pour les visites |
| wants_advisor | boolean | Souhaite être contacté par un conseiller |
| receive_alerts | boolean | Recevoir des alertes |
| is_complete | boolean | Wizard terminé |
| preferred_status | text | Statut préféré |

---

### 12-18. Tables du Workflow de Transaction

#### 12. `wf_transactions`
Table centrale du workflow. Machine à états de 14 statuts.

| Colonne | Type | Description |
|---|---|---|
| id | uuid (PK) | — |
| property_id | uuid (FK → properties) | — |
| buyer_id | uuid | — |
| seller_id | uuid | — |
| status | transaction_status (enum) | Statut actuel |
| previous_status | transaction_status | Statut précédent |
| matched_at | timestamptz | Date du match |
| visit_requested_at | timestamptz | — |
| visit_proposed_dates | jsonb | Dates proposées par le vendeur |
| visit_confirmed_date | timestamptz | Date confirmée |
| visit_confirmed_by_buyer | boolean | — |
| visit_confirmed_by_seller | boolean | — |
| visit_refusal_reason | text | — |
| visit_refusal_details | text | — |
| visit_completed_at | timestamptz | — |
| buyer_intention | text | 'continue' \| 'offer' \| 'stop' |
| rejection_reason / rejection_details | text | — |
| offer_type | text | Type d'offre |
| offer_amount | numeric | Montant de l'offre |
| offer_details | text | — |
| buyer_validated / seller_validated | boolean | Validation des documents |
| buyer_validated_at / seller_validated_at | timestamptz | — |
| deal_finalized_at | timestamptz | — |
| buyer_no_show / seller_no_show | boolean | — |
| deposit_paid | boolean | — |
| deposit_amount | numeric | — |

**Enum `transaction_status`** :
```
matched → visit_requested → visit_proposed → visit_confirmed → visit_completed
                          ↘ visit_cancelled ↗    ↘ visit_rescheduled ↗
visit_completed → intention_expressed → offer_made → documents_generated → in_validation → deal_finalized → archived
                                     ↘ deal_cancelled → archived
```

#### 13. `wf_transaction_logs`
Journal immuable de chaque action sur une transaction.

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| transaction_id | uuid (FK) |
| action | text |
| actor_id | uuid |
| actor_role | text |
| previous_status / new_status | transaction_status |
| details | jsonb |
| created_at | timestamptz |

#### 14. `wf_messages`
Messages sécurisés dans le contexte d'une transaction (avec détection anti-fraude).

| Colonne | Type | Description |
|---|---|---|
| id | uuid (PK) | — |
| transaction_id | uuid (FK) | — |
| sender_id / receiver_id | uuid | — |
| content | text | — |
| contains_phone_number | boolean | Détecté par regex côté client |
| flagged_suspicious | boolean | Mots-clés suspects détectés |
| read_at | timestamptz | — |
| created_at | timestamptz | — |

#### 15. `wf_documents`
Documents auto-générés (LOI, Term Sheet, Contrats).

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| transaction_id | uuid (FK) |
| type | text ('loi' \| 'term_sheet' \| 'contrat_vente' \| 'contrat_location') |
| title | text |
| content | jsonb (contenu structuré du document) |
| pdf_url | text (nullable) |
| buyer_validated / seller_validated | boolean |
| buyer_validated_at / seller_validated_at | timestamptz |
| version | integer |
| is_final | boolean |

#### 16. `wf_notifications`
Notifications in-app.

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| user_id | uuid |
| transaction_id | uuid (FK, nullable) |
| type | text |
| title | text |
| message | text |
| action_url | text (nullable) |
| data | jsonb (nullable) |
| read_at | timestamptz (nullable) |
| email_sent | boolean |
| email_sent_at | timestamptz |
| push_sent | boolean |
| push_sent_at | timestamptz |
| created_at | timestamptz |

#### 17. `wf_reminders`
Rappels planifiés (J-1, H-2, inactivité 12h).

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| transaction_id | uuid (FK) |
| user_id | uuid |
| reminder_type | text ('visit_reminder' \| 'document_pending' \| 'offer_follow_up' \| 'score_update' \| 'inactivity_12h') |
| scheduled_at | timestamptz |
| sent | boolean |
| sent_at | timestamptz |
| metadata | jsonb |

#### 18. `wf_user_scores`
Score de confiance et certification des utilisateurs.

| Colonne | Type | Description |
|---|---|---|
| user_id | uuid (PK) | — |
| score | integer | 0-100, default 50 |
| total_transactions | integer | — |
| completed_transactions | integer | — |
| cancelled_transactions | integer | — |
| no_shows | integer | — |
| visit_refusals | integer | — |
| certified | boolean | true si deal finalisé |
| certified_at | timestamptz | — |
| vip_access | boolean | — |
| last_calculated_at | timestamptz | — |

### 19. `notification_templates`
Templates personnalisables par les admins pour les emails/notifications.

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| step | text (ex: 'matched', 'visit_confirmed', etc.) |
| channel | text ('email' \| 'whatsapp') |
| recipient | text ('buyer' \| 'seller') |
| subject | text (nullable) |
| body | text |
| variables | jsonb |
| is_active | boolean |
| updated_by | uuid (FK → profiles) |

### 20. `identity_verifications`
Vérification KYC des utilisateurs.

| Colonne | Type |
|---|---|
| id | uuid (PK) |
| user_id | uuid (UNIQUE) |
| document_url | text |
| document_type | text (default 'id_card') |
| status | identity_verification_status ('pending' \| 'approved' \| 'rejected') |
| rejection_reason | text (nullable) |
| reviewed_at | timestamptz |
| reviewed_by | uuid |
| submitted_at | timestamptz |

---

## Fonctions PostgreSQL

### `has_role(_user_id uuid, _role app_role) → boolean`
- `SECURITY DEFINER` pour éviter la récursion RLS
- Vérifie si un utilisateur a un rôle donné
- Utilisée dans toutes les policies admin

### `handle_new_user() → trigger`
- Trigger sur `auth.users` (AFTER INSERT)
- Crée automatiquement une entrée dans `profiles`
- Copie email et full_name depuis `raw_user_meta_data`

### `update_updated_at_column() → trigger`
- Met à jour `updated_at` à chaque UPDATE

### `wf_calculate_user_score(p_user_id uuid) → integer`
- Calcule le score de confiance : base 50 + 10/deal finalisé - 5/annulé - 10/no-show - 5/refus visite
- Clamp entre 0 et 100
- UPSERT dans `wf_user_scores`

---

## Storage Buckets

| Bucket | Public | Usage |
|---|---|---|
| `property-media` | ✅ Oui | Photos et vidéos des biens |
| `avatars` | ✅ Oui | Photos de profil |
| `identity-documents` | ❌ Non | Documents d'identité (KYC) |

Pour `identity-documents` :
- Upload : `auth.uid() = owner` du fichier (path: `{user_id}/{filename}`)
- Lecture : `auth.uid() = owner` OU admin
- Signed URLs utilisées côté admin pour visualiser les documents
