import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo-soma.png"],
      manifest: {
        name: "SomaGate",
        short_name: "SomaGate",
        description: "Swipe, match & secure your next property in Indonesia",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#f97316",
        orientation: "portrait-primary",
        categories: ["real-estate", "business", "lifestyle"],
        icons: [
          {
            src: "/logo-soma.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo-soma.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/logo-soma.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
}));
