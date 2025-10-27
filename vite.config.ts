import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Use path.resolve for compatibility
    }
  },
  server: {
    port: 3001,
    open: true, // Automatically open the browser when the server starts
    hmr: {
      protocol: 'ws', // Ensures HMR works correctly on different networks
      host: 'localhost',
      port: 3001,
    }
  }
});
