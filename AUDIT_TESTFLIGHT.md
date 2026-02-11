# 🔍 Audit complet — Déploiement TestFlight — SomaGate

**Date :** 11 février 2025  
**Application :** SomaGate (Vite + React + Supabase)  
**Objectif :** Préparer le déploiement sur TestFlight pour présentation aux clients

---

## ⚠️ Point critique : nature de l’application

**SomaGate est aujourd’hui une application web (PWA).**

TestFlight sert uniquement à distribuer des applications **natives iOS** (et iPadOS, macOS, watchOS, tvOS). Une PWA ne peut pas être déployée directement sur TestFlight.

### Options

| Option | Description | TestFlight | Complexité |
|--------|-------------|------------|------------|
| **A. Capacitor** | Encapsuler le web dans un wrapper natif iOS | ✅ Oui | Moyenne |
| **B. PWA déployée** | Publier le site et partager le lien | ❌ Non | Faible |
| **C. Lien direct** | Héberger sur Vercel/Netlify et envoyer l’URL | ❌ Non | Faible |

---

## Option recommandée : intégration Capacitor

> **Note importante (Windows)** : Si vous n’avez pas de Mac, vous pouvez utiliser :
> - **Codemagic** ou **GitHub Actions** (runner `macos-latest`) — build iOS dans le cloud
> - Un Mac physique ou virtuel (MacStadium, MacinCloud)

Pour utiliser TestFlight, il faut transformer la web app en application native iOS avec **Capacitor** (Ionic).

### Prérequis

- [ ] **Compte Apple Developer** (99 €/an)
- [ ] **Mac** avec Xcode — ⚠️ **Vous êtes sous Windows** : le build iOS natif nécessite obligatoirement un Mac (ou un service cloud type MacStadium, Codemagic, GitHub Actions avec runner macOS)
- [ ] **Node.js** 18+

---

## Audit détaillé — état actuel

### 1. Configuration projet

| Élément | État | Détails |
|--------|------|---------|
| **Framework** | ✅ | Vite 5 + React 18 |
| **PWA** | ✅ | vite-plugin-pWA, manifest, workbox |
| **Supabase** | ✅ | Auth, DB, storage |
| **Routing** | ⚠️ | `BrowserRouter` — à adapter pour Capacitor (voir point 4) |
| **Version** | ⚠️ | `0.0.0` dans package.json — à définir pour App Store |

### 2. Sécurité et données sensibles

| Point | État | Action |
|-------|------|--------|
| **Clés Supabase** | ⚠️ | Clés `anon` hardcodées dans `client.ts` — OK côté client, mais le fichier est auto-généré |
| **.env** | ✅ | `.env` existe, `VITE_*` non utilisés dans le code généré — vérifier la chaîne de génération |
| **.gitignore** | ✅ | `dist`, `*.local` exclus |

### 3. PWA / manifest

| Élément | État | Détails |
|--------|------|---------|
| **Nom** | ✅ | SomaGate |
| **Icônes** | ⚠️ | Une seule source (`logo-soma.png`) — App Store requiert plusieurs tailles (1024×1024, etc.) |
| **start_url** | ✅ | `/` |
| **display** | ✅ | `standalone` |
| **orientation** | ✅ | `portrait-primary` |

### 4. Points techniques pour Capacitor

| Point | Problème | Solution |
|-------|----------|----------|
| **Routing** | `BrowserRouter` avec History API peut poser problème sur `capacitor://` | Utiliser `HashRouter` ou configurer `basename` + fallback serveur |
| **Assets** | Chemins relatifs `/` | Capacitor sert les fichiers localement — vérifier les chemins absolus |
| **Supabase Auth** | `localStorage` | Compatible Capacitor |
| **Leaflet** | Carte externe | Vérifier les CORS et le comportement en mode natif |

### 5. Checklist App Store Connect / TestFlight

