

# Analyse des ecarts -- Specification cliente vs. Implementation actuelle

## Ce qui est DEJA IMPLEMENTE

| Fonctionnalite | Statut | Details |
|---|---|---|
| Machine a etats (14 statuts) | OK | `TransactionStatus` avec `VALID_TRANSITIONS` |
| Match et notification des deux parties | OK | `WorkflowService.createTransaction()` |
| Demande de visite (acheteur) | OK | `RequestVisitCard` |
| Proposition de 3 dates (vendeur) | OK | `ProposeDatesCard` |
| Confirmation croisee de visite | OK | `confirmVisit` avec double validation |
| Validation post-visite (effectuee/annulee) | OK | `CompleteVisitCard` |
| Detection no-show + penalite score | OK | `completeVisit` + `wf_calculate_user_score` |
| Intention formelle (continuer/offre/arreter) | PARTIEL | Les 3 choix existent mais les motifs d'arret sont un simple champ texte libre |
| Formulaire d'offre (prix affiche, negocie, upfront, monthly) | OK | `OfferForm` avec 4 types |
| Generation automatique de documents (LOI, Term Sheet, Contrat) | OK | `DocumentGenerationService` |
| Validation croisee des documents | OK | `validateDocument` buyer/seller |
| Finalisation du deal avec double validation | OK | `DealFinalization` |
| Certification utilisateur apres deal | OK | `CertifiedBadge` + `wf_user_scores.certified` |
| Questionnaire feedback post-deal | OK | `FeedbackQuestionnaire` (5 questions + commentaire) |
| Messagerie securisee avec detection | OK | `MessageDetectionService` |
| Blocage numeros de telephone | OK | `detectPhoneNumber` |
| Detection mots-cles suspects | OK | `SUSPICIOUS_KEYWORDS` |
| Banniere de securite anti-fraude | OK | `SecurityBanner` (5 messages) |
| Notifications in-app | OK | `wf_notifications` + `NotificationBell` |
| Systeme de relance automatique | OK | `wf_reminders` + edge function `process-reminders` |
| Score de confiance (0-100) | OK | `wf_calculate_user_score` |
| Timeline de progression | OK | `TransactionTimeline` |
| Logs horodates immuables | OK | `wf_transaction_logs` |
| Acces VIP pour certifies | OK | `vip_access` dans `wf_user_scores` |

---

## Ce qui MANQUE ou est INCOMPLET

### 1. Motifs d'arret structures (Intention "Stop")
**Priorite : Haute**

La spec definit 8 motifs precis de refus apres visite. Actuellement, l'interface propose un simple `Textarea` libre.

Motifs requis :
- Bien non conforme aux photos
- Pas de coup de coeur
- Emplacement non adapte
- Prix ou conditions non adaptes
- Etat general non conforme
- Projet modifie
- Autre bien trouve
- Autre (champ libre)

**Travail** : Modifier `IntentionCard` dans `VisitManagement.tsx` pour afficher une liste de motifs a cocher + champ "Autre".

---

### 2. Motifs de refus de visite par le vendeur
**Priorite : Haute**

La spec prevoit 3 raisons de refus de visite cote vendeur :
- Bien non disponible (entrainant suspension/suppression)
- Bien occupe
- Profil insuffisamment qualifie

Actuellement, `refuseVisit` dans `WorkflowService` existe mais l'interface ne propose pas au vendeur de refuser avec ces motifs structures. Le `ProposeDatesCard` ne montre qu'un formulaire de dates sans option de refus.

**Travail** : Ajouter un bouton "Refuser la visite" dans la vue vendeur au statut `visit_requested`, avec selection du motif structure + banniere "Les refus de visites peuvent diminuer votre score SomaGate."

---

### 3. Relance automatique apres 12h
**Priorite : Moyenne**

Le systeme de relance (`wf_reminders` + `process-reminders`) existe mais il n'y a pas de logique qui cree automatiquement un rappel si une partie ne repond pas dans les 12h.

**Travail** : Ajouter un trigger ou une edge function CRON qui detecte les transactions inactives depuis 12h aux statuts `visit_requested`, `visit_proposed`, `documents_generated` et cree des rappels automatiques.

---

### 4. Rappels de visite J-1 et H-2
**Priorite : Moyenne**

La spec exige des notifications de rappel a J-1 et H-2 avant la visite confirmee. L'infrastructure (`wf_reminders`) existe mais aucune logique ne cree ces rappels au moment de la confirmation de visite.

**Travail** : Dans `WorkflowService.confirmVisit()`, quand les deux parties confirment, creer 2 rappels automatiques (J-1 et H-2) dans `wf_reminders` pour les deux participants.

---

### 5. Confirmation en 1 clic (recap visite par push/email)
**Priorite : Moyenne**

La spec prevoit un envoi automatique (push + email) avec :
- Recapitulatif de l'annonce
- Date et heure de visite
- Confirmation en 1 clic

