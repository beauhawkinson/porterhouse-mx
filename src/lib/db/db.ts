import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/config/t3.config";
import * as schema from "@/lib/db/schema";
import * as relations from "@/lib/db/relations";

const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema: { ...schema, ...relations } });
