// @ts-check
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import AstroPWA from '@vite-pwa/astro'
import { defineConfig } from 'astro/config'
import remarkEscapeStrayLt from './src/lib/remarkEscapeStrayLt.mjs'
import remarkStripUnknownJsx from './src/lib/remarkStripUnknownJsx.mjs'

export default defineConfig({
  site: 'https://lore.oriz.in',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [
    react(),
    sitemap(),
    mdx({ remarkPlugins: [remarkEscapeStrayLt, remarkStripUnknownJsx] }),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: {
        id: '/',
        name: 'oriz·lore — nocturne archive',
        short_name: 'oriz·lore',
        description:
          'A nocturne archive of structured book commentary — overview, content map, analysis, narration.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#14171C',
        background_color: '#14171C',
        categories: ['books', 'education', 'reference'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,png,ico}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api') || url.pathname.startsWith('/account'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.origin !== self.location.origin,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'book-lore-fonts', expiration: { maxEntries: 30 } },
          },
        ],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
