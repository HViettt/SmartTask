import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    // Thiết lập COOP/COEP phù hợp để cho phép popup giao tiếp (Google Sign-In)
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      // Không bật COEP trong dev để tránh cảnh báo/warnings không cần thiết
      // Nếu cần SharedArrayBuffer, hãy cấu hình COEP đúng cách.
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})