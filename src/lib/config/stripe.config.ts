import Stripe from "stripe";
import { env } from "@/lib/config/t3.config";

export const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
});