- [ ] **Identifiant d’app** (bundle ID) : ex. `com.somagate.app`
- [ ] **Nom affiché** : SomaGate
- [ ] **Privacy Policy URL** — requis pour TestFlight
- [ ] **Captures d’écran** : iPhone 6.7", 6.5", 5.5" (obligatoires)
- [ ] **Icône 1024×1024** sans coins arrondis (Apple les ajoute)
- [ ] **Description** pour les testeurs
- [ ] **Informations de contact** pour l’assistance testeurs

### 6. Dépendances système

- **Supabase** : URLs en HTTPS — pas de blocage iOS
- **Leaflet** : Compatible mobile
- **Push** : `send-push` Edge Function — nécessite un certificat APNs dans Supabase

---

## Plan d’action — TestFlight avec Capacitor

### Phase 1 : préparation (1–2 h)

1. Créer un compte Apple Developer si besoin
2. Installer Capacitor :
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios
   npx cap init "SomaGate" "com.somagate.app"
   ```
3. Configurer `capacitor.config.ts` :
   - `server.url` pour le dev en live reload
   - `webDir` : `"dist"`
4. Mettre à jour `package.json` : `"version": "1.0.0"`

### Phase 2 : build et intégration (2–3 h)

1. Build production : `npm run build`
2. Ajouter la plateforme iOS : `npx cap add ios`
3. Copier les assets : `npx cap sync`
4. Vérifier le routing (HashRouter ou basename) pour éviter les 404
5. Tester dans le simulateur : `npx cap open ios`

### Phase 3 : configuration Xcode (1–2 h)

1. Ouvrir le projet dans Xcode
2. Configurer le **Team** et le **Signing**
3. Définir les **capabilities** : Push Notifications, App Transport Security, etc.
4. Générer les **certificats** et **profils de provisionnement**
5. Changer le **bundle identifier** si nécessaire

### Phase 4 : soumission TestFlight (≈ 1 h)

1. Créer l’app dans App Store Connect
2. Archiver et exporter pour distribution
3. Upload via Xcode (Organizer) ou Transporter
4. Attendre le traitement (15–60 min)
5. Ajouter des testeurs internes ou externes

---

## Recommandations avant déploiement

1. **Version** : définir `1.0.0` (ou `0.1.0` pour beta) dans `package.json`
2. **Icônes** : générer une icône 1024×1024 dédiée App Store
3. **Privacy Policy** : créer une page et l’indiquer dans App Store Connect
4. **URLs de démo** : s’assurer que Supabase pointe vers l’environnement de production
5. **Tests** : vérifier auth, swipe, messages, cartes sur simulateur et appareil réel

---

## Alternative rapide : PWA sans TestFlight

Si le but est surtout de **montrer l’app à des clients** sans passer par TestFlight :

1. Déployer sur **Vercel**, **Netlify** ou **Lovable**
2. Partager le lien (ex. `https://somagate.vercel.app`)
3. Sur iOS : Safari → Partager → « Sur l’écran d’accueil »
4. L’app s’installe comme une PWA et se comporte comme une app native

Avantages : pas de compte Apple Developer, pas de build natif, mise à jour immédiate.

---

## Résumé

| Critère | Statut |
|---------|--------|
| **Déploiement TestFlight direct** | ❌ Non possible (app web) |
| **Solution Capacitor** | ✅ Possible, nécessite Mac + compte Apple Developer |
| **PWA pour démo rapide** | ✅ Prête (build + hébergement suffisent) |
| **Préparation code** | ⚠️ Quelques adaptations (version, routing si Capacitor) |

---

---

## ✅ Capacitor configuré (11 fév 2025)

- [x] `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios` installés
- [x] `capacitor.config.ts` créé (appId: com.somagate.app)
- [x] Plateforme iOS ajoutée (`ios/` généré)
- [x] Scripts npm : `cap:sync`, `cap:ios`

**Prochaines étapes (sur Mac) :**
1. `npm run cap:sync` — build + copie des assets
2. `npm run cap:ios` — ouvre Xcode
3. Dans Xcode : configurer le Team, Signing, puis Product → Archive → Distribute App → TestFlight

---
*Audit généré pour le projet SomaGate — Quick Blank Board*