Actuellement, seules les notifications in-app existent. Il n'y a pas d'email recapitulatif ni de deep-link "confirmer en 1 clic".

**Travail** : Ajouter une notification enrichie avec les details du bien lors de la confirmation de visite. L'envoi d'email est desactive par choix, mais la notification push via `send-push` pourrait etre enrichie. Prevoir un `action_url` pointant vers la page de transaction avec un hash d'action.

---

### 6. Visite reportee (statut `visit_rescheduled`)
**Priorite : Moyenne**

Le statut `visit_rescheduled` existe dans la state machine mais aucune interface ne permet de declencher un report. Apres la visite, seules les options "effectuee" et "absent" sont proposees. La spec mentionne "Visite reportee" comme action possible.

**Travail** : Ajouter un bouton "Reporter la visite" dans `CompleteVisitCard` ou dans la vue `visit_confirmed`. Ajouter la logique dans `WorkflowService` pour gerer ce cas et reproposer des dates.

---

### 7. Archivage et telechargement des preuves
**Priorite : Basse**

La spec prevoit :
- Archivage automatique de tous les elements (messages, documents, visites, intentions, validations, contrats)
- Telechargement possible
- Historique non modifiable
- Message : "En cas de litige, SomaGate conserve l'historique complet du projet."

Actuellement, les logs sont bien conserves dans `wf_transaction_logs` et les documents dans `wf_documents`, mais il n'y a pas de fonctionnalite de telechargement/export. Le message de securite `litigation_protection` existe dans `SECURITY_MESSAGES` mais n'est pas affiche sur la page Transaction.

**Travail** : 
- Ajouter un bouton "Telecharger le dossier" sur la page Transaction (statuts archives/finalises)
- Afficher la banniere `litigation_protection` dans l'onglet Documents
- Generer un PDF recapitulatif (ou ZIP) avec tous les elements

---

### 8. Email automatique de certification
**Priorite : Basse**

La spec mentionne un "email automatique de certification envoye" apres l'obtention du badge. L'envoi d'emails transactionnels est desactive par choix de la cliente, mais cela pourrait etre implemente plus tard avec Resend.

**Travail** : A prevoir dans une phase ulterieure si la cliente active les emails.

---

### 9. Caution de visite (10 euros)
**Priorite : Future**

La spec mentionne explicitement : "Prevoir futur depot de caution de visite : 10 euros". Les champs `deposit_paid` et `deposit_amount` existent deja dans `wf_transactions`. L'integration Stripe n'est pas encore en place.

**Travail** : A prevoir dans une phase ulterieure avec l'integration Stripe.

---

### 10. Gestion paiements futurs
**Priorite : Future**

La spec mentionne : "Prevoir future gestion paiements (caution / transactions)". Infrastructure DB en place (`deposit_paid`, `deposit_amount`), pas d'integration de paiement.

**Travail** : Phase ulterieure avec Stripe.

---

## Resume par priorite

### A faire maintenant (priorite haute)
1. **Motifs d'arret structures** - 8 raisons predefinies dans `IntentionCard`
2. **Motifs de refus de visite** - 3 raisons + UI pour le vendeur

### A faire ensuite (priorite moyenne)
3. **Relance auto 12h** - Logic CRON pour detecter l'inactivite
4. **Rappels J-1 / H-2** - Creation auto dans `confirmVisit`
5. **Notification enrichie de confirmation** - Recap bien + date + 1 clic
6. **Report de visite** - Interface et logique pour `visit_rescheduled`

### A prevoir plus tard (priorite basse/future)
7. **Archivage et export** - Bouton telecharger + banniere litigation
8. **Email de certification** - Via Resend si active
9. **Caution de visite 10 euros** - Integration Stripe
10. **Gestion paiements** - Integration Stripe

---

## Details techniques

### Fichiers impactes (priorite haute)
- `src/components/workflow/VisitManagement.tsx` : Ajouter les motifs d'arret structures dans `IntentionCard`, ajouter le refus de visite dans la vue vendeur `visit_requested`
- `src/services/workflowService.ts` : Ajouter les rappels J-1/H-2 dans `confirmVisit`, enrichir `refuseVisit`

### Fichiers impactes (priorite moyenne)
- `supabase/functions/process-reminders/index.ts` : Ajouter logique de detection d'inactivite 12h
- `src/pages/Transaction.tsx` : Afficher la banniere `litigation_protection` dans l'onglet Documents
- `src/components/workflow/VisitManagement.tsx` : Ajouter le bouton "Reporter"

### Pas de changement de schema DB necessaire
Toutes les colonnes necessaires existent deja (`visit_refusal_reason`, `visit_refusal_details`, `rejection_reason`, `rejection_details`, `deposit_paid`, `deposit_amount`). Les tables `wf_reminders` et `wf_user_scores` sont en place.

