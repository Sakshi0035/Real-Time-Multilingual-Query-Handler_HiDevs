import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || env.VERCEL === '1' || env.VERCEL === 'true';
    // In production, use the repo base only for GitHub Pages; on Vercel we must use root '/' so
    // built asset paths resolve correctly. Default to '/' in dev.
    const repoBase = mode === 'production' ? (isVercel ? '/' : '/Real-Time-Multilingual-Query-Handler_HiDevs/') : '/';
    return {
      // Use a repo-aware base in production so gh-pages serves correctly when needed.
      base: repoBase,
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
