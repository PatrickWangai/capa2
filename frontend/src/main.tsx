import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import AlertPopup from './components/ui/AlertPopup';
import { initSentry } from './utils/sentry';
import { startAnimatedFavicon } from './utils/animatedFavicon';
import './styles/globals.css';

initSentry();
startAnimatedFavicon();

// When a lazy chunk fails to load (stale deployment — chunk hashes changed),
// reload once so the user gets the latest bundle instead of an error screen.
window.addEventListener('vite:preloadError', () => {
  if (!sessionStorage.getItem('chunk-reload')) {
    sessionStorage.setItem('chunk-reload', '1');
    window.location.reload();
  }
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <App />
      <AlertPopup />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'var(--surface-dark)', color: 'var(--surface-dark-foreground)', border: '1px solid var(--surface-dark-border)' },
          success: { iconTheme: { primary: '#28976d', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
