import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': 'http://localhost:3001',
      '/usuarios': 'http://localhost:3001',
      '/add-foto': 'http://localhost:3001' // Adicionando proxy para a rota de upload de fotos
    }
  }
})
