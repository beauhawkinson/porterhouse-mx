import { createFileRoute, Link } from "@tanstack/react-router";
import { getFeaturedProducts } from "@/lib/server/products";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { Splatter1, Splatter2, Splatter3, Splatter4 } from "@/components/splatter";

export const Route = createFileRoute("/")({
  loader: () => getFeaturedProducts(),
  component: HomePage,
});

function HomePage() {
  const products = Route.useLoaderData();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#FAFAF7]">
        {/* Mud splatters — bleed from top */}
        <Splatter1
          className="absolute -top-16 -left-20 w-80 opacity-25 rotate-[-15deg]"
          color="#3E2A1E"
        />
        <Splatter2
          className="absolute -top-8 right-0 w-72 opacity-20 rotate-[20deg]"
          color="#6B4423"
        />
        <Splatter3
          className="absolute top-0 left-[30%] w-24 opacity-15 rotate-[5deg]"
          color="#8B5A2B"
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Splatter4
              className="w-16 opacity-60"
              color="#8B5A2B"
            />
            <span className="font-heading text-xs tracking-[0.3em] text-[#8B5A2B]">
              RIDE DIRTY. LOOK CLEAN.
            </span>
            <Splatter4
              className="w-16 opacity-60 scale-x-[-1]"
              color="#8B5A2B"
            />
          </div>

          <h1 className="font-heading text-[clamp(3.5rem,10vw,8rem)] leading-none tracking-wide text-[#111] mb-6">
            JP<br />MOTORCROSS
          </h1>

          <p className="text-lg text-[#555] mb-10 max-w-xl mx-auto font-body">
            Premium apparel for riders who don't slow down. Built tough, worn proudly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" withSplat className="group w-full sm:w-auto">
                SHOP NOW
              </Button>
            </Link>
            <Link to="/shop" search={{ category: "tshirt" as const }}>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                T-SHIRTS
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom mud streak */}
        <Splatter4
          className="absolute -bottom-4 left-0 right-0 w-full opacity-10"
          color="#3E2A1E"
        />
      </section>

      {/* ── Section divider ──────────────────────────────── */}
      <div className="relative h-12 overflow-hidden">
        <Splatter4
          className="absolute inset-0 w-full h-full opacity-20 object-cover"
          color="#6B4423"
        />
      </div>

      {/* ── Featured products ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end gap-4 mb-10">
          <h2 className="font-heading text-4xl text-[#111] leading-none">
            FEATURED GEAR
          </h2>
          <Splatter3
            className="w-8 opacity-70 mb-1"
            color="#6B4423"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              priceCents={p.priceCents}
              imageUrl={p.imageUrl}
              category={p.category}
              hasStock={p.variants.some((v) => v.stock > 0)}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/shop">
            <Button variant="secondary" size="lg">
              VIEW ALL PRODUCTS →
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Brand strip ──────────────────────────────────── */}
      <section className="relative bg-[#3E2A1E] py-16 overflow-hidden">
        <Splatter2
          className="absolute -left-16 top-1/2 -translate-y-1/2 w-64 opacity-10 rotate-12"
          color="#FAFAF7"
        />
        <Splatter1
          className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 opacity-10 -rotate-12"
          color="#FAFAF7"
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-heading text-4xl text-white mb-4 leading-tight">
            GEAR UP. RIDE OUT.
          </h2>
          <p className="text-[#C49A6C] text-base mb-8">
            Every piece is built for riders. Durable graphics, heavy-weight cotton, and fits that move with you on and off the track.
          </p>
          <Link to="/shop">
            <Button variant="secondary" className="border-white text-white hover:bg-white hover:text-[#3E2A1E]">
              EXPLORE THE COLLECTION
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
