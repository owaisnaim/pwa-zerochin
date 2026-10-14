<div align="center">
  <h1>pwa-zerochin</h1>
  <p><strong>Intelligent mode-aware viewport engine for Progressive Web Apps.</strong><br>
  Zero black chins in standalone PWA. Zero toolbar clipping in mobile browser tabs.</p>

  <p>
    <a href="https://www.npmjs.com/package/pwa-zerochin"><img src="https://img.shields.io/npm/v/pwa-zerochin.svg?style=flat-square&color=black" alt="npm version"></a>
    <a href="https://github.com/owaisnaim/pwa-zerochin/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-black.svg?style=flat-square" alt="license"></a>
    <img src="https://img.shields.io/badge/size-%3C1KB-black.svg?style=flat-square" alt="bundle size">
    <img src="https://img.shields.io/badge/dependencies-0-black.svg?style=flat-square" alt="zero dependencies">
    <img src="https://img.shields.io/badge/TypeScript-Ready-black.svg?style=flat-square" alt="typescript ready">
  </p>
</div>

---

## 💥 The Dilemma Every PWA Faces

Building a full-screen mobile web app or PWA often leaves developers trapped between two frustrating bugs:

```
      Traditional 100vh                    Modern 100dvh
   (Mobile Browser Tab)               (iOS Standalone PWA)

  ┌────────────────────┐              ┌────────────────────┐
  │      Top Bar       │              │    Dynamic Island  │
  ├────────────────────┤              ├────────────────────┤
  │                    │              │                    │
  │                    │              │                    │
  │     Video / UI     │              │     Video / UI     │
  │                    │              │                    │
  │ ░░░░░░░░░░░░░░░░░░ │              ├────────────────────┤
  ├────────────────────┤              │ █ BLACK CHIN GAP █ │ <── WebKit dvh bug!
  │ [Browser Toolbar]  │              └────────────────────┘
  └────────────────────┘                  (Home Indicator)
   (Buttons clipped!)
```

1. **Bug #1: The Browser Toolbar Cutoff (`100vh`)**
   In normal Safari and Chrome mobile browser tabs, CSS `100vh` calculates height as the *Large Viewport* (`100lvh`), which ignores the browser's bottom navigation bar (~60–84px tall). Your bottom controls, action buttons, and scrubbers end up **hidden behind the browser UI**.

2. **Bug #2: The PWA "Black Chin" (`100dvh`)**
   To fix Bug #1, you switch to `100dvh`. But when a user installs your PWA to their iOS Home Screen, WebKit treats the bottom home indicator / safe area as a dynamic bar. It shrinks the viewport and leaves an **ugly empty black chin/gap at the bottom** of the OLED screen instead of going full-bleed!

---

## ⚡ The Solution: `pwa-zerochin`

`pwa-zerochin` dynamically balances the viewport based on the operating environment:

* 📱 **Installed PWA Standalone Mode**: Automatically locks strictly to **`100vh`** $\rightarrow$ **ZERO black chin, 100% full-bleed OLED coverage.**
* 🌐 **Mobile Browser Tabs (Safari & Chrome)**: Automatically adapts to **`100dvh`** $\rightarrow$ **ZERO toolbar clipping, all buttons sit flush above the browser bar.**

---

## 📦 Installation

```bash
npm install pwa-zerochin
# or
pnpm add pwa-zerochin
# or
yarn add pwa-zerochin
```

---

## 🚀 Quick Start

### 1. React / Vite / Next.js

Import the reactive hook directly into your components:

```tsx
import { usePwaZeroChin } from 'pwa-zerochin/react';

export default function App() {
  const { isStandalone, vhUnit, vhValue } = usePwaZeroChin();

  return (
    <div
      style={{ height: vhValue }} // '100vh' in PWA, '100dvh' in browser
      className="w-full bg-black text-white overflow-hidden"
    >
      <main className="h-full flex flex-col justify-between">
        <header>Top Bar</header>
        {/* Guaranteed to sit flush above browser bar OR fill PWA edge-to-edge */}
        <footer className="p-4">Bottom Action Dock</footer>
      </main>
    </div>
  );
}
```

### 2. CSS Custom Variables & Utilities

Import the stylesheet in your root file (`main.tsx`, `index.js`, or `globals.css`):

