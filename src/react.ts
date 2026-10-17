import React, { useState, useEffect } from 'react';
import { isStandalone, getZeroChinSnippet, PwaZeroChinOptions } from './core';

// Re-export all core exports for React consumers
export * from './core';

const DISPLAY_MODE_QUERY =
  '(display-mode: standalone), (display-mode: minimal-ui), (display-mode: fullscreen)';

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }
  const mql = window.matchMedia(DISPLAY_MODE_QUERY);
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', onStoreChange);
    return () => mql.removeEventListener('change', onStoreChange);
  } else if (typeof (mql as any).addListener === 'function') {
    (mql as any).addListener(onStoreChange);
    return () => (mql as any).removeListener(onStoreChange);
  }
  return () => {};
}

const getClientSnapshot = (): boolean => isStandalone();
const getServerSnapshot = (): boolean => false;

const useSyncExternalStore = (React as any).useSyncExternalStore as
  | (<T>(
      subscribe: (onStoreChange: () => void) => () => void,
      getSnapshot: () => T,
      getServerSnapshot?: () => T
    ) => T)
  | undefined;

/**
 * React hook to reactively track whether the app is running in PWA standalone mode.
 * Safe for Server-Side Rendering and hydration in Next.js, Remix, Astro, and React 18/19.
 */
export function useIsStandalone(): boolean {
  if (typeof useSyncExternalStore === 'function') {
    return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  }

  // Fallback for React 16.8 / 17
  const [standalone, setStandalone] = useState<boolean>(false);

  useEffect(() => {
    setStandalone(isStandalone());
    return subscribe(() => {
      setStandalone(isStandalone());
    });
  }, []);

  return standalone;
}

export interface PwaZeroChinState {
  /** True if running as installed PWA (iOS standalone or Chromium PWA) */
  isStandalone: boolean;
  /** Active viewport unit: 'vh' in PWA (kills black chin), 'dvh' in browser (kills toolbar overlap) */
  vhUnit: 'vh' | 'dvh';
  /** Full viewport height CSS value ('100vh' or '100dvh') */
  vhValue: '100vh' | '100dvh';
  /** Half viewport height CSS value ('50vh' or '50dvh') */
  halfVhValue: '50vh' | '50dvh';
  /** Helper style object `{ height: '100vh' | '100dvh' }` */
  style: { height: '100vh' | '100dvh' };
}

/**
 * All-in-one React hook providing reactive PWA viewport properties and helpers.
 */
export function usePwaZeroChin(): PwaZeroChinState {
  const standalone = useIsStandalone();
  const vhUnit: 'vh' | 'dvh' = standalone ? 'vh' : 'dvh';
  const vhValue: '100vh' | '100dvh' = standalone ? '100vh' : '100dvh';
  const halfVhValue: '50vh' | '50dvh' = standalone ? '50vh' : '50dvh';

  return {
    isStandalone: standalone,
    vhUnit,
    vhValue,
    halfVhValue,
    style: { height: vhValue }
  };
}

/**
 * Pre-mount React script component to drop into your <head> (Next.js layout / _document).
 * Prevents any flash of unstyled viewport or black-chin shift on cold launch.
 */
export function ZeroChinHeadScript(props?: PwaZeroChinOptions): React.ReactElement {
  return React.createElement('script', {
    id: 'pwa-zerochin-premount',
    dangerouslySetInnerHTML: {
      __html: getZeroChinSnippet(props)
    }
  });
}
