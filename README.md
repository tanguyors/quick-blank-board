# SOMA GATE — Intelligence Immobiliere

## Parcours Complet & Fonctionnalites a Tester

> **Plateforme d'intelligence immobiliere dediee au marche indonesien (Bali)**
> Swipe, Match & Securisez votre prochain bien immobilier.

---

## Sommaire

1. [Match & Mise en relation](#1-match--mise-en-relation)
2. [Demande / Proposition de visite](#2-demande--proposition-de-visite)
3. [Qualification du projet & Confirmation de visite](#3-qualification-du-projet--confirmation-de-visite)
4. [Visite effectuee](#4-visite-effectuee)
5. [Intention formelle](#5-intention-formelle)
6. [Generation automatique de documents](#6-generation-automatique-de-documents)
7. [Validations successives](#7-validations-successives)
8. [Deal finalise](#8-deal-finalise)
9. [Statut client certifie](#9-statut-client-certifie)
10. [Archivage & Conservation des preuves](#10-archivage--conservation-des-preuves)
11. [Message central de vigilance & securite](#11-message-central-de-vigilance--securite)
12. [Socle technique](#12-socle-technique)

---

### Principe de chaque etape

Chaque etape du parcours genere systematiquement :

- Un **statut** que les deux parties recoivent au fur et a mesure
- Une **notification** in-app + relance automatique
- Un **email** transactionnel
- Une **trace horodatee** immutable dans les logs

Le **message de vigilance et de securite** est affiche a chaque etape.

---

### Parties prenantes

| Code | Role | Exemples |
|------|------|----------|
| **Partie A** | Loueur, acheteur, demandeur | L'utilisateur qui explore et swipe les biens |
| **Partie B** | Vendeur, proprietaire, promoteur | Le proprietaire du bien immobilier |

---

## 1. Match & Mise en relation

### Action Partie A (Acheteur)

- L'utilisateur swipe un bien vers la droite (coup de coeur)
- Le systeme cree automatiquement :
  - Le **match** entre l'acheteur et le proprietaire
  - La **conversation** entre les deux parties
  - La **transaction workflow** (statut : `matched`)
- Message affiche a la Partie A :
  > Nous prevenons le proprietaire de votre coup de coeur pour son bien via Soma Gate.
- Deux boutons d'action proposes :
  - **Envoyer un message**
  - **Prevoir une visite**

### Notification Partie B (Proprietaire)

- Le proprietaire recoit une notification :
  > Bonne nouvelle ! Votre maison vient de recevoir le coup de coeur qu'elle merite.
- Deux boutons d'action proposes :
  - **Envoyer un message**
  - **Proposer une visite**

### Relance automatique

- Si aucune reponse de la Partie A ou B dans les **12 heures**, une relance automatique est envoyee a la partie qui n'a pas repondu.

### Conversation securisee

- Ouverture de la bulle de conversation entre les 2 parties si le client clique sur "Envoyer un message"
- **Blocage** de tout echange de numero de telephone (detection regex, message bloque)
- **Detection des conversations suspectes** (mots-cles : whatsapp, telegram, virement, bitcoin, hors plateforme, etc.)
- Message automatique en cas de detection :
  > Soma Gate a ete concue pour centraliser et conserver l'ensemble des echanges lies a votre projet immobilier. Toutes les conversations menees sur la plateforme sont enregistrees et permettent de retracer precisement chaque etape. Le secteur immobilier comporte de nombreuses escroqueries, notamment dans la location et les transactions a distance. En echangeant en dehors de SomaGate, vous renoncez volontairement aux avantages de la plateforme ainsi qu'a toute protection liee a la centralisation des preuves.
- Programmation de messages automatiques en cas de non-reponse de la Partie B

### Preuves conservees

- Date du match
- Bien concerne
- Echanges
- Identite des comptes

---

## 2. Demande / Proposition de visite

### Action Partie B (Proprietaire)

Pour prevoir une visite, le proprietaire doit **indiquer 3 disponibilites dans un calendrier par ordre de preference**.

### Refus de visite

Si le proprietaire refuse la visite, il doit indiquer la raison :

| Motif de refus | Action associee |
|----------------|-----------------|
| Le bien n'est plus disponible | Option : suspendre l'annonce (choisir jusqu'a quand) ou la supprimer |
| La maison est actuellement occupee, j'attends des retours | — |
| Votre profil n'est pas assez qualifie | — |

Message affiche au proprietaire :
> Les refus de visites peuvent diminuer votre score Soma Gate.

### Message d'alerte (affiche aux deux parties)

> Les biens proposes sur SomaGate sont publies par des proprietaires ou des interlocuteurs pour qui la vente ou la location n'est pas forcement leur activite professionnelle. Par respect pour leur temps, il est indispensable de prevenir en cas d'empechement. Les rendez-vous non honores sans justification impactent negativement votre score de confiance sur SomaGate.

### A venir

- Depot de caution pour les visites a 10 EUR, encaissable si la Partie A ne se presente pas au rendez-vous.

---

## 3. Qualification du projet & Confirmation de visite

### Statut : `visit_confirmed`

### Confirmation croisee

- Les deux parties recoivent une **confirmation** (push + email) avec :
  - Le recapitulatif de l'annonce
  - La date et l'heure de la visite
- Chaque partie doit **confirmer le rendez-vous en un simple clic**

### Notifications

| Type | Moment |
|------|--------|
| Confirmation de visite | Immediatement apres confirmation croisee |
| Rappel automatique J-1 | 24 heures avant la visite |
| Rappel automatique H-2 | 2 heures avant la visite |

---

## 4. Visite effectuee

### Statut : `visit_completed`

### Action

Apres la visite, **chaque partie valide** :
- Visite effectuee : **OUI** / **NON**

### Statuts possibles

| Statut | Description |
|--------|-------------|
| `visit_completed` | Visite effectuee et confirmee par les deux parties |
| `visit_cancelled` | Visite annulee (avec motif) |
| `visit_rescheduled` | Visite reportee (reinitialisation des dates) |

### Notification

> Merci de confirmer le statut de la visite afin de poursuivre le processus.

### Gestion des no-shows

- Si une partie declare l'autre absente → **penalite sur le score de confiance** (-10 points)

### Preuves

- Confirmation croisee des deux parties
- Timestamp de chaque declaration

---

## 5. Intention formelle

### Statut : `intention_expressed`

### Action

Apres la visite, l'acheteur / locataire choisit parmi 3 options :

#### Option 1 : Continuer

→ Passe a l'etape suivante du workflow

#### Option 2 : Faire une offre

| Type d'offre | Description |
|--------------|-------------|
| Au prix affiche | Offre au prix demande par le proprietaire |
| Proposition de prix | Negociation avec montant propose |
| Upfront / Monthly | Pour les locations : paiement initial + mensuel |

→ Transition vers `offer_made`

#### Option 3 : Arreter

L'acheteur doit indiquer pourquoi :

| # | Motif d'arret |
|---|---------------|
| 1 | Le bien ne correspond pas aux photos ou a l'annonce |
| 2 | Le bien ne me plait pas / pas de coup de coeur |
| 3 | L'emplacement ne correspond pas a mes attentes |
| 4 | Le prix ou les conditions ne me conviennent pas (pas de negociation possible) |
| 5 | L'etat general ou la configuration ne correspond pas a mes criteres |
| 6 | Le bien ne correspond plus a mon projet ou a mon timing |
| 7 | J'ai trouve un autre bien plus adapte |
| 8 | Autre : _(champ libre)_ |

→ Transition vers `deal_cancelled`

### Si le bien correspond

Message affiche :
> Je prepare actuellement les contrats et je reviens vers vous.

---

## 6. Generation automatique de documents

### Statut : `documents_generated`

Les documents sont generes automatiquement avec les informations inscrites par les 2 parties.

> **Avertissement** : Documents generes = modeles standards, non valides juridiquement pour le moment. La validation par un notaire est prevue pour la suite.

### Documents generes selon le type d'operation

#### Location

| Document | Description |
|----------|-------------|
| Letter of Intent (LOI) | Lettre d'intention formelle |
| Recapitulatif des conditions | Resume des termes negocies |
| Projet de contrat de location (draft) | Contrat type avec clauses standards |

#### Vente

| Document | Description |
|----------|-------------|
| Letter of Intent (LOI) | Lettre d'intention formelle |
| Offre d'achat | Document d'offre avec montant et conditions |
| Term Sheet | Recapitulatif financier et calendrier |

### Contenu auto-rempli

Les champs suivants sont remplis automatiquement :
- Identite de l'acheteur (nom, prenom, email, nationalite)
- Identite du vendeur (nom, prenom, email, societe)
- Description du bien (type, adresse, surface, chambres, droit de propriete)
- Conditions financieres (prix demande, prix offert, type d'offre, devise)
- Dates cles (date de l'offre, date de visite, delai de validation)

### Notification

> Des documents ont ete generes. Merci de patienter.

---

## 7. Validations successives

### Statut : `in_validation`

### Action

Chaque partie valide successivement :
- Les **conditions** negociees
- Les **documents** generes
- L'**avancee du projet**

### Mecanisme

- Validation buyer → `buyer_validated = true`
- Validation seller → `seller_validated = true`
- Quand **tous les documents** sont valides par les deux parties → transition automatique vers `in_validation`

### Notifications

- A chaque validation d'un document par une partie
- A chaque modification ou regeneration de document

---

## 8. Deal finalise

### Statut : `deal_finalized`

### Action

Les deux parties declarent :
- **Location conclue** ou **Vente conclue**

### Mecanisme de double validation

- Partie A valide → `buyer_validated = true`
- Partie B valide → `seller_validated = true`
- Quand les deux ont valide → transition `deal_finalized`

### Message de felicitations

> Felicitations, un parcours sans faute avec Soma Gate !

### Questionnaire de retour d'experience

Apres la finalisation, un questionnaire est propose pour que le client partage son experience avec l'application.

---

## 9. Statut client certifie

### Conditions

Un utilisateur est **certifie** lorsqu'il finalise son premier deal avec succes.

### Badge de certification

- Badge vert "Client Certifie" affiche sur le profil
- Visible par tous les autres utilisateurs de la plateforme

### Avantages du statut certifie

| Avantage | Description |
|----------|-------------|
| Biens VIP | Acces a une selection de biens exclusifs |
| Visibilite renforcee | Meilleure mise en avant pour la location ou la presentation de vos biens |
| Confiance elevee | Facilite les echanges avec les autres utilisateurs |

### Email de certification

```
Objet : Statut Client Certifie - Acces privilegie SomaGate

Bonjour,

Nous avons le plaisir de vous confirmer que votre profil a ete certifie
par nos equipes.

Ce statut apparait desormais sur votre profil SomaGate et est materialise
par un badge de certification officiel.

Il vous permet :
- d'acceder a une selection de biens VIP,
- de beneficier d'une visibilite renforcee pour la location ou la
  presentation de vos biens,
- de faciliter les echanges avec les autres utilisateurs grace a un
  niveau de confiance eleve.

Cette certification atteste de la qualite et du serieux de votre profil
au sein de la plateforme.

Nous restons a votre disposition pour toute question et vous souhaitons
une excellente experience sur SomaGate.

Cordialement,
L'equipe SomaGate
```

---

## 10. Archivage & Conservation des preuves

### Statut : `archived`

### Contenu archive

| Element | Description |
|---------|-------------|
| Messages | Historique complet des conversations (classiques + securisees) |
| Documents | LOI, Term Sheet, contrats generes avec statut de validation |
| Validations | Qui a valide quoi, et quand |
| Visites | Demandes, confirmations, reports, annulations |
| Intentions | Choix de l'acheteur (continuer, offre, arret) avec motifs |
| Contrats | Versions finales des documents |

### Envoi par email

Le dossier complet est envoye par email aux 2 parties a la cloture.

### Acces

- **Telechargement** : export du dossier complet (format TXT avec toutes les preuves)
- **Historique non modifiable** : les logs de transaction n'ont aucune policy UPDATE/DELETE

### Nom du fichier exporte

`somagate-dossier-{reference}-{date}.txt`

### Message de securite

> En cas de litige ou de doute, SOMA GATE conserve l'historique complet du projet. Ce document fait foi.

---

## 11. Message central de vigilance & securite

### A afficher partout dans l'application

> **De nombreuses escroqueries existent dans le secteur immobilier, notamment dans la location et les transactions a distance.**
>
> SomaGate a ete concue pour centraliser et conserver l'ensemble des echanges lies a votre projet immobilier.
>
> Toutes les conversations menees sur la plateforme sont enregistrees et permettent de retracer precisement chaque etape.
>
> En echangeant en dehors de SomaGate, vous renoncez volontairement aux avantages de la plateforme ainsi qu'a toute protection liee a la centralisation des preuves.
>
> En cas de litige ou de doute, SOMA GATE conserve l'historique complet du projet.

### Messages contextuels supplementaires

| Contexte | Message |
|----------|---------|
| **Anti-arnaque general** | De nombreuses escroqueries existent dans la location et l'immobilier... |
| **Pas d'echange de telephone** | SomaGate a ete concu pour centraliser et conserver l'ensemble des echanges... |
| **Avertissement no-show** | Les biens proposes sur SomaGate sont publies par des proprietaires... Les rendez-vous non honores impactent negativement votre score de confiance. |
| **Avertissement refus de visite** | Les refus de visites peuvent diminuer votre score SomaGate. |
| **Protection litige** | En cas de litige ou de doute, SOMA GATE conserve l'historique complet du projet. |

---

## 12. Socle technique

### Machine a etats (State Machine)

14 statuts avec transitions validees :

```
matched
  → visit_requested
    → visit_proposed → visit_confirmed → visit_completed
    → visit_cancelled (→ visit_requested ou archived)
    → visit_rescheduled → visit_confirmed
  visit_completed
    → intention_expressed
      → offer_made
        → documents_generated
          → in_validation
            → deal_finalized
              → archived
      → deal_cancelled
        → archived
```

### Matrice des transitions valides

| Statut actuel | Transitions possibles |
|---------------|----------------------|
| `matched` | `visit_requested` |
| `visit_requested` | `visit_proposed`, `visit_cancelled` |
| `visit_proposed` | `visit_confirmed`, `visit_cancelled`, `visit_rescheduled` |
| `visit_confirmed` | `visit_completed`, `visit_cancelled`, `visit_rescheduled` |
| `visit_completed` | `intention_expressed` |
| `visit_cancelled` | `visit_requested`, `archived` |
| `visit_rescheduled` | `visit_confirmed`, `visit_cancelled` |
| `intention_expressed` | `offer_made`, `deal_cancelled` |
| `offer_made` | `documents_generated`, `deal_cancelled` |
| `documents_generated` | `in_validation` |
| `in_validation` | `deal_finalized`, `documents_generated` |
| `deal_finalized` | `archived` |
| `deal_cancelled` | `archived` |
| `archived` | _(etat final)_ |

### Logs immutables

Chaque action genere un log dans `wf_transaction_logs` :
- `action` : nom de l'action effectuee
- `actor_id` : qui a effectue l'action
- `actor_role` : buyer / seller / system
- `previous_status` / `new_status` : transition
- `details` : donnees supplementaires (JSONB)
- `created_at` : horodatage

### Notifications multi-canal

| Canal | Statut | Technologie |
|-------|--------|-------------|
| In-app (bell) | Actif | Table `wf_notifications` + polling 15s |
| Email | Actif | Resend via Edge Function `send-email` |
| Push natif | Prepare | Edge Function `send-push` (FCM a integrer) |
| WhatsApp | Prevu | Pas encore implemente |

### Score de confiance

```
Score = 50 (base)
  + 10 par deal finalise
  - 5 par deal annule
  - 10 par no-show
  - 5 par refus de visite

Plage : [0 - 100]
```

### Rappels automatiques

| Type | Declencheur | Destinataire |
|------|-------------|--------------|
| Rappel visite J-1 | 24h avant la visite | Acheteur + Vendeur |
| Rappel visite H-2 | 2h avant la visite | Acheteur + Vendeur |
| Inactivite 12h | Transaction stagnante >12h | La partie qui doit agir |
| Document en attente | Documents non valides | La partie concernee |

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18.3 + TypeScript 5.8 |
| Build | Vite 5.4 + SWC |
| Styling | Tailwind CSS 3.4 + shadcn/ui (40+ composants) |
| State / Data | TanStack React Query v5 |
| Routing | React Router DOM v6 |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Animations | Framer Motion |
| i18n | i18next (8 langues : FR, EN, ID, ES, DE, NL, RU, ZH) |
| Cartographie | React Leaflet |
| Formulaires | React Hook Form + Zod |
| PWA | vite-plugin-pwa (Workbox) |
| Mobile | Capacitor iOS |
| Emails | Resend |

---

## Demarrage rapide

```bash
# Installer les dependances
npm install

# Lancer le serveur de developpement
npm run dev

# Build production
npm run build

# Sync iOS (Capacitor)
npx cap sync ios
```

---

**SOMA GATE — INTELLIGENCE IMMOBILIERE**

_Swipe, Match & Secure your next property in Indonesia._
