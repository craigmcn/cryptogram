import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: [
        { dir: 'dist' },
        { dir: 'dist/cryptogram' }, // For Netlify subdirectory
      ],
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        id: '/cryptogram/?source=pwa',
        name: 'Cryptogram: A handy helper for solving cryptograms',
        short_name: 'Cryptogram',
        icons: [
          {
            src: '/android-chrome-192x192.png?v=eEvolvQr5k',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-256x256.png?v=eEvolvQr5k',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png?v=eEvolvQr5k',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        start_url: '/cryptogram/?source=pwa',
        theme_color: '#005b99',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/cryptogram',
      },
    }),
  ],
})
