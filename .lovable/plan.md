

## Gestion des Notifications dans les Parametres

### Objectif
Ajouter une section "Gestion des notifications" dans les parametres de compte de l'acheteur (`AccountSettings`) et du vendeur/loueur (`OwnerProfileTab`), avec 4 toggles :
- **Notifications Mobile (Push)**
- **Notifications Email**
- **Notifications WhatsApp**
- **Recevoir les newsletters**

### Ce qui va changer

**1. Base de donnees -- Nouvelle migration**

Ajout de 4 colonnes booleennes dans la table `profiles` :

| Colonne | Type | Default |
|---------|------|---------|
| `notif_push` | boolean | `true` |
| `notif_email` | boolean | `true` |
| `notif_whatsapp` | boolean | `true` |
| `notif_newsletter` | boolean | `true` |

Par defaut, toutes les notifications seront activees.

**2. Types Supabase**

Mise a jour du fichier `src/integrations/supabase/types.ts` pour inclure les 4 nouvelles colonnes dans les types `Row`, `Insert` et `Update` de la table `profiles`.

**3. Page Parametres Acheteur (`AccountSettings.tsx`)**

Ajout d'une nouvelle carte "Gestion des notifications" entre la section "Devise preferee" et le bouton "Sauvegarder", contenant :
- Icone Bell + titre "Notifications"
- 4 lignes avec chacune :
  - Un label + description courte
  - Un composant `Switch` (Radix UI, deja disponible dans le projet)
- Les changements de toggle seront sauvegardes immediatement via `updateProfile.mutate()` (comme la devise)

**4. Profil Vendeur/Loueur (`OwnerProfileTab.tsx`)**

Remplacement de la section "Preferences de communication" existante (qui n'a qu'un toggle newsletter basique avec un checkbox HTML) par la meme section complete avec les 4 toggles utilisant le composant `Switch`.

### Details techniques

- Les 4 champs seront ajoutes au state `form` dans les deux composants
- Chaque `Switch` declenchera un `updateProfile.mutate()` immediat pour sauvegarder la preference sans attendre le bouton "Sauvegarder"
- Un toast de confirmation sera affiche a chaque changement
- Le composant `Switch` de Radix (deja installe) sera utilise pour un look natif et accessible
- La section aura le meme style visuel que les autres cartes (bg-card, rounded-2xl, border)

### Disposition visuelle de la section

```text
+------------------------------------------+
| Bell  Notifications                      |
+------------------------------------------+
| Notifications Mobile (Push)        [===] |
| Recevez des alertes sur votre tel.       |
|------------------------------------------|
| Notifications Email                [===] |
| Recevez des notifications par email      |
|------------------------------------------|
| Notifications WhatsApp             [===] |
| Recevez des messages via WhatsApp        |
|------------------------------------------|
| Newsletter                         [===] |
| Offres et actualites par email           |
+------------------------------------------+
```

### Fichiers modifies

1. **Nouvelle migration SQL** -- Ajout des 4 colonnes dans `profiles`
2. `src/integrations/supabase/types.ts` -- Ajout des types pour les nouvelles colonnes
3. `src/pages/AccountSettings.tsx` -- Ajout de la section notifications
4. `src/components/dashboard/OwnerProfileTab.tsx` -- Remplacement de la section communication existante par la version complete

