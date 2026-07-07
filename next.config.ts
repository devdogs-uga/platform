/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from "next";
import "./src/env";

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
      {
        source: "/figma",
        destination: "https://www.figma.com/design/kxPCNYIOPq9flyic9EPkf7/Figma-Workshop?node-id=23-57&t=ETWjANYllL07lHyJ-1",
        permanent: false,
      }
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

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
