

# Plan d'implementation -- Document client SOMA GATE (Roadmap Legale)

Ce plan couvre TOUS les points du document client, point par point. Les elements deja implementes sont marques comme tels, et les elements manquants ou incomplets sont detailles.

---

## PARTIE A -- Corrections produit & UX (Points 1 a 12 du document)

### 1. Positionnement et coherence produit

| Point | Statut | Action |
|-------|--------|--------|
| 1.1 Retirer toute reference a Tinder | Deja fait | Verifier qu'aucune reference ne subsiste (recherche globale) |
| 1.2 Texte ecran d'accueil | Deja fait | Home.tsx contient "Ta recherche immobiliere reinventee" + "Soma Gate, la premiere plateforme d'intelligence immobiliere" |
| 1.3 Corrections linguistiques | A FAIRE | Audit orthographique complet de toute l'app |
| 1.4 Terminologie Leasehold/Freehold | Partiellement fait | `PropertyDetail.tsx` ligne 55 affiche encore "Vente" / "Location" au lieu de Freehold/Leasehold -- a corriger |

### 2. Fiche detail d'un bien

| Point | Statut | Action |
|-------|--------|--------|
| 2.1 Lisibilite icones (surface, chambres, sdb) | Partiellement fait | `SwipeCard.tsx` a les icones h-5 w-5, mais `PropertyDetail.tsx` a toujours h-4 w-4 avec `text-muted-foreground` -- agrandir et ameliorer le contraste |
| 2.2 Typographie du prix (separateur point, typo premium) | Deja fait | `currencies.ts` utilise le separateur point, prix en bold sur SwipeCard |

### 3. Carte et affichage des biens

| Point | Statut | Action |
|-------|--------|--------|
| 3.1 Code couleur carte (gris/turquoise/blanc casse) | Deja fait | PropertyMap.tsx implemente le code couleur |

### 4. Types de biens et iconographie

| Point | Statut | Action |
|-------|--------|--------|
| 4.1 Ajouter type Entrepot | Deja fait | Present dans PROPERTY_TYPES |
| 4.2 Icones premium (Lucide) | Deja fait | Lucide icons dans BuyerPreferencesWizard |
| 4.3 Supprimer logos par defaut | A VERIFIER | S'assurer qu'aucun logo generique ne subsiste |

### 5. Recherche de biens

| Point | Statut | Action |
|-------|--------|--------|
| 5.1 Methode 1 : adresse + rayon + mode deplacement | A VERIFIER | Verifier si implemente dans ExploreFilters ou Map |
| 5.2 Menu deroulant villes (pas de chips) | Deja fait | ExploreFilters utilise un Select dropdown avec 47 secteurs |
| 5.3 Pop-up autorisation localisation | A FAIRE | Ajouter une demande de geolocalisation dans l'app (navigator.geolocation) |

### 6. Statut du bien et temporalite

| Point | Statut | Action |
|-------|--------|--------|
| 6.1 Date de debut (emmenagement) | A FAIRE | Ajouter les options dans le wizard : "Tres rapidement", "Dans les semaines a venir", "Choisir un mois", "Date butoir precise", "Je suis flexible" |
| 6.2 Budget et Intention non obligatoires | Deja fait | canNext() retourne true pour les steps 2 et 3 |

### 7. Ecran de patience/validation

| Point | Statut | Action |
|-------|--------|--------|
| 7.1 Ecran de patience avec texte specifique | Deja fait | "Toutes les maisons ne sont pas faites pour tout le monde..." avec animation |

### 8. Navigation et structure

| Point | Statut | Action |
|-------|--------|--------|
| 8.1 Onglets manquants (Parametres, Profil, Aide, Confidentialite, Assistance) | Deja fait | Sidebar contient tous ces liens |

### 9. Typographies et branding

| Point | Statut | Action |
|-------|--------|--------|
| 9.1 Polices premium | Deja fait | DM Serif Display + DM Sans |
| 9.2 Propositions de logo | HORS SCOPE | Necessite un travail de design graphique externe |

### 10. Page d'accueil

| Point | Statut | Action |
|-------|--------|--------|
| 10.1 CTA principal | Deja fait | "COMMENCER MA RECHERCHE GRATUITEMENT" |
| 10.2 Parcours apres 3 swipes | A FAIRE | Ajouter un compteur de swipes et afficher "COMMENCER MA RECHERCHE" apres 3 swipes dans Explore |
| 10.3 Grille de biens (pas une seule image) | Deja fait | Grid de 6 proprietes |
| 10.4 Nombre de matchs du jour | Deja fait | Compteur affiche sur Home.tsx |

### 11. Notifications et micro-interactions

| Point | Statut | Action |
|-------|--------|--------|
| 11.1 Son de notification | A FAIRE | Ajouter un son personnalise a la reception de notifications |
| 11.2 Notification de match (wording) | A VERIFIER | Verifier le wording des notifications de match |

### 12. Slogan et identite

| Point | Statut | Action |
|-------|--------|--------|
| 12.1 Slogan visible partout | Deja fait | Present sur Home, footer, emails |

---

## PARTIE B -- Legal et conformite (Points 13 a 16)

### 13. CGU -- Conditions Generales d'Utilisation

| Point | Statut | Action |
|-------|--------|--------|
| Page CGU complete (18 articles) | A FAIRE | La page actuelle s'appelle "CGV" mais contient un contenu simplifie. Creer une vraie page CGU avec les 18 articles du document client |
| Checkbox "J'accepte les CGU et la politique de confidentialite" a l'inscription | A FAIRE | Ajouter dans AuthForm.tsx |

### 13bis. CGV -- Conditions Generales de Vente

