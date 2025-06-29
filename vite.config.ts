import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy all API routes to the backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/dashboard': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/energy': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/realtime': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/invoice': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/files': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/upload': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/view': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/csv': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/feedback': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/analytics': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  envPrefix: ['VITE_', 'GEMINI_'], // Allow GEMINI_ prefixed env variables
});
