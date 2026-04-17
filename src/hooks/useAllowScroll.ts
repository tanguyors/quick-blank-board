import { useEffect } from 'react';

/**
 * Activates native page scrolling for the duration of the component's life.
 * Use ONLY on public landing/marketing/legal pages.
 * The rest of the app keeps `position: fixed` to lock nav bars in the webapp.
 */
export function useAllowScroll() {
  useEffect(() => {
    document.documentElement.classList.add('allow-scroll');
    return () => document.documentElement.classList.remove('allow-scroll');
  }, []);
}
