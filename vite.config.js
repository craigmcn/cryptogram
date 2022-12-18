import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: [
        { dir: 'dist'},
        { dir: 'dist/cryptogram'}, // For Netlify subdirectory
      ],
    },
  },
});
