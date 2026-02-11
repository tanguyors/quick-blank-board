# Guide SomaGate — Déploiement TestFlight

Guide étape par étape pour publier SomaGate sur TestFlight et le partager à vos clients.

---

## Avant de commencer

| Prérequis | Statut |
|-----------|--------|
| Compte Apple Developer (99 €/an) | [ ] |
| Mac avec Xcode installé | [ ] |
| Node.js 18+ | [ ] |

> **Sans Mac ?** Utilisez Codemagic, GitHub Actions (macOS), ou MacinCloud pour compiler dans le cloud.

---

## Étape 1 — Préparer le projet

```bash
cd c:\Users\orsin\Desktop\quick-blank-board
npm install
```

Vérifier que les dépendances Capacitor sont installées (`@capacitor/core`, `@capacitor/ios`, `@capacitor/cli`).

---

## Étape 2 — Build et synchronisation

```bash
npm run cap:sync
```

Cette commande :
- Lance `npm run build` (Vite)
- Copie le contenu de `dist/` vers le projet iOS
- Synchronise les plugins Capacitor

---

## Étape 3 — Ouvrir le projet dans Xcode (sur Mac)

```bash
npm run cap:ios
```

Le projet Xcode s’ouvre dans le dossier `ios/App/`.

---

## Étape 4 — Configuration Xcode

1. Sélectionner le projet **App** dans la barre latérale.
2. Aller dans **Signing & Capabilities**.
3. Choisir votre **Team** (compte Apple Developer).
4. Vérifier que **Automatically manage signing** est activé.
5. Vérifier le **Bundle Identifier** : `com.somagate.app`.

---

## Étape 5 — Tester sur simulateur ou appareil

1. Sélectionner un simulateur (ex. iPhone 15) ou connecter un iPhone.
2. Cliquer sur le bouton **Run** (▶) ou `Cmd + R`.
3. Vérifier que l’app se lance correctement.

---

## Étape 6 — Créer l’archive pour TestFlight

1. Menu **Product** → **Archive**.
2. Attendre la fin de la création de l’archive.
3. La fenêtre **Organizer** s’ouvre.
4. Cliquer sur **Distribute App**.
5. Choisir **App Store Connect** → **Next**.
6. **Upload** → **Next**.
7. Laisser les options par défaut → **Next**.
8. Choisir les certificats et profils → **Next**.
9. **Upload** → attendre la fin de l’upload.

---

## Étape 7 — Configurer dans App Store Connect

1. Aller sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com).
2. **Mes apps** → cliquer sur **+** pour créer une app (ou utiliser une app existante).
3. Renseigner :
   - **Nom** : SomaGate
   - **Langue principale** : Français ou Anglais
   - **Bundle ID** : `com.somagate.app`
   - **SKU** : `somagate` (identifiant unique)
4. Après le traitement de l’archive (15–60 min), aller dans l’onglet **TestFlight**.
5. Ajouter des **testeurs** (e‑mails de vos clients).
6. Les testeurs reçoivent une invitation et peuvent installer l’app via l’app **TestFlight**.

---

## Étape 8 — Mettre à jour l’app après modifications

À chaque modification du code web :

```bash
npm run cap:sync
npm run cap:ios
```

Puis dans Xcode : **Product → Archive** et **Distribute App** comme à l’étape 6.

---

## Checklist finale avant envoi

- [ ] Icône 1024×1024 prête (pour App Store si besoin)
- [ ] URL de politique de confidentialité (recommandé)
- [ ] Version incrémentée dans `package.json` à chaque release
- [ ] Tests manuels sur un appareil réel

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Erreur de signature | Vérifier Team et certificats dans Xcode |
| Build échoue | `npm run cap:sync` puis rouvrir Xcode |
| App blanche au lancement | Vérifier que `dist/` contient `index.html` et les assets |
| TestFlight ne reçoit pas l’app | Attendre 30–60 min après l’upload |

---

## Résumé des commandes

| Commande | Description |
|----------|-------------|
| `npm run cap:sync` | Build + copie des assets vers iOS |
| `npm run cap:ios` | Ouvre le projet dans Xcode |
| `npm run build` | Build web uniquement |
| `npm run dev` | Serveur de développement |
