import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  return {
    plugins: [react()],
    server: {
      port: 5173,
      allowedHosts: ['.loca.lt', '.lhr.life'],
      proxy: {
        '/api': { target: 'http://localhost:4000', changeOrigin: true },
        '/socket.io': { target: 'http://localhost:4000', ws: true },
      },
    },
    base: process.env.VITE_BASE ?? (isProduction ? '/capa2/' : '/'),
    resolve: { alias: { '@': '/src' } },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-charts': ['recharts'],
            'vendor-data': ['@tanstack/react-query', 'axios', 'socket.io-client', 'zustand'],
          },
        },
      },
    },
  };
});
