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
        const isSelected = selectedVariantId === variant?.id;

        return (
          <button
            type="button"
            key={size}
            onClick={() => variant && !outOfStock && onSelect(variant.id)}
            disabled={outOfStock}
            aria-pressed={isSelected}
            className={[
              "h-10 w-14 border font-heading text-sm tracking-wider",
              "outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:border-border disabled:text-faded-foreground disabled:line-through",
              !outOfStock && isSelected && "border-foreground bg-foreground text-background",
              !outOfStock &&
                !isSelected &&
                "cursor-pointer border-border text-foreground hover:border-foreground",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
