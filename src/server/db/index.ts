import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/env";
import { schema, relations } from "./schema";

const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(env.DB_URL, {
    prepare: false,
  });

export const db = drizzle({ client: conn, schema, relations, casing: "camelCase" });

if (env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}
