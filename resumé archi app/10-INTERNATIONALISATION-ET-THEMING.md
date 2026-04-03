# 10 — Internationalisation & Theming

## Internationalisation (i18n)

### Configuration (`src/i18n/index.ts`)

```typescript
i18n
  .use(LanguageDetector)      // Détection auto (localStorage > navigator)
  .use(initReactI18next)
  .init({
    resources: { fr, en, id, es, de, nl, ru, zh },
    fallbackLng: 'fr',         // Français par défaut
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });
```

### Langues Supportées (8)

| Code | Langue | Drapeau |
|---|---|---|
| `fr` | Français | 🇫🇷 |
| `en` | English | 🇬🇧 |
| `id` | Bahasa Indonesia | 🇮🇩 |
| `es` | Español | 🇪🇸 |
| `de` | Deutsch | 🇩🇪 |
| `nl` | Nederlands | 🇳🇱 |
| `ru` | Русский | 🇷🇺 |
| `zh` | 中文 | 🇨🇳 |

### Fichiers de Traduction
- `src/i18n/locales/{code}.json`
- Structure à plat avec namespaces implicites (ex: `home.heroTitle`, `nav.dashboard`, `explore.filters`)

### Sélecteur de Langue (`LanguageSelector.tsx`)
- Dropdown compact ou full
- Disponible dans la sidebar et la page d'accueil
- Change la langue et persiste dans localStorage

### Préférence Utilisateur
- Le profil a un champ `preferred_language` (default 'fr')
- Sauvegardé en base pour la persistance cross-device

---

## Theming (Light/Dark Mode)

### ThemeContext (`src/contexts/ThemeContext.tsx`)

```typescript
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
```

### Fonctionnement
1. Initialisation : lecture de `localStorage.getItem('theme')` ou default `'light'`
2. Applique la classe `light` ou `dark` sur `document.documentElement`
3. Persiste dans `localStorage`
4. Tailwind utilise la classe pour le mode sombre

### ThemeToggle (`ThemeToggle.tsx`)
- Bouton dans la sidebar (desktop)
- Icône soleil/lune
- Toggle entre `light` et `dark`

### Design Tokens (CSS HSL Variables)

Définis dans `src/index.css` :

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --primary: 24.6 95% 53.1%;         /* Orange #f97316 */
  --primary-foreground: 60 9.1% 97.8%;
  --secondary: 60 4.8% 95.9%;
  --muted: 60 4.8% 95.9%;
  --accent: 60 4.8% 95.9%;
  --destructive: 0 84.2% 60.2%;
  --border: 20 5.9% 90%;
  --ring: 24.6 95% 53.1%;
  /* ... */
}

.dark {
  --background: 20 14.3% 4.1%;
  --foreground: 60 9.1% 97.8%;
  --card: 20 14.3% 4.1%;
  --primary: 20.5 90.2% 48.2%;
  /* ... */
}
```

### Palette Principale

| Token | Light | Dark | Usage |
|---|---|---|---|
| `background` | Blanc | Quasi-noir | Fond principal |
| `foreground` | Quasi-noir | Quasi-blanc | Texte principal |
| `primary` | Orange vif | Orange chaud | CTA, accents, liens actifs |
| `card` | Blanc | Quasi-noir | Cartes, conteneurs |
| `border` | Gris très clair | Gris foncé | Bordures |
| `muted` | Gris clair | Gris foncé | Texte secondaire |
| `destructive` | Rouge | Rouge | Erreurs, suppression |

### Règle Stricte
Tous les composants utilisent les tokens Tailwind (`bg-background`, `text-foreground`, `border-border`, etc.). **Aucune couleur directe** (pas de `bg-white`, `text-black`, etc.) pour garantir la compatibilité dark mode.

---

## Composants UI (shadcn/ui)

### 40+ composants installés

Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, InputOTP, Input, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toast, Toggle, ToggleGroup, Tooltip

### Configuration (`components.json`)
- Style : `default`
- RSC : `false`
- Tailwind config : `tailwind.config.ts`
- Aliases : `@/components`, `@/lib/utils`, `@/hooks`

### Utilitaire `cn()`
```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
