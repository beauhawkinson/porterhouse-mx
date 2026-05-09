import { Link } from "@tanstack/react-router";

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
      className="group relative flex flex-col overflow-hidden border border-[#e5e0d8] bg-white transition-colors duration-200 hover:border-[#8B5A2B]"
    >
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden bg-[#f5f0eb]">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!hasStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="font-heading text-[#888] text-sm tracking-widest">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-4">
        <span className="font-medium text-[#999] text-xs tracking-widest">
          {category === "tshirt" ? "T-Shirt" : "Sweatshirt"}
        </span>
        <h3 className="font-heading text-[#111] text-lg leading-tight tracking-wide">{name}</h3>
        <p className="mt-1 font-semibold text-[#3E2A1E] text-sm">{price}</p>
      </div>
    </Link>
  );
}
