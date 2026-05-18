import { Badge } from "./badge";

import type { FulfillmentStatus, OrderStatus, ProductStatus } from "@/lib/db/schema";

const PAYMENT_TONE: Record<OrderStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  paid: "success",
  fulfilled: "success",
  refunded: "danger",
};

const FULFILLMENT_TONE: Record<FulfillmentStatus, "neutral" | "info" | "success"> = {
  unfulfilled: "neutral",
  fulfilled: "info",
  shipped: "success",
};

const PRODUCT_TONE: Record<ProductStatus, "neutral" | "success" | "warning"> = {
  draft: "warning",
  active: "success",
  archived: "neutral",
};

export function PaymentBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={PAYMENT_TONE[status]}>{status}</Badge>;
}

export function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  return <Badge tone={FULFILLMENT_TONE[status]}>{status}</Badge>;
}

export function ProductBadge({ status }: { status: ProductStatus }) {
  return <Badge tone={PRODUCT_TONE[status]}>{status}</Badge>;
}
