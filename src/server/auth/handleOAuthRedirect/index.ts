import { cookies } from "next/headers";
import { unauthorized, notFound, redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { authenticate, expectSession } from "~/server/auth";
import { searchParamsSchema } from "~/server/auth/schema";
import { createTokenFromProfileData } from "./createTokenFromProfileData";
import createTokenFromUserData from "./createTokenFromUserData";
import getAccessToken from "./getAccessToken";
import linkProfileToUser from "./linkProfileToUser";
import * as providers from "~/server/auth/providers";
import { db } from "~/server/db";
import { authorizationCodes } from "~/server/db/schema/tables";
import { eq } from "drizzle-orm";

/**
 * Next.js Route handler for an OAuth callback request.
 * @param request The incoming request object, which expects one of the valid search parameters shown below.
 * @returns never, when awaited (a `redirect()`, `notFound()`, or `unauthorized()` error will always be thrown)
 * @see https://medium.com/codenx/oauth-2-0-4cddd6c7471f
 */
export default async function handleOAuthRedirect(request: NextRequest) {
  const params = await searchParamsSchema
    .parseAsync(request.nextUrl.searchParams)
    .catch((e) => {
      console.error(e);
      unauthorized();
    });

  // A user is trying to "Sign in with DevDogs" via OAuth
  if ("redirect_uri" in params) {
    const [insertedAuthorization] = await db
      .insert(authorizationCodes)
      .values({
        clientId: params.client_id,
        redirectUri: params.redirect_uri,
        state: params.state,
      })
      .$returningId();

    if (!insertedAuthorization) {
      unauthorized();
    }

    redirect(
      "/api/auth?" +
        new URLSearchParams({
          authorization: insertedAuthorization.code,
        }).toString(),
    );
  }

  // A user is "Signing in with DevDogs" and has completed signing in with UGA
  if ("authorization" in params) {
    const session = await expectSession(
      "/api/auth?" +
        new URLSearchParams({
          authorization: params.authorization.code,
        }).toString(),
      {},
    );

    const [result] = await db
      .update(authorizationCodes)
      .set({ userId: session.userId })
      .where(eq(authorizationCodes.code, params.authorization.code));

    console.log(params);

    if (result.affectedRows < 1) {
      unauthorized();
    }

    redirect(
      new URL(
        "?" +
          new URLSearchParams({
            code: params.authorization.code,
            state: params.authorization.state ?? "",
          }).toString(),
        params.authorization.redirectUri,
      ).toString(),
    );
  }

  const provider = providers[params.state.realm];

  // Earlier, a user tried to sign in for the first time using a non-UGA account. They've completed creating the user, but we want to automatically link their non-UGA profile to the user.
  if ("linkUserId" in params) {
    if (provider.name === "uga") {
      notFound();
    }

    await linkProfileToUser(provider, params.state.token, params.linkUserId);
    redirect(params.state.callbackPath);
  }

  const userAgent = request.headers.get("user-agent");
  const cookieStore = await cookies();
  const authorization = await getAccessToken(provider, params.code);

  const data: unknown = await fetch(provider.profileRequest.url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${authorization.accessToken}`,
    },
  }).then((res) => res.json());

  if (provider.name === "uga") {
    const token = await provider.profileRequest.validator
      .parseAsync(data)
      .then((userData) =>
        createTokenFromUserData(params.state.token, userAgent, userData),
      );

    cookieStore.set("session", token);
    redirect(params.state.callbackPath);
  }

  const existingSessionToken = cookieStore.get("session")?.value;
  const profileData = await provider.profileRequest.validator.parseAsync(data);
  const newSessionToken = await createTokenFromProfileData(
    provider,
    params.state.token,
    userAgent,
    existingSessionToken,
    authorization,
    profileData,
  );

  if (!newSessionToken) {
    // There is no user to link this profile to: begin the authenticaiton flow using `uga`.
    return await authenticate(
      "uga",
      request.nextUrl.pathname +
        "?" +
        new URLSearchParams({
          state: params.state.token,
          linkProfile: profileData.id.toString(),
        }).toString(),
    );
  }

  cookieStore.set("session", newSessionToken);
  redirect(params.state.callbackPath);
}
