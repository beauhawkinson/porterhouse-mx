import { stripe } from "@better-auth/stripe";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { app } from "@/lib/config/app.config";
import { stripeClient } from "@/lib/config/stripe.config";
import { env } from "@/lib/config/t3.config";
import { db } from "@/lib/db/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  appName: app.name,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: false },
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    customRules: { "/sign-in/*": { window: 60, max: 10 } },
  },
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
    }),
    tanstackStartCookies(),
  ],
});
