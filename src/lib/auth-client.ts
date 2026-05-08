import { createAuthClient } from "better-auth/react";
import { app } from "@/lib/config/app.config";

export const authClient = createAuthClient({
  baseURL: app.url,
});

export const { signIn, signOut, useSession } = authClient;
