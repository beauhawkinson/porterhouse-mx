// Home page design variants. Kept in one place so the route's search schema and
// the header preview switcher never drift. Temporary testing scaffolding — once
// a design is chosen we can drop the switcher and render the winner directly.

export const HOME_VARIANTS = ["original", "pulse", "editorial", "poster"] as const;

export type HomeVariant = (typeof HOME_VARIANTS)[number];

export const HOME_VARIANT_LABELS: Record<HomeVariant, string> = {
  original: "Original",
  pulse: "Pulse",
  editorial: "Editorial",
  poster: "Poster",
};

export const DEFAULT_HOME_VARIANT: HomeVariant = "original";
