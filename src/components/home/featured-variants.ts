// Featured-section design variants — toggled independently of the home layout
// so the two can be mixed and matched during design review.

export const FEATURED_VARIANTS = ["grid", "spotlight", "rail", "editorial"] as const;

export type FeaturedVariant = (typeof FEATURED_VARIANTS)[number];

export const FEATURED_VARIANT_LABELS: Record<FeaturedVariant, string> = {
  grid: "Original",
  spotlight: "Spotlight",
  rail: "Rail",
  editorial: "Editorial",
};

export const DEFAULT_FEATURED_VARIANT: FeaturedVariant = "grid";
