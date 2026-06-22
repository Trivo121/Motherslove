import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.PNG', '**/*.JPEG'],
  server: {
    allowedHosts: true, // Allows forwarded hosts like Vercel tunnels
  }
})
