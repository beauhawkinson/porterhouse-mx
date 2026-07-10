import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal/LegalPage";
import { app } from "@/lib/config/app.config";

// NOTE: Starter policy copy tailored to this store. Review with counsel before
// relying on it for compliance in your jurisdiction.
export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: `Privacy Policy — ${app.brand.name}` }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 10, 2026">
      <section>
        <p>
          {app.name} ("we", "us") respects your privacy. This policy explains what we collect when
          you use our store and how we use it.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Contact and shipping details you provide at checkout (name, email, address).</li>
          <li>
            Order history and payment status. Card details are handled entirely by Stripe — we never
            see or store your full card number.
          </li>
          <li>Account details from Google if you choose to sign in.</li>
          <li>Basic technical data (device, browser) needed to operate and secure the site.</li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To process, ship, and support your orders.</li>
          <li>To send order confirmations and service messages.</li>
          <li>To prevent fraud and keep the store running.</li>
        </ul>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>
          We share data only with the services that make the store work — Stripe for payments and
          our shipping and email providers — and only as needed to fulfill your order. We do not
          sell your personal information.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can request a copy of your data or ask us to delete it by emailing{" "}
          <a href={`mailto:${app.email}`}>{app.email}</a>. Signing in is optional; guest checkout is
          always available.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy? Reach us at <a href={`mailto:${app.email}`}>{app.email}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
