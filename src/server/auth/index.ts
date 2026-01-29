import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound, redirect, unauthorized } from "next/navigation";
import type { NextRequest } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import { authorizationCodes, oauthStates } from "~/server/db/schema/tables";
import * as discord from "./providers/discord";
import * as github from "./providers/github";
import * as google from "./providers/google";
import { searchParamsSchema } from "./schema";

const OAUTH_REDIRECT_URI = new URL("/api/auth", env.BASE_URL).toString();

/**
 * Starts the OAuth flow with a specified provider
 * @param provider One of `"google"`, `"discord"`, or `"github"`
 * @param callbackPath Where to navigate the user to after the OAuth flow is complete
 */
export async function authenticate(
  provider: "google" | "discord" | "github",
  callbackPath: string,
) {
  // We expect that users attempting to link their discord/github profile are signed in
  if (provider !== "google") {
    await expectSession(null, {});
  }

  const [insertedState] = await db
    .insert(oauthStates)
    .values({
      callbackPath,
      provider,
    })
    .$returningId();

  if (!insertedState) {
    throw new Error("Failed to insert state into database.");
  }

  switch (provider) {
    case "google":
      return google.requestAuthorization(
        insertedState.token,
        OAUTH_REDIRECT_URI,
      );
    case "discord":
      return discord.requestAuthorization(
        insertedState.token,
        OAUTH_REDIRECT_URI,
      );
    case "github":
      return github.requestAuthorization(
        insertedState.token,
        OAUTH_REDIRECT_URI,
      );
  }
}

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
 * @param callbackPath Where to return after signing in if a session is not present. If this is `null`, then an `unauthorized()` error will be thrown.
 * @param include Specify data to include or exclude for the session using a Drizzle soft-relation query.
 * @returns The session data.
 */
export async function expectSession<
  T extends (Parameters<typeof db.query.sessions.findFirst>[0] & {})["with"],
>(callbackPath: string | null, include: T) {
  const token = (await cookies()).get("session")?.value;

  if (!token) {
    if (callbackPath === null) {
      notFound();
    }

    return await authenticate("google", callbackPath);
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
    if (callbackPath === null) {
      notFound();
    }

    return await authenticate("google", callbackPath);
  }

  return session;
}

export async function handleOAuthRedirect(request: NextRequest) {
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
      .$returningId()
      .catch(() =>
        // If this insert fails, it's almost certainly because the `clientId` foreign key constraint is invalid (i.e., they're using a phony client ID)
        unauthorized(),
      );

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

  if (params.state.provider === "github") {
    const session = await expectSession(null, {});
    await github.linkProfile(params.code, OAUTH_REDIRECT_URI, session.userId);
    redirect(params.state.callbackPath);
  }

  if (params.state.provider === "discord") {
    const session = await expectSession(null, {
      user: { columns: {}, with: { publicProfile: true } },
    });

    await discord.linkProfile(
      params.code,
      OAUTH_REDIRECT_URI,
      session.user.publicProfile,
    );

    redirect(params.state.callbackPath);
  }

  const sessionToken = await google.createSession(
    params.code,
    OAUTH_REDIRECT_URI,
    request.headers.get("user-agent"),
  );

  (await cookies()).set("session", sessionToken);
  redirect(params.state.callbackPath);
}

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
