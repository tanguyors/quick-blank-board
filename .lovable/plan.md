

## Plan : Aligner les pages légales à 100% avec le document PDF

### Constat

Le PDF contient les textes légaux **exacts** à utiliser. Les pages actuelles de l'app ont été "enrichies" avec des références juridiques supplémentaires (UU, PP, articles spécifiques) qui **ne figurent pas** dans le document de référence. Voici les écarts :

| Page | PDF | App actuelle | Écart |
|------|-----|-------------|-------|
| **CGU** | 18 articles, texte simple | 20 articles, références juridiques ajoutées | Structure et contenu différents |
| **CGV Monétisation** | 16 articles | 16 articles mais contenu enrichi | Texte divergent |
| **CGV Abonnement** | 15 articles | 17 articles | 2 articles en trop, texte divergent |
| **Confidentialité** | Exigences listées (données collectées, finalité, droits) | Page détaillée existante | Pas de texte exact dans le PDF — à conserver tel quel |

### Modifications prévues

**1. Réécriture de `src/pages/CGU.tsx`**
- Passer de 20 à 18 articles
- Suivre le texte exact du PDF (pages 22-27) :
  - Art. 1 : Présentation de la plateforme
  - Art. 2 : Nature des services (clause fondamentale)
  - Art. 3 : Cadre juridique applicable (ITE, PDP, PSE)
  - Art. 4-18 : Accès, création de compte, obligations, publication, documents, modération, mise en relation, transactions, responsabilité, données personnelles, propriété intellectuelle, suspension, modification, droit applicable, contact
- Supprimer les articles "Identité de l'éditeur" et "Dispositions générales" qui n'existent pas dans le PDF
- Date : "18 décembre 2025" comme dans le PDF
- Retirer les sous-références juridiques détaillées (UU No. 19/2016, PP No. 71/2019, etc.) non présentes dans le PDF

**2. Réécriture de `src/pages/CGV.tsx`**
- Aligner les 16 articles sur le texte exact du PDF (pages 29-34) :
  - Simplifier les articles (retirer les références UU/PP ajoutées)
  - Art. 4 : "Tarifs" (pas "Information pré-contractuelle")
  - Art. 5 : "Modalités de paiement"
  - Art. 8 : "Absence de remboursement" (pas "Droit de rétractation")
  - Art. 15 : "Droit applicable et juridiction" (simplifier vs résolution détaillée)
- Date : "18 décembre 2025"

**3. Réécriture de `src/pages/CGVAbonnement.tsx`**
- Passer de 17 à 15 articles conformément au PDF (pages 36-41) :
  - Supprimer les articles "Information pré-contractuelle", "Résiliation par l'utilisateur" et "Résolution des litiges" ajoutés
  - Art. 6 : "Durée et renouvellement"
  - Art. 7 : "Droit de rétractation"
  - Art. 8 : "Politique de remboursement"
  - Art. 14 : "Droit applicable et juridiction"
  - Art. 15 : "Contact"
- Date : "18 décembre 2025"

**4. Conserver `src/pages/Confidentialite.tsx`**
- Le PDF ne contient pas de texte exact pour la politique de confidentialité, seulement les exigences (liste des données, finalité, durée, droits, contact privacy)
- La page actuelle couvre déjà toutes ces exigences — pas de modification nécessaire

### Résumé technique

- 3 fichiers à réécrire : `CGU.tsx`, `CGV.tsx`, `CGVAbonnement.tsx`
- 1 fichier inchangé : `Confidentialite.tsx`
- Même structure UI (header, sections, footer PSE)
- Contenu aligné mot pour mot avec le PDF

