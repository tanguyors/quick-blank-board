# Guide TestFlight — SomaGate (pour Mac)

Ce document explique **pourquoi** chaque étape existe et **comment** la réaliser, pour déployer l’application **SomaGate** sur **TestFlight** (bêta iOS officielle d’Apple).

**Contexte technique :** le projet est une app web (Vite + React) emballée dans une coque native iOS avec **Capacitor 6**. Le dossier `ios/` contient le projet Xcode. L’identifiant de bundle configuré est **`com.somagate.app`**.

---

## 1. Ce qui doit être en place avant tout (côté équipe)

| Élément | Pourquoi c’est nécessaire |
|--------|---------------------------|
| **Compte Apple Developer** (programme payant, environ 99 € / an) | Sans lui, impossible de signer l’app pour un appareil réel ni d’envoyer un build sur TestFlight. |
| **Un Mac avec Xcode** | Apple exige les outils de compilation iOS sur macOS ; Windows ne suffit pas pour cette partie. |
| **Accès au code** (Git : clone, pull) | Pour récupérer la même version que celle validée par l’équipe. |
| **Un rôle sur App Store Connect** | Au minimum **App Manager** ou **Admin** (ou le compte qui possède l’app), pour créer l’app et gérer TestFlight. |

**À prévoir dans App Store Connect (pas dans Xcode seul) :**

- Créer l’enregistrement de l’app avec le **même Bundle ID** : `com.somagate.app`.
- Renseigner une **URL de politique de confidentialité** (souvent obligatoire pour soumettre / tester).
- Plus tard, pour la fiche App Store : **captures d’écran** aux tailles demandées par Apple ; pour TestFlight interne, l’essentiel est souvent le build + les métadonnées minimales.

---

## 2. Vérifier l’état du projet dans le dépôt (déjà fait côté code)

- **Capacitor** : `capacitor.config.ts` définit `appId: com.somagate.app`, `appName: SomaGate`, `webDir: dist`.
- **Xcode** : signature en **Automatic**, iOS **15.0** minimum, versions **1.0** (marketing) et **build 1** dans le projet (à incrémenter à chaque nouvel envoi du même numéro de version marketing si Apple le demande).
- **Icône** : jeu d’icônes avec entrée **1024×1024** (requis par Apple pour la distribution).
- **Géolocalisation** : texte d’autorisation présent dans `Info.plist` pour la carte (écran Explore).
- **Notifications push** : plugin `@capacitor/push-notifications`, pont APNs dans `AppDelegate.swift`, fichiers d’**entitlements** (`App.debug` / `App.release` avec `aps-environment`), mode arrière-plan `remote-notification` dans `Info.plist`. L’app enregistre le jeton dans Supabase (`profiles.apns_device_token`) après connexion si l’utilisateur a activé les notifications push dans ses préférences.

**Sur le Mac, avant chaque archive :** toujours régénérer le web et synchroniser Capacitor (`npm run cap:sync`), pour que le dossier `public` dans Xcode contienne le dernier `dist/`.

---

## 3. Installation sur le MacBook

### 3.1 Xcode

1. Ouvrir l’**App Store** sur le Mac.
2. Chercher **Xcode** et l’installer (plusieurs gigaoctets, prévoir du temps).
3. Au premier lancement, accepter les licences et laisser installer les **composants additionnels** si Xcode le propose.

**Pourquoi :** Xcode contient le compilateur Swift, les simulateurs et l’outil d’**archive** / upload vers App Store Connect.

### 3.2 Node.js (LTS)

