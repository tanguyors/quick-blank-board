# SomaGate — Guide Capacitor / TestFlight

## ✅ Déjà fait

- Capacitor 6 configuré avec `capacitor.config.ts`
- Plateforme iOS ajoutée dans `ios/`
- Scripts : `cap:sync`, `cap:ios`

## Commandes utiles

```bash
# Rebuild et synchroniser les assets web vers iOS
npm run cap:sync

# Ouvrir le projet dans Xcode (sur Mac uniquement)
npm run cap:ios
```

## Déploiement TestFlight (sur Mac)

### 1. Prérequis

- Compte Apple Developer (99 €/an)
- Xcode installé
- Mac (obligatoire pour compiler iOS)

### 2. Ouvrir le projet

```bash
npm run cap:sync
npm run cap:ios
```

### 3. Dans Xcode

1. Sélectionner le **Team** (votre compte Apple Developer)
2. Configurer **Signing & Capabilities**
3. Choisir un appareil ou simulateur pour tester
4. **Product → Archive**
5. **Distribute App → App Store Connect → Upload**
6. Dans **App Store Connect** : ajouter des testeurs TestFlight

### 4. Mise à jour après modification du code web

```bash
npm run cap:sync
# Puis dans Xcode : Product → Archive à nouveau
```

## Configuration

- **Bundle ID** : `com.somagate.app`
- **Web Dir** : `dist` (sortie Vite)
- **App Name** : SomaGate

## Live reload (optionnel)

Pour le dev avec rechargement à chaud, dans `capacitor.config.ts` :

```ts
server: {
  url: 'http://VOTRE_IP_LOCALE:8080',
  cleartext: true,
},
```

Puis lancer `npm run dev` et `npm run cap:ios`.
