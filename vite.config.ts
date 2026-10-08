import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/aftersale': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/order': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/stock': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/sku': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/notify': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/user': { target: 'http://127.0.0.1:8080', changeOrigin: true },
    },
  },
})