| Point | Statut | Action |
|-------|--------|--------|
| Page CGV complete (16 articles) | A FAIRE | Remplacer le contenu actuel de CGV.tsx par les 16 articles du document client |

### 14. Politique de Confidentialite

| Point | Statut | Action |
|-------|--------|--------|
| Contenu conforme PDP Law indonesienne | A FAIRE | Le contenu actuel est generique. Le remplacer par un contenu conforme aux exigences du document (donnees collectees, finalite, duree, droits, contact) |

### 15. Disclaimer sur chaque fiche bien

| Point | Statut | Action |
|-------|--------|--------|
| Message d'avertissement visible | A FAIRE | Ajouter sur PropertyDetail.tsx et PropertyView.tsx un encadre bien visible avec le texte : "Les informations et documents relatifs a ce bien sont fournis par le proprietaire. SOMA GATE n'en verifie pas l'authenticite ni la conformite legale." |
| Badge statut documents (Non fournis / En cours / Fournis) | A FAIRE | Ajouter un indicateur visuel du statut des documents |

### 16. Contact conseiller

| Point | Statut | Action |
|-------|--------|--------|
| Case a cocher "Je souhaite etre contacte par un conseiller" | Deja fait | Present dans Step4 du BuyerPreferencesWizard |

---

## PARTIE C -- Actualites (Point 14 du document)

| Point | Statut | Action |
|-------|--------|--------|
| Page Actualites | Deja fait | Existe avec articles placeholder |
| Article specifique du document (permis de construire Bali) | A FAIRE | Remplacer les articles placeholder par le vrai article du document client sur les restrictions de permis de construire |

---

## PARTIE D -- Parcours transaction (Pages 40-48)

La plupart de ces fonctionnalites (state machine, notifications, documents, validations) sont deja implementees dans le systeme de workflow existant. Points a verifier/ajouter :

| Point | Statut | Action |
|-------|--------|--------|
| Message de vigilance anti-arnaque | A FAIRE | Afficher le message central sur chaque page de transaction : "De nombreuses escroqueries existent dans la location et l'immobilier. En utilisant SOMA GATE a chaque etape, vous conservez des preuves claires et datees." |
| Wording notifications match (cote acheteur) | A FAIRE | "Nous prevenons le Proprietaire de votre coup de coeur pour son bien via Soma Gate." |
| Wording notifications match (cote vendeur) | A FAIRE | "Bonne nouvelle votre maison vient de recevoir le coup de coeur qu'elle merite." |
| Motifs de refus de visite (3 motifs specifiques) | Deja fait | Implemente dans le workflow |
| Motifs d'arret d'intention (8 motifs) | Deja fait | Implemente dans le workflow |
| Message sur impact score si refus | A FAIRE | Ajouter "Les refus de visites peuvent diminuer votre score Soma Gate" |
| Message respect des RDV | A FAIRE | Ajouter l'avertissement sur le respect des rendez-vous |
| Email certification client | A VERIFIER | Verifier le contenu du mail de certification |

### 18. Chatbot

| Point | Statut | Action |
|-------|--------|--------|
| Integration chatbot | Deja fait | ChatBot.tsx + edge function deployes |

---

## Plan d'execution par phases

### Phase 1 -- Legal critique (CGU + CGV + Confidentialite)
1. Creer une page `CGU.tsx` avec les 18 articles complets du document
2. Recrire `CGV.tsx` avec les 16 articles complets du document
3. Recrire `Confidentialite.tsx` conforme PDP Law
4. Ajouter une checkbox obligatoire CGU + Confidentialite dans `AuthForm.tsx`
5. Ajouter les routes CGU dans `App.tsx`

### Phase 2 -- Disclaimers et securite
1. Ajouter le disclaimer "Information importante" sur chaque fiche bien (`PropertyDetail.tsx`)
2. Ajouter le message central anti-arnaque sur les pages de transaction
3. Ajouter les messages de score/respect sur les ecrans de visite

### Phase 3 -- Corrections UX restantes
1. Corriger `PropertyDetail.tsx` : terminologie Freehold/Leasehold (ligne 55)
2. Ameliorer les icones dans PropertyDetail (h-5 w-5, meilleur contraste)
3. Ajouter le champ "Date d'emmenagement" dans le wizard acheteur (Step 3)
4. Ajouter la demande de geolocalisation

### Phase 4 -- Actualites et wording
1. Remplacer les articles placeholder par l'article reel du document (permis de construire Bali)
2. Mettre a jour le wording des notifications de match
3. Audit orthographique global

### Phase 5 -- Micro-interactions
1. Ajouter un son de notification

---

## Details techniques

### Fichiers a creer
- `src/pages/CGU.tsx` -- nouvelle page CGU complete

### Fichiers a modifier
- `src/pages/CGV.tsx` -- recrire avec 16 articles complets
- `src/pages/Confidentialite.tsx` -- recrire conforme PDP Law
- `src/components/auth/AuthForm.tsx` -- ajouter checkbox CGU/Confidentialite
- `src/App.tsx` -- ajouter route /cgu
- `src/components/properties/PropertyDetail.tsx` -- disclaimer + terminologie + icones
- `src/components/swipe/SwipeCard.tsx` -- verifier le disclaimer
- `src/components/preferences/BuyerPreferencesWizard.tsx` -- ajouter champ date emmenagement
- `src/pages/Actualites.tsx` -- remplacer articles par contenu reel
- `src/components/workflow/TransactionStatus.tsx` -- message anti-arnaque
- `src/components/layout/AppSidebar.tsx` -- ajouter lien CGU

### Base de donnees
- Aucune migration necessaire pour cette phase

