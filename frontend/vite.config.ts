/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // Same-origin API calls in development: /api/* → Spring Boot on :8080.
    // The browser sees one origin, so the Origin header is dropped; otherwise Spring's CORS
    // filter rejects POSTs when the app is opened via 127.0.0.1 instead of localhost.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        configure: (proxy) => {
          proxy.on('proxyReq', (req) => req.removeHeader('origin'))
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
