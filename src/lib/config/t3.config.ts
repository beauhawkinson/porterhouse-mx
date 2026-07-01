import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().regex(/^(sk|rk)_(test|live)_/),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
    ADMIN_EMAILS: z.string().min(1),
    // Cloudflare R2 (product image storage)
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET_NAME: z.string().min(1),
    R2_PUBLIC_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
