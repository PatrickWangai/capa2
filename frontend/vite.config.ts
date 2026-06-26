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
    base: isProduction ? '/capa2/' : '/',
    resolve: { alias: { '@': '/src' } },
  };
});
