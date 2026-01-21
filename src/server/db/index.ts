import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";
import { env } from "~/env";
import { schema, relations } from "./schema";

async function getDB() {
  const globalForDb = globalThis as unknown as {
    pool: Pool | undefined;
  };

  const client =
    globalForDb.pool ??
    createPool({
      host: env.MYSQL_HOST,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      port: env.MYSQL_PORT,
      database: env.MYSQL_DATABASE,
    });

  const db = drizzle({ client, schema, relations, mode: "default" });

  if (env.NODE_ENV !== "production") {
    globalForDb.pool = client;
  }

  return db;
}

export const db = await getDB();
