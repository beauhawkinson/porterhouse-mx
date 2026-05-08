import { stripeClient } from "@better-auth/stripe/client";
import { createAuthClient } from "better-auth/react";

import { app } from "@/lib/config/app.config";

export const authClient = createAuthClient({
  baseURL: app.url,
  plugins: [stripeClient()],
});

export const { signIn, signOut, useSession } = authClient;
