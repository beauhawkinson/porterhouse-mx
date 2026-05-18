import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db/db";
import { order } from "@/lib/db/schema";

export const getMyOrdersFn = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    throw redirect({ to: "/sign-in" });
  }

  const orders = await db.query.order.findMany({
    where: eq(order.userId, session.user.id),
    with: { items: true },
    orderBy: [desc(order.createdAt)],
  });

  return { user: session.user, orders };
});