```ts
import 'pwa-zerochin/styles.css';
```

Use the built-in classes or CSS custom variables:

```html
<!-- Full viewport container (Mode-aware) -->
<div class="h-pwa w-full overflow-hidden">
  ...
</div>

<!-- Half-height split screen (e.g. bottom sheet comments or modals) -->
<div class="h-pwa-half w-full">
  ...
</div>
```

Or reference the CSS variables directly in your own CSS:
```css
.my-container {
  height: var(--pwa-vh);      /* 100vh in PWA | 100dvh in browser */
  max-height: var(--pwa-vh);
}

.my-bottom-sheet {
  height: var(--pwa-half-vh); /* 50vh in PWA | 50dvh in browser */
}
```

### 3. Vanilla JavaScript / HTML

Call `initPwaZeroChin()` as early as possible in your application:

```ts
import { initPwaZeroChin, isStandalone } from 'pwa-zerochin';

// Sets up CSS variables and dynamic media-query listeners
initPwaZeroChin();

if (isStandalone()) {
  console.log('Running as installed PWA (Zero chin active)');
}
```

---

## 🛡️ Zero-Flash Pre-Mount Script

To eliminate any 1-frame layout shift or visual chin jump before React/Vue/JS hydrates, add this tiny inline snippet to your `<head>`:

### In Plain HTML (`index.html`):
```html
<head>
  <script>
    !(function(){try{var s=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||(window.navigator&&window.navigator.standalone===true);var d=document.documentElement;if(s){d.classList.add('is-standalone');d.style.setProperty('--pwa-vh','100vh');d.style.setProperty('--pwa-half-vh','50vh')}else{d.style.setProperty('--pwa-vh','100dvh');d.style.setProperty('--pwa-half-vh','50dvh')}}catch(e){}})();
  </script>
</head>
```

### In Next.js (App Router `app/layout.tsx`):
```tsx
import { ZeroChinHeadScript } from 'pwa-zerochin/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ZeroChinHeadScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🎨 Tailwind CSS Integration

You can easily reference `--pwa-vh` in Tailwind CSS:

```html
<div className="h-[var(--pwa-vh,100vh)] w-full">
  ...
</div>
```

Or extend your `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      height: {
        pwa: 'var(--pwa-vh, 100vh)',
        'pwa-half': 'var(--pwa-half-vh, 50vh)',
      },
    },
  },
};
```

Now you can simply use:
```html
<div class="h-pwa w-full">
  <!-- 100vh in PWA, 100dvh in browser tab -->
</div>
```

---

## 🔍 API Reference

### JavaScript / TypeScript Core

| Export | Type | Description |
| :--- | :--- | :--- |
| `isStandalone()` | `() => boolean` | Universally detects PWA standalone mode across iOS WebKit, Chromium, Android TWA, and Windows PWA. |
| `initPwaZeroChin(options?)` | `() => () => void` | Applies CSS variables, attaches `.is-standalone` class, sets up change listeners, and returns cleanup function. |
| `getZeroChinSnippet(options?)` | `() => string` | Returns the raw minified `<script>` string for `<head>` pre-mount injection. |

### React Integration (`pwa-zerochin/react`)

| Export | Type | Description |
| :--- | :--- | :--- |
| `useIsStandalone()` | `() => boolean` | SSR-safe reactive hook tracking PWA standalone state. |
| `usePwaZeroChin()` | `() => PwaZeroChinState` | All-in-one hook returning `{ isStandalone, vhUnit, vhValue, halfVhValue, style }`. |
| `<ZeroChinHeadScript />` | `React.FC` | Pre-mount `<script>` tag component for Next.js or React `<head>`. |

### CSS Variables

| Variable | PWA Standalone | Mobile Browser Tab |
| :--- | :--- | :--- |
| `--pwa-vh` | `100vh` | `100dvh` |
| `--pwa-half-vh` | `50vh` | `50dvh` |

---

## 🤝 Contributing

Pull requests and issues are welcome! Feel free to report any browser edge cases or suggest improvements.

```bash
git clone https://github.com/owaisnaim/pwa-zerochin.git
cd pwa-zerochin
npm install
npm run build
```

---

## 📄 License

[MIT](LICENSE) © [Mohd Owais Naim](https://github.com/owaisnaim)
