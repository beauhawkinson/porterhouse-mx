import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart(),
    nitro({
      preset: "vercel",
      vercel: {
        functions: {
          runtime: "nodejs24.x",
        },
      },
      // https://github.com/better-auth/better-auth/issues/7463#issuecomment-3874787825
      rollupConfig: {
        treeshake: {
          moduleSideEffects: (id: string) => {
            if (id.includes("reflect-metadata")) return true;
            // Nitro default configs - https://nitro.build/config#modulesideeffects
            if (id.includes("unenv/polyfill/")) return true;
            if (id.includes("node-fetch-native/polyfill")) return true;
            return false;
          },
        },
      },
    }),
    react(),
    tailwindcss(),
  ],
  worker: {
    format: "es",
  },
});

export default config;
