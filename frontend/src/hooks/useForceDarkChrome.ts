import { useEffect } from 'react';

/**
 * Flips the real document root to data-theme="dark" for as long as a page
 * is mounted, restoring whatever it was before on unmount. Needed because
 * browser-rendered chrome (the viewport scrollbar, autofill UI) reads CSS
 * custom properties from the actual :root cascade — the .force-dark-theme
 * class scopes ordinary DOM content fine, but has no effect on chrome the
 * browser draws outside any element's box.
 */
export function useForceDarkChrome() {
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.getAttribute('data-theme');
    html.setAttribute('data-theme', 'dark');
    return () => {
      if (previous) html.setAttribute('data-theme', previous);
      else html.removeAttribute('data-theme');
    };
  }, []);
}
