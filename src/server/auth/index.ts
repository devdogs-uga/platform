import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import type { NextRequest } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import { authorizationCodes, oauthStates } from "~/server/db/schema/tables";
import * as providers from "./providers";

/**
 * Gets the currently signed in user.
 * @param include Specify data to include or exclude for the session using a Drizzle soft-relation query.
 * @returns `null` if the user is not signed in, or an object with session data if the user is signed in.
 */
export async function getSession<
  T extends (Parameters<typeof db.query.sessions.findFirst>[0] & {})["with"],
>(include: T) {
  const token = (await cookies()).get("session")?.value;

  if (!token) {
    return null;
  }

  const session = await db.query.sessions.findFirst({
    where: {
      token: {
        eq: token,
      },
    },
    with: include,
  });

  return session ?? null;
}

/**
 * Gets the currently signed in user.
 * @param callbackPath Where to return after signing in
 * @param include Specify data to include or exclude for the session using a Drizzle soft-relation query.
 * @returns The session data. If there is no session present, the user is redirected to the sign-in page.
 */
export async function expectSession<
  T extends (Parameters<typeof db.query.sessions.findFirst>[0] & {})["with"],
>(callbackPath: string, include: T) {
  const token = (await cookies()).get("session")?.value;

  if (!token) {
    await authenticate("uga", callbackPath);
    throw new Error("Unreachable after redirect");
  }

  const session = await db.query.sessions.findFirst({
    where: {
      token: {
        eq: token,
      },
    },
    with: include,
  });

  if (!session) {
    await authenticate("uga", callbackPath);
    throw new Error("Unreachable after redirect");
  }

  return session;
}

/**
 * Redirects the user to the appropriate OAuth consent URL.
 * @param realm The authentication provider
 * @param callbackPath Where to redirect the user after the authentication flow is complete (defaults to `/`)
 * @see https://medium.com/codenx/oauth-2-0-4cddd6c7471f
 */
export async function authenticate(
  realm: "uga" | "discord" | "github",
  callbackPath?: string,
) {
  const [insertedState] = await db
    .insert(oauthStates)
    .values({
      realm,
      callbackPath,
    })
    .$returningId();

  if (!insertedState) {
    throw new Error("Failed to insert state into database.");
  }

  const provider = providers[realm];

  redirect(
    provider.consentRequest.url +
      "?" +
      new URLSearchParams({
        client_id: provider.clientId,
        redirect_uri: new URL("/api/auth", env.BASE_URL).toString(),
        response_type: "code",
        state: insertedState.token,
        ...provider.consentRequest.params,
      }).toString(),
  );
}

export { default as handleOAuthRedirect } from "./handleOAuthRedirect";

export async function handleProfileRequest(request: NextRequest) {
  const data = await request.formData();
  const clientId = data.get("client_id");
  const clientSecret = data.get("client_secret");
  const code = data.get("code");
  const grantType = data.get("grant_type");
  const redirectUri = data.get("redirect_uri");

  if (
    grantType !== "authorization_code" ||
    typeof clientId !== "string" ||
    typeof clientSecret !== "string" ||
    typeof code !== "string" ||
    typeof clientId !== "string" ||
    typeof redirectUri !== "string"
  ) {
    console.error("Invalid request");
    unauthorized();
  }

  const authorization = await db.query.authorizationCodes.findFirst({
    where: {
      code: { eq: code },
      clientId: { eq: clientId },
      redirectUri: { eq: redirectUri },
    },
    with: {
      client: {
        columns: {
          oauthSecret: true,
        },
      },
      user: {
        with: {
          publicProfile: true,
        },
        columns: {
          ugaMyId: true,
        },
      },
    },
  });

  if (
    !authorization?.user ||
    !authorization.client.oauthSecret ||
    !(await bcrypt.compare(clientSecret, authorization.client.oauthSecret))
  ) {
    unauthorized();
  }

  await db.delete(authorizationCodes).where(eq(authorizationCodes.code, code));
  return Response.json({
    ...authorization.user.publicProfile,
    id: authorization.user.ugaMyId,
  });
}
