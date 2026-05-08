import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { designAPIPlugin } from './src/plugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), designAPIPlugin()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
})
