// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5555', // CHANGED: Forward local API requests to Flask.
        changeOrigin: true, // CHANGED: Use Flask's host header for forwarded requests.
      },
    },
  },
  build: {
    outDir: 'dist',  // Keeps the output in client/dist
  },
})

//https://vitejs.dev/config/
//export default defineConfig({
//  plugins: [react()],
//  server: {
//    proxy: {
//      '/api': {
//        target: 'http://localhost:5555',
//        changeOrigin: true,
//        // rewrite: (path) => path.replace(/^\/api/, ''),
//      },
//    },
//  },
//  test: {
//    globals: true,
//    environment: 'jsdom',
//    setupFiles: './src/setupTests.js',
//    css: true, // Optional: allows CSS imports in components under test
//  },
//});