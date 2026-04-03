# 12 — Propriétés & Formulaires

## PropertyForm (`src/components/properties/PropertyForm.tsx`)

### Configuration par Type de Bien

Chaque type de bien a une configuration qui détermine les champs affichés :

```typescript
interface TypeConfig {
  showRooms: boolean;           // Afficher chambres
  showBathrooms: boolean;       // Afficher salles de bain
  showDroit: boolean;           // Afficher droit de propriété
  showEquipements: boolean;     // Afficher grille d'équipements
  equipementCategories: { title: string; items: string[] }[];
  allowedOperations: string[];  // Opérations autorisées pour ce type
}
```

**Exemples** :
- `villa` : showRooms ✅, showBathrooms ✅, showDroit ✅, showEquipements ✅, operations: [vente, location, leasehold, freehold, home_exchange]
- `terrain` : showRooms ❌, showBathrooms ❌, showDroit ✅, showEquipements ❌, operations: [vente, leasehold, freehold]
- `bureau` : showRooms ✅, showBathrooms ✅, showDroit ❌, showEquipements ✅, operations: [vente, location, leasehold, freehold]

### Types de Biens Disponibles (16)

Villa, Appartement, Terrain, Studio, Maison, Bureau, Commerce, Entrepôt, Commercial, Construction, Maison à rénover, Colocation longue, Colocation courte, Hébergement service, Hébergement animaux, Guesthouse

### Droits de Propriété (5)

| Valeur | Label |
|---|---|
| `titre_foncier` | Titre Foncier |
| `bail` | Bail |
| `deliberation` | Délibération |
| `freehold` | Freehold |
| `leasehold` | Leasehold |

### Opérations (6)

| Valeur | Label |
|---|---|
| `freehold` | Freehold |
| `leasehold` | Leasehold |
| `vente` | Vente |
| `location` | Location |
| `achat` | Achat |
| `home_exchange` | Home Exchange |

### Gestion des Médias

1. **Upload** : sélection de fichiers → stockage temporaire dans `pendingFiles`
2. **Lors du submit** :
   - Si création : crée d'abord la propriété, puis upload les fichiers
   - Upload vers le bucket `property-media` (path: `{propertyId}/{filename}`)
   - Insert dans `property_media` table
3. **Suppression** : supprime du storage + de la table
4. **Photo principale** : update `is_primary` sur le média sélectionné

### Conversion de Devises
- Le formulaire affiche le prix dans la devise sélectionnée
- Conversion automatique via `convertCurrency()` lors du changement de devise
- La devise par défaut est la `preferred_currency` du profil

### Publication
- Toggle Switch "Publier le bien"
- Un bien non publié n'apparaît pas dans l'exploration

---

## PropertyDetail (`src/components/properties/PropertyDetail.tsx`)

### Sections Affichées
1. **Carousel photos** : images triées par position, navigation par index
2. **Badges** : type de bien, opération (Freehold/Leasehold/Location/Home Exchange)
3. **Prix** : formaté avec conversion selon la devise préférée de l'utilisateur
4. **Adresse** : texte simple
5. **Stats** : surface, chambres, salles de bain (avec icônes)
6. **Disclaimer** :
   > ⚠️ Les informations affichées sont fournies par le propriétaire. SOMA GATE n'a pas vérifié l'exactitude de ces données.
7. **Badges statut documents** :
   - "Documents fonciers non fournis" (rouge)
   - "Contrôle en cours" (jaune)
   - "Documents vérifiés" (vert)
8. **Description** : si présente
9. **Grille d'équipements** : icônes + labels

### Actions Contextuelles
- **Propriétaire** : bouton "Modifier" → `/properties/{id}/edit`
- **Acheteur (non-owner)** : bouton "Demander une visite" → ouvre `VisitForm`

---

## Hooks Propriétés

### `useMyProperties()`
- Query : `properties` WHERE `owner_id = user.id`, avec `property_media`
- Trié par `created_at` desc

### `useProperty(id)`
- Query : `properties` WHERE `id = id`, avec `property_media`
- `maybeSingle()` pour gérer le cas "pas trouvé"

### `useCreateProperty()`
- Mutation : INSERT dans `properties`
- Invalide `['my-properties']`

### `useUpdateProperty()`
- Mutation : UPDATE `properties` WHERE `id = id`
- Invalide `['my-properties']` et `['property']`

---

## BuyerPreferencesWizard (`src/components/preferences/BuyerPreferencesWizard.tsx`)

### 5 Étapes

1. **Types de bien** : multi-select (checkbox grid)
2. **Opération** : Freehold / Leasehold / Location / Home Exchange + bulle explicative
3. **Date d'emménagement** : 5 options
   - Dès que possible
   - Dans 1-3 mois
   - Dans 3-6 mois
   - Dans 6-12 mois
   - Plus tard (juste en veille)
4. **Budget** : fourchette min/max + devise
5. **Secteurs** : multi-select avec 47 quartiers de Bali + checkbox "Contacté par un conseiller"

### Comportement
- Chaque étape sauvegarde immédiatement via `upsertPreferences`
- `is_complete = true` marqué à la dernière étape
- L'utilisateur peut revenir et modifier à tout moment
