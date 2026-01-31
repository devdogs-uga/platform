/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from "next";
import "./src/env.ts";

const config = {
  async redirects() {
    return [
      {
        source: "/api/auth/callback/google",
        destination: "/api/auth",
        permanent: true,
      },
      {
        source: "/settings",
        destination: "/settings/profile",
        permanent: false,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.{graphql,gql}": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
    resolveExtensions: [".graphql", ".gql", ".js", ".jsx", ".ts", ".tsx"],
  },
  experimental: {
    authInterrupts: true,
  },
} satisfies NextConfig;

export default config;
