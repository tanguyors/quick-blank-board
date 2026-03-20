

## Plan : Implémenter les éléments manquants du document PDF

### Audit complet — Ce qui est FAIT vs ce qui MANQUE

| Exigence PDF | Statut | Détail |
|---|---|---|
| 1.1 Retirer références Tinder | ✅ FAIT | Aucune référence trouvée |
| 1.2 Texte accueil "Ta recherche immobilière réinventée" | ✅ FAIT | `fr.json` heroTitle OK |
| 1.3 Corrections linguistiques | ⚠️ PARTIEL | Mot "Swiper" encore dans BuyerDashboard + ProfileForm |
| 1.4 Terminologie Leasehold/Freehold (pas "Vente") | ⚠️ PARTIEL | PropertyDetail.tsx gère "vente" → Freehold mais le mot existe encore |
| 2.1 Icônes clés lisibles | ✅ FAIT | Icônes custom PNG intégrées |
| 2.2 Typographie prix premium | ✅ FAIT | Séparateur implémenté |
| 3.1 Code couleur carte (vu=gris, coup de coeur=turquoise) | ❌ MANQUE | Aucun code couleur sur la carte |
| 4.1 Type "Entrepôt" | ✅ FAIT | Présent partout |
| 4.2-4.3 Icônes premium / logos custom | ✅ FAIT | Icônes PNG custom |
| 5.1 Recherche par adresse+rayon+transport | ❌ MANQUE | Pas de méthode 1 (adresse+rayon+mode déplacement) |
| 5.2 Villes en dropdown | ⚠️ À VÉRIFIER | ExploreFilters a un système de filtres |
| 5.3 Pop-up localisation | ✅ FAIT | AlertDialog géolocalisation dans Explore.tsx |
| 6.1 Date emménagement (5 options) | ✅ FAIT | BuyerPreferencesWizard Step3 |
| 6.2 Budget/Intention non obligatoires | ✅ FAIT | Pas de validation required |
| 7.1 Écran validation/patience | ⚠️ PARTIEL | PageLoader existe mais pas le message spécifique |
| 8.1 Onglets Paramètres, Profil, Aide, etc. | ✅ FAIT | Pages existantes |
| 10.1 CTA "SWIPER DÈS MAINTENANT" | ✅ FAIT | `fr.json` ctaSwipe |
| 10.4 Matchs du jour sur Home | ✅ FAIT | todayMatchCount query |
| 11.1 Son notification | ❌ MANQUE | Pas de son |
| 12.1 Slogan visible | ✅ FAIT | Slogan dans Home + Actualités |
| 13.1 CGU/CGV/CGV Abo | ✅ FAIT | Réécrit au message précédent |
| 13.2 Validation carte d'identité | ❌ MANQUE | Aucune implémentation |
| 14.1 Onglet Actualités | ✅ FAIT | Page Actualites.tsx avec articles du PDF |
| 15.1 Bulle aide Leasehold/Freehold | ✅ FAIT | BuyerPreferencesWizard |
| 16.1 Checkbox "contacté par conseiller" | ✅ FAIT | BuyerPreferencesWizard |
| 18.1 Chatbot | ✅ FAIT | ChatBot.tsx fonctionnel |
| Disclaimer fiche bien | ✅ FAIT | PropertyDetail.tsx avec ⚠️ + badge document status |
| Badge statut documents | ✅ FAIT | Non fournis / En cours / Fournis |
| **HOME EXCHANGE** | ❌ MANQUE | Aucune implémentation |
| Parcours transaction (state machine) | ✅ FAIT | 14 statuts, workflow complet |
| Messages sécurité anti-arnaque | ✅ FAIT | SECURITY_MESSAGES dans workflow |
| Blocage numéros téléphone | ✅ FAIT | messageDetectionService |
| Rappels J-1 / H-2 | ✅ FAIT | createVisitReminders |
| Documents auto-générés | ✅ FAIT | LOI, Term Sheet, contrats |
| Certification client post-deal | ✅ FAIT | CertifiedBadge + score |
| Archivage/export preuves | ✅ FAIT | transactionExportService |

### Éléments à implémenter

**1. Home Exchange (PRIORITÉ — demandé explicitement)** — Pages 8-9 du PDF
- Ajouter un nouveau type d'opération `home_exchange` dans le formulaire de publication
- Créer une section dédiée dans la navigation/sidebar
- Permettre aux propriétaires de proposer leur bien en échange
- Système simple de mise en relation (pas de gestion financière complexe)
- Page de listing des biens disponibles en Home Exchange

**2. Code couleur carte** — Page 3 du PDF (Section 3.1)
- Biens déjà vus → prix en gris
- Biens coup de coeur (favoris) → couleur turquoise
- Autres biens → blanc cassé
- Modifier PropertyMap.tsx pour appliquer ces couleurs aux marqueurs

**3. Recherche par adresse + rayon** — Page 3 du PDF (Section 5.1, Méthode 1)
- Ajouter un champ de saisie d'adresse dans ExploreFilters
- Choix d'un rayon (1km, 3km, 5km, 10km)
- Choix du mode de déplacement (scooter, voiture, à pied) — visuel uniquement pour le moment

**4. Son de notification** — Page 5 du PDF (Section 11.1)
- Ajouter un son court lors de la réception de notifications
- Intégrer dans le composant NotificationBell

**5. Nettoyage du mot "Swiper"** — Page 2 du PDF (Section 1.3)
- Remplacer "Swiper" par "Explorer" dans BuyerDashboard.tsx et ProfileForm.tsx

### Résumé technique

| Tâche | Fichiers impactés | Complexité |
|---|---|---|
| Home Exchange | PropertyForm, ExploreFilters, types Supabase, nouveau composant, sidebar | Haute |
| Code couleur carte | PropertyMap.tsx | Moyenne |
| Recherche adresse+rayon | ExploreFilters.tsx, SwipeStack.tsx | Moyenne |
| Son notification | NotificationBell.tsx, asset audio | Faible |
| Nettoyage "Swiper" | BuyerDashboard.tsx, ProfileForm.tsx | Faible |

5 fichiers minimum à modifier, 1-2 nouveaux composants à créer.

