import { type Config } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export default {
  schema: "./src/server/db/schema/tables.ts",
  dialect: "postgresql",
  out: "./drizzle",
  casing: "camelCase",
  schemaFilter: ["public"],
  dbCredentials: {
    url: process.env.DB_URL!,
  },
  entities: {
    roles: {
      provider: "supabase",
      exclude: ["supabase_auth_admin"],
    },
  },
} satisfies Config;
