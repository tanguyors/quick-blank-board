# 09 — PWA, Mobile & Capacitor

## Progressive Web App (PWA)

### Configuration (`vite.config.ts`)

```typescript
VitePWA({
  registerType: "autoUpdate",
  includeAssets: ["favicon.ico", "logo-soma.png"],
  manifest: {
    name: "SomaGate",
    short_name: "SomaGate",
    description: "Swipe, match & secure your next property in Indonesia",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#f97316",
    orientation: "portrait-primary",
    categories: ["real-estate", "business", "lifestyle"],
    icons: [
      { src: "/logo-soma.png", sizes: "192x192", type: "image/png" },
      { src: "/logo-soma.png", sizes: "512x512", type: "image/png" },
      { src: "/logo-soma.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],
    runtimeCaching: [{
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-api",
        expiration: { maxEntries: 50, maxAgeSeconds: 300 },
      },
    }],
  },
})
```

### Comportement
- **Auto-update** : le service worker se met à jour automatiquement
- **Cache API Supabase** : NetworkFirst avec 5 minutes d'expiration, max 50 entrées
- **Cache statique** : tous les assets (JS, CSS, images, fonts)

### Manifest (`public/manifest.json`)
```json
{
  "name": "SomaGate",
  "short_name": "SomaGate",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#f97316",
  "orientation": "portrait-primary",
  "categories": ["real-estate", "business", "lifestyle"]
}
```

---

## Bouton d'Installation PWA (`PwaInstallFloat.tsx`)

### Comportement Android/Chrome
1. Écoute l'événement `beforeinstallprompt`
2. Affiche un bouton flottant "Installer" en bas à droite
3. Au clic : déclenche `deferredPrompt.prompt()`
4. Se masque après installation ou dismiss

### Comportement iOS
1. Détecte iOS via User Agent
2. Au clic : affiche un guide étape par étape
   - "Appuyez sur Partager"
   - "Faites défiler et appuyez sur Sur l'écran d'accueil"
   - "Appuyez sur Ajouter"
3. Fermeture du guide → dismiss

### Conditions d'Affichage
- Pas déjà dismissé (session storage)
- Pas déjà en mode standalone
- Délai de 800ms pour une entrée fluide

---

## Capacitor (iOS Natif)

### Configuration (`capacitor.config.ts`)

```typescript
const config: CapacitorConfig = {
  appId: 'com.somagate.app',
  appName: 'SomaGate',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
  },
};
```

### Structure iOS
```
ios/
├── App/
│   ├── App.xcodeproj/         # Projet Xcode
│   ├── App/
│   │   ├── AppDelegate.swift  # Point d'entrée iOS
│   │   ├── Info.plist         # Configuration app
│   │   ├── Assets.xcassets/   # Icônes + Splash
│   │   └── Base.lproj/       # Storyboards (Launch + Main)
│   └── CapApp-SPM/           # Swift Package Manager
└── debug.xcconfig             # Config debug
```

### Build iOS
```bash
npm run build          # Build Vite
npx cap sync ios       # Sync avec Capacitor
# Ouvrir dans Xcode et build/run
```

### Packages Capacitor
- `@capacitor/core` v6.1
- `@capacitor/ios` v6.1
- `@capacitor/cli` v6.1 (dev)

---

## Design Responsive

### Breakpoints
- **Mobile** (< 1024px) : BottomNav visible, Sidebar masquée
- **Desktop** (≥ 1024px / `lg:`) : Sidebar visible, BottomNav masquée

### Bottom Nav (`BottomNav.tsx`)
- Position fixe en bas
- `pb-safe` pour le safe area iOS
- `lg:hidden` → masquée sur desktop
- Navigation par rôle (buyer, owner, notaire, admin)

### Sidebar (`AppSidebar.tsx`)
- Position sticky, hauteur 100vh
- `hidden lg:flex` → visible uniquement sur desktop
- Navigation complète + footer (langue, profil, thème, déconnexion)

### Safe Areas
```css
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1" />
```
