import Stripe from "stripe";

import { env } from "@/lib/config/t3.config";

export const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
});
