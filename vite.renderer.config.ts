import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    tanstackRouter({
      routesDirectory: 'src/routes',
    }),
  ],
  server: {
    host: '127.0.0.1',
  },
});
