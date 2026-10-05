import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (
            id.includes('node_modules/docx') ||
            id.includes('node_modules/jszip') ||
            id.includes('node_modules/file-saver')
          ) {
            return 'export-vendor';
          }
          if (
            id.includes('node_modules/html2pdf.js') ||
            id.includes('node_modules/jspdf') ||
            id.includes('node_modules/html2canvas')
          ) {
            return 'pdf-vendor';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});
