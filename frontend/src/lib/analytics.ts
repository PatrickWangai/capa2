declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
let initialized = false;

export function initGA() {
  if (!GA_ID || initialized) return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

export function trackPageView(path: string, title?: string) {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path, page_title: title, send_to: GA_ID });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', name, { ...params, send_to: GA_ID });
}
