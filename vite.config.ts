import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        research: resolve(__dirname, 'research.html'),
        v2: resolve(__dirname, 'v2.html'),
        canvas: resolve(__dirname, 'canvas.html'),
      },
    },
  },
})
