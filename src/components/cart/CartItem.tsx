import { cartKey, useCartStore } from "@/lib/cart/store";

import type { CartItem as CartItemType } from "@/lib/cart/store";

type Props = {
  item: CartItemType;
};

export function CartItemRow({ item }: Props) {
  const { removeItem, updateQuantity } = useCartStore();
  const key = cartKey(item);

  const price = (item.priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const lineTotal = ((item.priceCents * item.quantity) / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="flex gap-4 border-[#e5e0d8] border-b py-5 last:border-0">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden bg-[#f5f0eb]">
        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-heading text-base tracking-wide">{item.name}</h3>
        {item.size && <p className="mt-0.5 text-[#666] text-sm">Size: {item.size}</p>}
        <p className="mt-0.5 text-[#999] text-sm">{price} each</p>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center border border-[#ddd]">
            <button
              type="button"
              onClick={() => updateQuantity(key, item.quantity - 1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center text-[#555] transition-colors hover:bg-[#f5f0eb]"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(key, item.quantity + 1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center text-[#555] transition-colors hover:bg-[#f5f0eb]"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(key)}
            className="cursor-pointer text-[#999] text-xs underline transition-colors hover:text-[#3E2A1E]"
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
