import { Link } from "@tanstack/react-router";
import { Splatter5 } from "@/components/splatter";

type Props = {
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  category: string;
  hasStock: boolean;
};

export function ProductCard({ slug, name, priceCents, imageUrl, category, hasStock }: Props) {
  const price = (priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Link
      to="/products/$slug"
      params={{ slug }}
      className="group relative bg-white border border-[#e5e0d8] overflow-hidden flex flex-col hover:border-[#8B5A2B] transition-colors duration-200"
    >
      {/* Mud splat accent corner */}
      <Splatter5
        className="absolute top-2 right-2 w-10 h-10 pointer-events-none opacity-30 group-hover:opacity-70 transition-opacity duration-300"
        color="#6B4423"
      />

      {/* Product image */}
      <div className="relative aspect-square overflow-hidden bg-[#f5f0eb]">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!hasStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="font-heading text-sm tracking-widest text-[#888]">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1">
        <span className="text-xs text-[#999] tracking-widest uppercase font-medium">
          {category === "tshirt" ? "T-Shirt" : "Sweatshirt"}
        </span>
        <h3 className="font-heading text-lg tracking-wide text-[#111] leading-tight">
          {name}
        </h3>
        <p className="text-sm font-semibold text-[#3E2A1E] mt-1">{price}</p>
      </div>
    </Link>
  );
}
