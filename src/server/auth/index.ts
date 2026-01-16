import { addSeconds } from "date-fns";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound, redirect, unauthorized } from "next/navigation";
import type { NextRequest } from "next/server";
import z from "zod";
import { env } from "~/env";
import { db } from "~/server/db";
import { oauthStates, sessions, users } from "~/server/db/schema";
import * as providers from "./providers";

/**
 * Gets the currently signed in user.
 * @param include Specify data to include or exclude for the signed-in user using a Drizzle soft-relation query.
 * @returns `null` if the user is not signed in, or an object with user data if the user is signed in.
 */
export async function getSessionUser<
  T extends Exclude<
    ((Parameters<typeof db.query.sessions.findFirst>[0] & {})["with"] & {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      user: {};
    })["user"],
    true
  >,
>(include?: T) {
  const token = (await cookies()).get("session")?.value;

  if (!token) {
    return null;
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
    with: {
      user: include ?? true,
    },
  });

  return session ?? null;
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

export const tokenResultSchema = z
  .object({
    access_token: z.string(),
    token_type: z.string().toLowerCase().pipe(z.literal("bearer")),
    expires_in: z.number().optional(),
    refresh_token: z.string().optional(),
  })
  .transform((obj) => ({
    accessToken: obj.access_token,
    accessTokenExpires: obj.expires_in
      ? addSeconds(Date.now(), obj.expires_in)
      : undefined,
    refreshToken: obj.refresh_token,
  }));

const searchParamsSchema = z
  .instanceof(URLSearchParams)
  .transform((sp) => Object.fromEntries(sp.entries()))
  .pipe(
    z.intersection(
      z.object({
        state: z
          .string()
          .transform(async (stateToken) =>
            db.query.oauthStates.findFirst({
              where: eq(oauthStates.token, stateToken),
            }),
          )
          .nonoptional(),
      }),
      z.union([
        z.object({ code: z.string() }),
        z.object({ linkProfile: z.string() }),
      ]),
    ),
  );

/**
 * Next.js Route handler for an OAuth callback request.
 * @param request The incoming request object, which expects two of three valid search parameters shown below.
 *
 * **Required always:**
 * - `state` &mdash; The token identifying the current state of the authentication flow.
 *
 * **Requires exactly one of:**
 * - `code` &mdash; During the standard OAuth flow, this value allows for retrieval of a user's `access_token`. The `access_token` will then be used to request profile information about the authenticated user, which will then be inserted into the database. If this is the user's first time signing in and they are using a realm other than `uga`, they will be redirected to authenticate with `uga` first. This second authentication request will use `/api/auth?state=...&linkProfile=...` as the callback path.
 * - `linkProfile` &mdash; After a standard OAuth flow, this value allows for a user's non-`uga` profile to be linked to their newly created account.
 *
 * @returns never, when awaited (a `redirect()`, `notFound()`, or `unauthorized()` error will always be thrown)
 * @see https://medium.com/codenx/oauth-2-0-4cddd6c7471f
 */
export async function handleOAuthRedirect(request: NextRequest) {
  const cookieStore = await cookies();
  const params = await searchParamsSchema
    .parseAsync(request.nextUrl.searchParams)
    .catch(() => unauthorized());

  const provider = providers[params.state.realm];

  if ("linkProfile" in params) {
    // [Case 2] A user tried to sign in for the first time using a non-`uga` account. They've completed creaeting the UGA account, but we want to automatically link their non-`uga` profile to the `uga` user.

    if (provider.name === "uga") {
      notFound();
    }

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ [provider.userRelationColumnName]: params.linkProfile });

      await tx
        .delete(oauthStates)
        .where(eq(oauthStates.token, params.state.token));
    });

    redirect(params.state.callbackPath);
  }

  // [Case 1] A user is following the standard OAuth flow. We request the `access_token` from the provider and get the associated profile data.
  const tokens = await fetch(provider.tokensRequest.url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code: params.code,
      grant_type: "authorization_code",
      redirect_uri: new URL("/api/auth", env.BASE_URL).toString(),
    }).toString(),
  })
    .then((res) => res.json())
    .then((obj) => tokenResultSchema.parseAsync(obj));

  // We wait to parse the data so TypeScript can appropriately infer types.
  const profileData: unknown = await fetch(provider.profileRequest.url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  }).then((res) => res.json());

  if (provider.name === "uga") {
    // [Case 1-1] The user is signing in with their `uga` account.

    const profile =
      await provider.profileRequest.validator.parseAsync(profileData);

    const token = await db
      .transaction(async (tx) => {
        const user =
          (await tx.query.users.findFirst({
            where: eq(users.email, profile.email),
            columns: { id: true },
          })) ??
          // Case [1-1-1] The user does not already exist: insert them and return their ID.
          (await tx.insert(provider.table).values(profile).$returningId())[0];

        if (!user) {
          return tx.rollback();
        }

        const [insertedSession] = await tx
          .insert(sessions)
          .values({
            userId: user.id,
            userAgent: request.headers.get("user-agent"),
          })
          .$returningId();

        if (!insertedSession) {
          return tx.rollback();
        }

        await tx
          .delete(oauthStates)
          .where(eq(oauthStates.token, params.state.token));
        return insertedSession.token;
      })
      .catch((error) => {
        console.error(error);
        notFound();
      });

    cookieStore.set("session", token);
    redirect(params.state.callbackPath);
  }

  // [Case 1-2] The user is signing in with their non-`uga` account.

  const profile =
    await provider.profileRequest.validator.parseAsync(profileData);
  const sessionToken = cookieStore.get("session")?.value;

  const token = await db
    .transaction(async (tx) => {
      const session = sessionToken
        ? await tx.query.sessions.findFirst({
            where: eq(sessions.token, sessionToken),
            with: { user: true },
          })
        : undefined;

      const user =
        session?.user ??
        // Case [1-2-1] The user does not currently have a session: find them using the linked profile ID.
        (await tx.query.users.findFirst({
          where: eq(users[provider.userRelationColumnName], profile.id),
        }));

      await tx
        .insert(provider.table)
        .values({
          ...profile,
          ...tokens,
        })
        .onDuplicateKeyUpdate({
          set: tokens,
        });

      if (!user) {
        // Case [1-2-2] The user is signing in for the first time using a non-`uga` account: we can't create a session for them (yet) because there is no `user` to associate this profile with.
        return null;
      }

      if (!user[provider.userRelationColumnName]) {
        await tx
          .update(users)
          .set({
            [provider.userRelationColumnName]: profile.id,
          })
          .where(eq(users.id, user.id));
      }

      const [insertedSession] = await tx
        .insert(sessions)
        .values({
          userId: user.id,
          userAgent: request.headers.get("user-agent"),
        })
        .$returningId();

      if (!insertedSession) {
        return tx.rollback();
      }

      await tx
        .delete(oauthStates)
        .where(eq(oauthStates.token, params.state.token));
      return insertedSession.token;
    })
    .catch((error) => {
      console.error(error);
      notFound();
    });

  if (token === null) {
    // Continued: [Case 1-2-2] Begin the authenticaiton flow using `uga`. See [Case 2].
    return await authenticate(
      "uga",
      request.nextUrl.pathname +
        "?" +
        new URLSearchParams({
          state: params.state.token,
          linkProfile: profile.id.toString(),
        }).toString(),
    );
  }

  (await cookies()).set("session", token);
  redirect(params.state.callbackPath);
}
