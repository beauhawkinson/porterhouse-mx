import { useCartStore, type CartItem as CartItemType } from "@/lib/cart/store";

type Props = {
  item: CartItemType;
};

export function CartItemRow({ item }: Props) {
  const { removeItem, updateQuantity } = useCartStore();
  const price = (item.priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const lineTotal = ((item.priceCents * item.quantity) / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="flex gap-4 py-5 border-b border-[#e5e0d8] last:border-0">
      <div className="w-24 h-24 bg-[#f5f0eb] flex-shrink-0 overflow-hidden">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-base tracking-wide truncate">{item.name}</h3>
        <p className="text-sm text-[#666] mt-0.5">Size: {item.size}</p>
        <p className="text-sm text-[#999] mt-0.5">{price} each</p>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-[#ddd]">
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-[#555] hover:bg-[#f5f0eb] transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-[#555] hover:bg-[#f5f0eb] transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.variantId)}
            className="text-xs text-[#999] hover:text-[#3E2A1E] transition-colors cursor-pointer underline"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="text-right">
        <p className="font-semibold text-[#111]">{lineTotal}</p>
      </div>
    </div>
  );
}