1. Installer **Node.js** version **18 ou supérieure** (site [nodejs.org](https://nodejs.org/) ou via `nvm` si vous l’utilisez déjà).
2. Vérifier dans le Terminal : `node -v` et `npm -v`.

**Pourquoi :** les commandes `npm install` et `npm run cap:sync` viennent du monde JavaScript ; le build web (`vite build`) s’exécute via npm.

### 3.3 Git

Si le projet est sur GitHub/GitLab : installer ou utiliser **Git** (`git --version`), configurer clé SSH ou HTTPS selon votre équipe.

---

## 4. Récupérer le projet et préparer un build iOS

Dans le **Terminal** (répertoire de travail au choix, par ex. `~/projets`) :

```bash
git clone <URL_DU_DEPOT>
cd quick-blank-board
npm install
npm run cap:sync
```

**Explication ligne par ligne :**

- `git clone` : copie exacte du dépôt (même code que Windows après un `git pull` récent).
- `npm install` : installe les dépendances listées dans `package.json` (dont Capacitor).
- `npm run cap:sync` : exécute enchaîné **`npm run build`** (génère le dossier `dist/`) puis **`npx cap sync`**, qui copie `dist` vers le projet iOS et met à jour les fichiers natifs nécessaires.

Si une erreur apparaît ici, corriger avant d’ouvrir Xcode (souvent : mauvaise version de Node, ou dépendances non installées).

---

## 5. Ouvrir le projet dans Xcode

```bash
npm run cap:ios
```

Ou manuellement : ouvrir le fichier  
`ios/App/App.xcodeproj`  
(double-clic ou **File → Open** dans Xcode).

**Pourquoi :** on ne compile pas l’app iOS avec `npm` seul ; **Xcode** orchestre la compilation Swift, les frameworks et la signature.

---

## 6. Compte développeur et signature (Signing)

1. Dans Xcode, sélectionner le projet **App** dans le navigateur de gauche, puis la cible **App** → onglet **Signing & Capabilities**.
2. Cocher **Automatically manage signing** si ce n’est pas déjà fait.
3. Dans **Team**, choisir l’équipe liée au **compte Apple Developer** de la société (ou un compte invité avec les bons droits).

**Pourquoi :** Apple attache chaque build à une **identité de signature** ; sans équipe valide, l’archive pour App Store échoue.

**Si le Bundle ID est déjà pris par un autre compte :** il faudrait soit utiliser le bon compte Apple, soit changer l’`appId` dans `capacitor.config.ts` et dans Xcode **en accord avec** App Store Connect — ce n’est pas anodin, à éviter en cours de route sans coordination.

### 6.1 Notifications push (APNs) — ce que votre associé doit savoir

Le dépôt inclut déjà la **capability** côté projet (fichiers `.entitlements` avec `aps-environment` : *development* en Debug, *production* en Release / TestFlight). Dans Xcode, l’onglet **Signing & Capabilities** doit afficher **Push Notifications** (si ce n’est pas le cas : **+ Capability** → **Push Notifications**). Sans cela, l’app ne peut pas recevoir de jeton APNs valide.

**Côté compte Apple Developer (une fois par équipe / app) :**

1. Sur [developer.apple.com](https://developer.apple.com/account) → **Certificates, Identifiers & Profiles**.
2. Pour envoyer des pushes depuis **vos serveurs** (ex. Edge Function Supabase), créer une **Key** de type **Apple Push Notifications service (APNs)** (fichier `.p8`), noter le **Key ID** et le **Team ID**.
3. Associer cette clé à l’identifiant d’app **`com.somagate.app`** si demandé.

**Pourquoi :** le téléphone reçoit un **jeton d’appareil** (stocké en base par l’app). L’Edge Function **`send-push`** envoie la notification à Apple (API HTTP/2) lorsque le jeton et les secrets sont configurés.

**Secrets Supabase (Project Settings → Edge Functions → Secrets)** à renseigner après création de la clé APNs (`.p8`) :

| Secret | Description |
|--------|-------------|
| `APNS_KEY_ID` | Key ID affiché à la création de la clé APNs |
| `APNS_TEAM_ID` | Team ID Apple (page Membership) |
| `APNS_PRIVATE_KEY` | Contenu PEM complet de la clé (lignes `-----BEGIN PRIVATE KEY-----` …) ; dans le dashboard, coller avec de **vrais retours à la ligne** ou des `\n` échappés |
| `APNS_BUNDLE_ID` | Optionnel, défaut : `com.somagate.app` |
| `APNS_USE_SANDBOX` | Mettre `true` seulement pour tester avec un build **Debug** (jeton *development*) ; **TestFlight / App Store** = `false` ou absent (serveur `api.push.apple.com`) |

**TestFlight :** les builds Release utilisent l’environnement APNs **production** (`App.release.entitlements`). Les binaires de développement branchés sur Mac / iPhone en debug utilisent **development** — dans ce cas, activer **`APNS_USE_SANDBOX=true`** pour que l’Edge Function parle à `api.sandbox.push.apple.com`, sinon Apple renverra une erreur (mauvais environnement pour le jeton).

**Migration base de données :** après `git pull`, appliquer les migrations Supabase (colonne `profiles.apns_device_token`). Sans cette colonne, l’enregistrement du jeton côté app échouera silencieusement ou avec erreur SQL.

---

## 7. Choisir la bonne destination et créer une archive

1. En haut de Xcode, à côté du bouton **Run**, ouvrir le menu de destination.
2. Choisir **Any iOS Device (arm64)** ou un **appareil iOS physique** branché.  
   **Ne pas** archiver avec uniquement un simulateur sélectionné comme destination principale pour la distribution (les habitudes peuvent varier ; l’important est d’utiliser **Product → Archive** avec une config de type appareil générique / device).

3. Menu **Product → Archive**.

**Pourquoi :** une **archive** est un paquet signé prêt pour App Store Connect ; ce n’est pas un simple « Run » en mode Debug.

**Si Archive est grisé :** vérifier la sélection de schéma **App** et la destination (souvent « Any iOS Device »).

---

## 8. Envoyer le build sur App Store Connect

Quand l’archive est terminée, la fenêtre **Organizer** s’ouvre (sinon : **Window → Organizer**).

1. Sélectionner l’archive récente.
2. Cliquer **Distribute App**.
3. Choisir **App Store Connect** → **Upload** (pas « Ad Hoc » pour TestFlight standard).
4. Laisser les options par défaut sauf indication contraire de l’équipe (symboles bitcode, etc. — souvent laisser les cases recommandées).
5. Suivre l’assistant jusqu’à la fin ; Xcode envoie le fichier **.ipa** aux serveurs Apple.

**Pourquoi :** TestFlight ne reçoit des builds que via ce pipeline (ou outils comme **Transporter** pour le même fichier).

**Délai :** le traitement côté Apple prend souvent **15 à 60 minutes** (parfois plus). Le build apparaît ensuite sous **App Store Connect → votre app → TestFlight**.

---

## 9. Configurer TestFlight dans App Store Connect

1. Aller sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com) et se connecter avec le compte autorisé.
2. **Mes apps** → application **SomaGate** (à créer au préalable si elle n’existe pas, avec Bundle ID `com.somagate.app`).
3. Onglet **TestFlight** :
   - Attendre que le build passe de « Traitement » à **prêt à tester**.
   - Renseigner les **informations de test** si Apple les demande (notes pour les testeurs, conformité export, etc.).
4. **Testeurs internes** : membres de l’équipe App Store Connect (rapide, souvent sans revue Apple).
5. **Testeurs externes** : groupes de testeurs avec email ; peut nécessiter une **revue bêta** d’Apple (quelques heures à quelques jours).

**Pourquoi :** TestFlight est une couche au-dessus des builds ; sans testeurs ajoutés, personne ne reçoit l’invitation.

Les testeurs installent l’app **TestFlight** depuis l’App Store, puis acceptent l’invitation par lien ou email.

---

## 10. Prochaines mises à jour (versions suivantes)

À chaque nouveau dépôt à tester :

1. `git pull`
2. `npm install` (si `package.json` a changé)
3. `npm run cap:sync`
4. Dans Xcode, **incrémenter le numéro de build** (`CURRENT_PROJECT_VERSION` / champ **Build**), et si besoin la **version marketing** (ex. 1.0.1).
5. Nouvelle **Archive** → **Upload**.

**Pourquoi :** Apple refuse souvent de traiter un nouveau fichier si le **build number** n’a pas augmenté pour une même chaîne de soumission.

---

## 11. Problèmes fréquents

| Symptôme | Piste |
|----------|--------|
| Erreur de signature | Vérifier **Team**, certificats valides, et que le Bundle ID correspond à App Store Connect. |
| « Invalid Binary » / rejet après upload | Consulter l’email Apple ou la résolution dans App Store Connect ; souvent métadonnées manquantes ou crash au lancement. |
| Écran blanc au lancement | Oublier `npm run cap:sync` après des changements web — le `dist` dans l’app iOS est alors obsolète. |
| Carte sans position | L’utilisateur doit accepter la permission ; le texte légal est dans `Info.plist`. |
| Pas de jeton push / erreur APNs | Vérifier la capability **Push Notifications**, les **entitlements** (Debug vs Release), et sur le compte développeur la clé APNs si vous envoyez depuis un serveur. |

---

## 12. Résumé ultra-court

1. Compte **Apple Developer** + **App Store Connect** avec l’app `com.somagate.app`.
2. Sur le Mac : **Xcode** + **Node.js**.
3. `git clone` → `npm install` → **`npm run cap:sync`**.
4. Ouvrir **`ios/App/App.xcodeproj`**, régler **Signing**.
5. **Product → Archive** → **Distribute → App Store Connect → Upload**.
6. Dans **TestFlight**, attendre le build, puis ajouter des testeurs.

En cas de doute sur le Bundle ID ou le compte Apple à utiliser, se synchroniser avec la personne qui gère le compte développeur avant le premier upload.

---

*Document basé sur l’état du dépôt SomaGate / quick-blank-board (Capacitor 6, bundle `com.somagate.app`).*
