import { defineConfig } from "drizzle-kit";

import { env } from "@/lib/config/t3.config";

export default defineConfig({
  schema: ["./src/lib/db/schema.ts", "./src/lib/db/relations.ts"],
  out: "src/generated/drizzle",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
});
