import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['kdesk', 'kdesk.kalop.com.ar'],
    proxy: {
      '/api': {
        target: 'https://localhost:443',
        changeOrigin: true,
        secure: false, // certificado de la CA interna de KDesk, no de una CA pública
      },
    },
  },
})
