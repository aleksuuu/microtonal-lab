import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/microtonal-lab/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ["verovio"], // Exclude verovio from optimization if needed
  },
})
