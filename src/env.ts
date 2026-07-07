import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

function switchEnvironment<T, D, P>(opt: {
  test?: T;
  development: D;
  production: P;
}) {
  return opt[process.env.NODE_ENV] ?? opt["development"];
}

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    BASE_URL: switchEnvironment({
      development: z
        .url()
        .default(`http://localhost:${process.env.PORT ?? 3000}`),
      production: z
        .string()
        .transform((str) => "https://" + str)
        .pipe(z.url()),
    }),
    BCRYPT_ROUNDS: z.number().default(12),
    CRON_SECRET: switchEnvironment({
      development: z.string().default(""),
      production: z.string().min(32),
    }),
    DEVDOGS_EPOCH: z.coerce.date().default(new Date(2024, 7, 22)),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    DISCORD_GUILD_ID: z.string(),
    DISCORD_PUBLIC_KEY: z.string(),
    DISCORD_TOKEN: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GITHUB_ORG: z.string(),
    GITHUB_TOKEN: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    MYSQL_USER: switchEnvironment({
      development: z.string().default("root"),
      production: z.string(),
    }),
    MYSQL_PASSWORD: z.string().default("password"),
    MYSQL_HOST: z.string().default("localhost"),
    MYSQL_PORT: z.coerce.number().min(1).max(65536).default(25060),
    MYSQL_DATABASE: z.string().default("devdogs"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    S3_PORT: z.coerce.number().min(1).max(65536).default(4566),
    S3_REGION: z.string().default("us-east-1"),
    S3_ACCESS_KEY_ID: z.string().default("test"),
    S3_SECRET_ACCESS_KEY: z.string().default("test"),
    SHARED_AUTH_CLIENT_ID: switchEnvironment({
      development: z.string().optional(),
      production: z.string().min(16),
    }),
    SHARED_AUTH_CLIENT_SECRET: switchEnvironment({
      development: z.string().optional(),
      production: z.string().min(32),
    }),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    BASE_URL:
      process.env.BASE_URL ??
      (process.env.VERCEL_ENV === "production"
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL
        : process.env.VERCEL_URL),
    BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
    CRON_SECRET: process.env.CRON_SECRET,
    DEVDOGS_EPOCH: process.env.DEVDOGS_EPOCH,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_ORG: process.env.GITHUB_ORG,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
    DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY,
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    MYSQL_USER: process.env.MYSQL_USER,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_PORT: process.env.MYSQL_PORT,
    MYSQL_DATABASE: process.env.MYSQL_DATABASE,
    NODE_ENV: process.env.NODE_ENV,
    S3_PORT: process.env.S3_PORT,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    SHARED_AUTH_CLIENT_ID: process.env.SHARED_AUTH_CLIENT_ID,
    SHARED_AUTH_CLIENT_SECRET: process.env.SHARED_AUTH_CLIENT_SECRET,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
