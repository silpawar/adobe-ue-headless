import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const basePath = process.env.BASE_PATH || '/'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react(), basicSsl()],
    base: basePath,
    server: {
      https: true,
      port: 3000,
      strictPort: true,
    }
  }
})

