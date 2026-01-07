import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      }
    },
    hmr: {
      host: '127.0.0.1',
      overlay: false
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    manifest: true
  },
  publicDir: 'public'
})
