import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@dnd-kit')) return 'vendor-dnd';
            if (id.includes('qr-code-styling')) return 'vendor-qr';
            if (id.includes('react-zoom-pan-pinch')) return 'vendor-zoom';
            return 'vendor';
          }
        }
      }
    }
  }
})
