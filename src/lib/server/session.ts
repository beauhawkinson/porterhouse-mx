import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";

/** Lightweight auth flag for the root route context (gates UI, not access). */
export const checkIsSignedInFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequest().headers });
  return !!session?.user;
});
