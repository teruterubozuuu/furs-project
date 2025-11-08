import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Set the registration type for automatic updates
      registerType: 'autoUpdate',
      
      // List all assets you want the Service Worker to pre-cache
      includeAssets: ['logo_furs.png', 'logo_icon.png', 'landing_2.png', 'browsertab_logo.png','furs_about.jpg'], 

      // 1. The Web App Manifest (required for installation)
      manifest: {
        name: 'Find, Unite, and Rescue Strays', // The full name of your application
        short_name: 'F.U.R.S.',     // Name used under icons on home screen
        description: 'F.U.R.S. or Find, Unite, and Rescue Strays is a community-driven application to report stray sightings and identify areas with significant stray animal density.',
        theme_color: '#4f46e5', // Primary color for the browser UI/header
        background_color: '#ffffff', // Background color for the splash screen
        display: 'standalone', // Makes it launch without browser UI
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo_furs.png', // Create this file in /public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo_furs.png', // Create this file in /public
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo_furs.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' // Recommended for Android adaptive icons
          }
        ]
      },
      
      // 2. Workbox Configuration (for caching strategy)
      workbox: {
        // Caches all static files in the build output aggressively
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        
        // Optional: Add a runtime cache for external assets if needed (e.g., API calls, fonts)
        runtimeCaching: [{
            urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.includes('/api/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache' }
        }]
      }
    }),
  ],
});