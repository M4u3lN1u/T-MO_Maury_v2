import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// En desarrollo, /api se redirige al backend de Django para no depender de CORS.
export default defineConfig(({ mode }) => {
  const backend = loadEnv(mode, process.cwd(), '').BACKEND_URL || 'http://127.0.0.1:8000'
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': backend,
        '/media': backend,
      },
    },
  }
})
