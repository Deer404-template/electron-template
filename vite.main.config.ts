import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // 原生模块保持 external，避免被打包导致动态 require 失败
    rollupOptions: {
      external: ['better-sqlite3'],
    },
  },
  optimizeDeps: {
    exclude: ['better-sqlite3'],
  },
  ssr: {
    external: ['better-sqlite3'],
  },
});
