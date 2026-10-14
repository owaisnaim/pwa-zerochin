import React, { useState, useEffect } from 'react';
import { isStandalone, getZeroChinSnippet, PwaZeroChinOptions } from './core';

/**
 * React hook to reactively track whether the app is running in PWA standalone mode.
 * Safe for Server-Side Rendering (Next.js, Remix, Astro).
 */
export function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState<boolean>(() => isStandalone());

  useEffect(() => {
    // Sync state on client mount
    setStandalone(isStandalone());

    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia('(display-mode: standalone)');
    const onChange = (e: MediaQueryListEvent) => {
      setStandalone(Boolean(e.matches || (window.navigator as any)?.standalone === true));
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    } else if (typeof (mql as any).addListener === 'function') {
      (mql as any).addListener(onChange);
      return () => (mql as any).removeListener(onChange);
    }
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
