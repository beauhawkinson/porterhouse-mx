import type { KnipConfig } from "knip";

const knipConfig: KnipConfig = {
  ignoreDependencies: ["tailwindcss", "tw-animate-css"],
  ignoreExportsUsedInFile: true,
  ignore: ["src/components/ui/**"],
  entry: ["src/routes/**/*.{ts,tsx}", "src/router.tsx"],
  project: ["src/**/*.{ts,tsx}"],
  paths: {
    "src/components/ui/*": ["src/components/ui/*"],
  },
};

export default knipConfig;
