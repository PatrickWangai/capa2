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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <App />
      <AlertPopup />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
          success: { iconTheme: { primary: '#28976d', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
