import { env } from "~/env";
import type * as providers from "~/server/auth/providers";
import { tokenResultSchema } from "~/server/auth/schema";

export default async function getAccessToken(
  provider: (typeof providers)[keyof typeof providers],
  code: string,
) {
  // A user is following the standard OAuth flow. We request the `access_token` from the provider and get the associated profile data.
  return await fetch(provider.tokensRequest.url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: new URL("/api/auth", env.BASE_URL).toString(),
    }).toString(),
  })
    .then((res) => res.json())
    .then((obj) => tokenResultSchema.parseAsync(obj));
}
