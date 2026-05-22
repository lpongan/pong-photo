import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import icon from "astro-icon";
import { remarkReadingTime } from "./src/scripts/remark-reading-time.mjs";
import undiciRetry from "./src/scripts/undici-retry.ts";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://www.getponged.com",

  image: {
    domains: ["res.cloudinary.com"],
    service: { entrypoint: "./src/services/cloudinary.ts" },
  },

  integrations: [
    icon(),
    sitemap(),
    mdx(), // inherits syntaxHighlight, shikiConfig, remarkPlugins, rehypePlugins from markdown config
    undiciRetry(),
    react(),
  ],

  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "rose-pine-dawn",
      defaultColor: false,
      themes: {
        light: "rose-pine-dawn",
        dark: "tokyo-night",
      },
      langs: [],
      wrap: true,
    },
    gfm: false,
    remarkPlugins: [remarkGfm, remarkMath, remarkReadingTime],
    rehypePlugins: [rehypeKatex],
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inconsolata",
      cssVariable: "--font-inconsolata",
      display: "swap",
      fallbacks: ["monospace"],
      weights: [200, 400, 700, 900],
      optimizedFallbacks: true,
    },
    {
      provider: fontProviders.fontsource(),
      name: "Overpass Mono",
      cssVariable: "--font-overpass-mono",
      display: "swap",
      fallbacks: ["monospace"],
      weights: [300, 400, 700],
      optimizedFallbacks: true,
    },
  ],

  experimental: {
    clientPrerender: true,
    // responsiveImages: true,
    // directRenderScript: true
  },

  build: {
    concurrency: 4,
    measuring: {
      entryBuilding: true,
      pageGeneration: true,
      bundling: true,
      rendering: true,
      assetProcessing: true,
    },
  },

  security: {
    checkOrigin: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
