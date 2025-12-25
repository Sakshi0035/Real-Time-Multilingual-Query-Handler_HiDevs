import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Base path for GitHub Pages (repo name)
      base: '/Real-Time-Multilingual-Query-Handler_HiDevs/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Do NOT define/expose GEMINI_API_KEY to the client bundle.
      // Use a backend/serverless proxy instead.
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
