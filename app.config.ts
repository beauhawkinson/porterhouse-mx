import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/start/config";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  tsr: {
    appDirectory: "src",
    generatedRouteTree: "src/routeTree.gen.ts",
    routeFileIgnorePattern: ".css",
  },
  server: {
    preset: "bun",
  },
});
