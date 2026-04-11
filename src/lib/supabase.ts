import { createBrowserClient } from "@supabase/ssr";
import { env } from "~/env";

/**
 * Creates a Supabase browser client using the public anon key.
 * Safe to call from client components and hooks.
 * `createBrowserClient` is memoized — repeated calls with the same args
 * return the same instance.
 */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
