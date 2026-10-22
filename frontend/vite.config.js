import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // VITE_API_TARGET (ver frontend/.env.development) define a qué backend
  // le pega el proxy de /api. Sin ella, mantiene el comportamiento anterior.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: true,
      allowedHosts: ['kdesk'], // agregar acá el hostname de tu red interna si hace falta
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'https://localhost:443',
          changeOrigin: true,
          secure: false, // certificado de la CA interna de KDesk, no de una CA pública
        },
      },
    },
  }
})
