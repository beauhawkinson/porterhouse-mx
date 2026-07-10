import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db/db";
import { productRequest } from "@/lib/db/schema";

export const productRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "Please add a little more detail (at least 10 characters).")
    .max(1000, "Keep it under 1000 characters."),
});

export const submitProductRequestFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => productRequestSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequest().headers });

    // Signed-in only. The UI already gates on this; guard the server too.
    if (!session?.user) {
      throw redirect({ to: "/sign-in" });
    }

    await db.insert(productRequest).values({
      userId: session.user.id,
      email: session.user.email ?? null,
      message: data.message,
    });

    return { ok: true };
  });
