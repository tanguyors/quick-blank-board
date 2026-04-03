# 07 — Swipe, Matching & Exploration

## Système de Swipe

### Concept
Les acheteurs explorent les biens via un système de cartes swipables (à la Tinder) :
- **Swipe gauche** (❌) = Passer
- **Swipe droite** (❤️) = Match / Coup de cœur
- **Bouton favori** (⭐) = Sauvegarder sans matcher

### Flux Technique du Swipe Right

```
1. User swipe right sur un bien
   ↓
2. INSERT swipes (user_id, property_id, direction: 'right')
   ↓
3. INSERT matches (user_id, property_id, owner_id)
   ↓
4. INSERT conversations (buyer_id, owner_id, property_id, match_id)
   ↓
5. WorkflowService.createTransaction(propertyId, userId, ownerId)
   ├── INSERT wf_transactions (status: 'matched')
   ├── INSERT wf_transaction_logs
   ├── INSERT wf_notifications (buyer + seller)
   └── EmailService.sendToTransactionParties('matched')
   ↓
6. Invalidate queries ['explorable-properties', 'matches']
   ↓
7. Affichage MatchAnimation si result.matched = true
```

### Hook : `useExplorableProperties(filters?)`

Récupère les biens explorables en filtrant :
1. `is_published = true`
2. `status = 'available'`
3. `owner_id ≠ user_id` (pas ses propres biens)
4. Exclut les biens déjà swipés (query `swipes` → `Set<propertyId>`)
5. Applique les filtres optionnels :
   - `operation` (freehold/leasehold/location/home_exchange)
   - `type` (villa, appartement, etc.)
   - `priceRange` [min, max]
   - `surfaceRange` [min, max]
   - `chambresMin`
   - `secteurs` (array de quartiers)

### Hook : `useSwipe()`

Mutation qui :
- Insert le swipe dans la table `swipes`
- Si direction = 'right' :
  - Crée le match
  - Crée la conversation
  - Crée la transaction workflow (try/catch, best-effort)
- Invalide les caches

---

## Composant SwipeStack (`src/components/swipe/SwipeStack.tsx`)

### Interactions
- **Pointer drag** : onPointerDown/Move/Up avec tracking de l'offset
- Seuil de swipe : `|offset.x| > 100px`
- Animation de sortie : `translateX(±150%) rotate(±30deg)` + opacity → 0

### Indicateurs Visuels
- Offset < -50px : Badge rouge "PASSER"
- Offset > +50px : Badge vert "MATCH"

### Compteur
- Affiche `currentIndex + 1 / totalCount`

### Incitation aux Préférences
- Après 3 swipes, si les préférences buyer ne sont pas complètes → bouton animé "Affiner ma recherche"

### Detail Sheet
- Clic sur le bouton info de la carte → ouvre `PropertyDetailSheet` en bottom sheet
- Actions disponibles : Like (match), Favori

---

## Filtres d'Exploration (`src/components/explore/ExploreFilters.tsx`)

### Deux Méthodes de Recherche

#### Méthode 1 : Par Adresse + Rayon
- Champ de saisie d'adresse
- Slider rayon : 1km à 50km (step 1)
- Mode de transport : 🛵 Scooter | 🚗 Voiture | 🚶 À pied
  - Actuellement **visuel uniquement** (pas de calcul d'isochrone)

#### Méthode 2 : Par Filtres Classiques
- Opération : Freehold | Leasehold | Location | Home Exchange
- Type de bien : dropdown avec 8 types
- Secteurs : multi-select searchable avec 47 quartiers de Bali
  - Recherche par texte
  - Tags amovibles
  - Bouton "Tout désélectionner"

### Filtres Communs (toujours visibles)
- Budget : slider double 0 → 10 milliards IDR
- Surface : slider double 0 → 1000 m²
- Chambres minimum : 0 à 5+

### Compteur de Filtres Actifs
```typescript
function useFilterCount(filters): number {
  // Compte les filtres non-default
}
```

---

## Carte Interactive (`src/components/map/PropertyMap.tsx`)

### Technologie
- **React Leaflet** avec tiles OpenStreetMap
- Centre par défaut : Bali (-8.45, 115.26), zoom 10

### Marqueurs avec Prix
Chaque bien avec coordonnées affiche un marqueur personnalisé contenant le prix formaté.

### Code Couleur des Marqueurs

| Statut | Couleur fond | Couleur texte |
|---|---|---|
| **Déjà vu** (swipé) | Gris (`#9ca3af`) | Blanc |
| **Favori** | Turquoise (`#06b6d4`) | Blanc |
| **Non vu** | Blanc cassé (`#faf7f2`) | Noir |

### Popup au Clic
- Image principale du bien
- Prix formaté
- Opération + type
- Stats (chambres, SdB, surface)
- Adresse
- Boutons acheteur : Match, Favori
- Bouton "Voir le détail" → ouvre `PropertyDetailSheet`

### Filtres de la Carte
Panel déroulant avec :
- Opération (Freehold/Leasehold/Location/Home Exchange)
- Type de bien
- Prix min/max

### Modes d'Affichage
- **Standalone** (`/map`) : avec barre de navigation + bouton retour
- **Embedded** : intégré dans la page Explore ou Admin, sans header
