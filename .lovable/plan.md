
# Ajout du bouton "Voir les details" sur les cartes Swipe

## Objectif
Ajouter un bouton "Voir les details" sur chaque vignette de la page Decouvrir (swipe). Ce bouton ouvre un panneau coulissant (Sheet) identique a celui de la carte, affichant toutes les informations du bien avec les actions Match et Favori.

## Ce qui existe deja
- Le composant `PropertyDetailSheet` (utilise sur la vue Carte) affiche deja toutes les informations du bien avec galerie photos, description, equipements, et les boutons Match / Favori / Demander une visite.
- Il suffit de le reutiliser tel quel dans le SwipeStack.

## Modifications prevues

### 1. SwipeCard - Ajout du bouton "Voir les details"
**Fichier** : `src/components/swipe/SwipeCard.tsx`

- Ajouter un bouton "Voir les details" en bas de la carte, sous le prix.
- Ce bouton appelle un callback `onInfoClick` (deja prevu dans les props mais non utilise).
- Le bouton sera style avec un fond semi-transparent et une icone "info" ou le texte "Voir les details".

### 2. SwipeStack - Integration du PropertyDetailSheet
**Fichier** : `src/components/swipe/SwipeStack.tsx`

- Ajouter un state `showDetail` pour controler l'ouverture du sheet.
- Importer et integrer le composant `PropertyDetailSheet`.
- Passer les callbacks `onLike` (match), `onToggleFavorite` (favori) et `isFavorite` au sheet.
- Passer la prop `onInfoClick` au composant `SwipeCard` pour ouvrir le detail.
- S'assurer que le drag/swipe ne se declenche pas quand on clique sur le bouton (stopPropagation).

### 3. Flux utilisateur
1. L'utilisateur voit une carte de bien dans le swipe.
2. Il clique sur le bouton "Voir les details" en bas de la vignette.
3. Un panneau coulissant s'ouvre depuis le bas avec la galerie complete, les specs (type, operation, droit, surface, chambres, salles de bain), la description, les equipements.
4. En bas du panneau, deux boutons : "Matcher" (coeur) et "Favori" (etoile), plus "Demander une visite".
5. Fermer le panneau ramene au swipe sans changer de carte.

## Details techniques

- Reutilisation directe de `PropertyDetailSheet` sans duplication de code.
- Les actions Match et Favori dans le sheet utilisent les memes hooks (`useSwipe`, `useFavorites`) que le reste de l'app.
- Le bouton sur la SwipeCard utilise `e.stopPropagation()` et `e.preventDefault()` pour eviter de declencher le swipe gestuel.
- Import de `useFavorites` dans SwipeStack (deja present) pour fournir `isFavorite` et `toggleFavorite` au sheet.
