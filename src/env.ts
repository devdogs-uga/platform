import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

function switchEnvironment<T, R>(opt: { local: T; vercel: R }) {
  return process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "development"
    ? opt.vercel
    : opt.local;
}

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    BASE_URL: switchEnvironment({
      local: z.string().default(`http://localhost:${process.env.PORT ?? 3000}`),
      vercel: z
        .string()
        .transform((str) => "https://" + str)
        .pipe(z.url()),
    }),
    CRON_SECRET: switchEnvironment({
      local: z.string().default(""),
      vercel: z.string().min(32),
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
    MYSQL_USER: switchEnvironment({
      local: z.string().default("root"),
      vercel: z.string(),
    }),
    MYSQL_PASSWORD: z.string().default("password"),
    MYSQL_HOST: z.string().default("localhost"),
    MYSQL_PORT: z.coerce.number().min(1).max(65536).default(25060),
    MYSQL_DATABASE: z.string().default("devdogs"),
    S3_PORT: z.coerce.number().min(1).max(65536).default(4566),
    S3_REGION: z.string().default("us-east-1"),
    S3_ACCESS_KEY_ID: z.string().default("test"),
    S3_SECRET_ACCESS_KEY: z.string().default("test"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
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
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    BASE_URL:
      process.env.BASE_URL ??
      (process.env.VERCEL_ENV === "production"
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL
        : process.env.VERCEL_URL),
    CRON_SECRET: process.env.CRON_SECRET,
    DEVDOGS_EPOCH: process.env.DEVDOGS_EPOCH,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_ORG: process.env.GITHUB_ORG,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
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
    S3_PORT: process.env.S3_PORT,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    NODE_ENV: process.env.NODE_ENV,
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
