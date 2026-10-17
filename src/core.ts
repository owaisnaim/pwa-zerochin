/**
 * pwa-zerochin - Universal Core Detector & CSS Initializer
 *
 * Mode-aware viewport engine that eliminates iOS WebKit black chins
 * in standalone PWA mode, and eliminates bottom toolbar clipping
 * in mobile Safari/Chrome browser tabs.
 */

export interface PwaZeroChinOptions {
  /**
   * Custom CSS variable name for full viewport height.
   * Defaults to '--pwa-vh'.
   */
  variableName?: string;

  /**
   * Custom CSS variable name for half viewport height (split screens/drawers).
   * Defaults to '--pwa-half-vh'.
   */
  halfVariableName?: string;

  /**
   * CSS class added to <html> when in standalone mode.
   * Defaults to 'is-standalone'.
   */
  standaloneClass?: string;
}

/**
 * Universally detects if the web app is running in installed PWA standalone mode
 * across iOS WebKit, Chromium, Android TWA, and desktop PWA containers.
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  const isIosStandalone = Boolean((window.navigator as any)?.standalone === true);
  const isDisplayStandalone = Boolean(
    window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
  );
  const isMinimalUi = Boolean(
    window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches
  );
  const isFullscreen = Boolean(
    window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches
  );
  const isAndroidTwa = Boolean(
    typeof document !== 'undefined' && document.referrer?.includes('android-app://')
  );
  const hasStandaloneClass = Boolean(
    typeof document !== 'undefined' && document.documentElement?.classList.contains('is-standalone')
  );

  return (
    isIosStandalone ||
    isDisplayStandalone ||
    isMinimalUi ||
    isFullscreen ||
    isAndroidTwa ||
    hasStandaloneClass
  );
}

/**
 * Initializes the PWA ZeroChin mode-aware CSS custom properties and listeners.
 * Call this as early as possible in your application lifecycle.
 *
 * @returns A cleanup function to remove listeners.
 */
export function initPwaZeroChin(options?: PwaZeroChinOptions): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const varName = options?.variableName || '--pwa-vh';
  const halfVarName = options?.halfVariableName || '--pwa-half-vh';
  const className = options?.standaloneClass || 'is-standalone';

  function apply() {
    const standalone = isStandalone();

    if (standalone) {
      document.documentElement.classList.add(className);
      document.documentElement.style.setProperty(varName, '100vh');
      document.documentElement.style.setProperty(halfVarName, '50vh');
    } else {
      document.documentElement.classList.remove(className);
      document.documentElement.style.setProperty(varName, '100dvh');
      document.documentElement.style.setProperty(halfVarName, '50dvh');
    }
  }

  // Initial immediate application
  apply();

  // Listen for dynamic display-mode transitions
  let cleanupMediaQuery: (() => void) | undefined;
  if (window.matchMedia) {
    const mql = window.matchMedia(
      '(display-mode: standalone), (display-mode: minimal-ui), (display-mode: fullscreen)'
    );
    const handler = () => apply();

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
      cleanupMediaQuery = () => mql.removeEventListener('change', handler);
    } else if (typeof (mql as any).addListener === 'function') {
      (mql as any).addListener(handler);
      cleanupMediaQuery = () => (mql as any).removeListener(handler);
    }
  }

  return () => {
    if (cleanupMediaQuery) cleanupMediaQuery();
  };
}

/**
 * Generates an inline, zero-dependency pre-mount JavaScript snippet to place
 * in your <head> (e.g. index.html or Next.js layout).
 * Guarantees zero layout shift / visual chin flash before framework hydration.
 */
export function getZeroChinSnippet(options?: PwaZeroChinOptions): string {
  const varName = options?.variableName || '--pwa-vh';
  const halfVarName = options?.halfVariableName || '--pwa-half-vh';
  const className = options?.standaloneClass || 'is-standalone';

  return `!(function(){try{var s=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||(window.navigator&&window.navigator.standalone===true);var d=document.documentElement;if(s){d.classList.add('${className}');d.style.setProperty('${varName}','100vh');d.style.setProperty('${halfVarName}','50vh')}else{d.style.setProperty('${varName}','100dvh');d.style.setProperty('${halfVarName}','50dvh')}}catch(e){}})();`;
}
