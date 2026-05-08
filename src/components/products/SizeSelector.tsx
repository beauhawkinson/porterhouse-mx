const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

type Variant = {
  id: string;
  size: string;
  stock: number;
};

type Props = {
  variants: Variant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
};

export function SizeSelector({ variants, selectedVariantId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {SIZES.map((size) => {
        const variant = variants.find((v) => v.size === size);
        const outOfStock = !variant || variant.stock === 0;

        return (
          <button
            key={size}
            onClick={() => variant && !outOfStock && onSelect(variant.id)}
            disabled={outOfStock}
            aria-pressed={selectedVariantId === variant?.id}
            className={[
              "w-14 h-10 font-heading text-sm tracking-wider border transition-all duration-150",
              outOfStock
                ? "border-[#e5e0d8] text-[#bbb] cursor-not-allowed line-through"
                : selectedVariantId === variant?.id
                ? "border-[#3E2A1E] bg-[#3E2A1E] text-white"
                : "border-[#ccc] text-[#333] hover:border-[#8B5A2B] hover:text-[#6B4423] cursor-pointer",
            ].join(" ")}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
