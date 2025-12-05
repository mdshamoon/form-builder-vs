import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses including LAN and ngrok
    port: 5173,
    strictPort: false,
    allowedHosts: [
      '.ngrok-free.app', // Allow all ngrok subdomains
      '.ngrok.io',       // Allow legacy ngrok domains
      'localhost',
    ],
  },
})
