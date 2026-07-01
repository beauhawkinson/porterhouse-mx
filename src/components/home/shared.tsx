import type { getFeaturedProducts } from "@/lib/server/products";

export type FeaturedProducts = Awaited<ReturnType<typeof getFeaturedProducts>>;

/** The About Jeremy copy — shared across variants so it stays consistent. */
export const ABOUT_JEREMY =
  "Jeremy Porter has been chasing the next jump since he was old enough to twist a throttle. What started as a kid tearing up backyard tracks turned into a relentless pursuit of every starting gate he could line up behind — local hare scrambles, regional motos, and every weekend in between. The bike, the dirt, the noise: it's the only place that's ever made sense. This is the ride so far.";

/** A seamless scrolling marquee band in the brand's primary color. */
export function Marquee({ items }: { items: string[] }) {
  // Two copies so the -50% translate loops seamlessly.
  const content = [0, 1].flatMap((copy) => items.map((text) => ({ key: `${copy}-${text}`, text })));

  return (
    <div className="flex w-full overflow-hidden border-border border-y bg-primary text-primary-foreground">
      <div className="flex shrink-0 animate-marquee items-center whitespace-nowrap py-3 font-heading text-sm uppercase tracking-[0.3em]">
        {content.map((c) => (
          <span key={c.key} className="flex items-center">
            {c.text}
            <span aria-hidden className="px-8 opacity-60">
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
