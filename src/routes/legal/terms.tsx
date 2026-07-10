import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal/LegalPage";
import { app } from "@/lib/config/app.config";

// NOTE: Starter policy copy tailored to this store. Review with counsel before
// relying on it for compliance in your jurisdiction.
export const Route = createFileRoute("/legal/terms")({
  head: () => ({ meta: [{ title: `Terms of Service — ${app.brand.name}` }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 10, 2026">
      <section>
        <p>
          By using {app.name} and placing an order, you agree to these terms. If you do not agree,
          please do not use the store.
        </p>
      </section>

      <section>
        <h2>Orders &amp; pricing</h2>
        <p>
          All prices are in USD and shown at checkout. We may correct pricing errors or cancel an
          order (with a full refund) if an item is mispriced, unavailable, or if we suspect fraud.
        </p>
      </section>

      <section>
        <h2>Payment</h2>
        <p>
          Payments are processed securely by Stripe. By submitting an order you authorize the charge
          for the item total plus any shipping shown at checkout.
        </p>
      </section>

      <section>
        <h2>Products</h2>
        <p>
          We work to show products accurately, but colors and details may vary slightly between
          screens and finished goods. Availability is not guaranteed until an order is confirmed.
        </p>
      </section>

      <section>
        <h2>Intellectual property</h2>
        <p>
          All branding, artwork, and content on this site belong to {app.name} and may not be
          reproduced without permission.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          The store is provided "as is." To the extent permitted by law, {app.name} is not liable
          for indirect or incidental damages arising from use of the site or products.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms? Email <a href={`mailto:${app.email}`}>{app.email}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
