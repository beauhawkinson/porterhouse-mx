import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal/LegalPage";
import { app } from "@/lib/config/app.config";

const shipping = (app.shippingCents / 100).toLocaleString("en-US", {
  style: "currency",
  currency: "USD",
});

// NOTE: Starter policy copy tailored to this store. Review before relying on it.
export const Route = createFileRoute("/legal/shipping-returns")({
  head: () => ({ meta: [{ title: `Shipping & Returns — ${app.brand.name}` }] }),
  component: ShippingReturnsPage,
});

function ShippingReturnsPage() {
  return (
    <LegalPage title="Shipping & Returns" updated="July 10, 2026">
      <section>
        <h2>Shipping</h2>
        <ul>
          <li>Flat-rate shipping of {shipping} is applied at checkout.</li>
          <li>Orders ship from the US via USPS, typically within 2–4 business days.</li>
          <li>
            You'll receive a tracking number by email once your order ships, and can also find it
            under your account.
          </li>
        </ul>
      </section>

      <section>
        <h2>Returns &amp; exchanges</h2>
        <ul>
          <li>Unworn, unwashed apparel with tags may be returned within 30 days of delivery.</li>
          <li>Stickers and final-sale items are not eligible for return.</li>
          <li>Refunds are issued to your original payment method once we receive the return.</li>
        </ul>
      </section>

      <section>
        <h2>Damaged or wrong items</h2>
        <p>
          If something arrives damaged or incorrect, email{" "}
          <a href={`mailto:${app.email}`}>{app.email}</a> within 7 days of delivery with your order
          number and a photo, and we'll make it right.
        </p>
      </section>

      <section>
        <h2>Start a return</h2>
        <p>
          Email <a href={`mailto:${app.email}`}>{app.email}</a> with your order number and we'll
          send return instructions.
        </p>
      </section>
    </LegalPage>
  );
}
