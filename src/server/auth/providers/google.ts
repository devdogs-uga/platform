import { redirect } from "next/navigation";
import z from "zod";
import { env } from "~/env";
import { db } from "~/server/db";
import { publicProfiles, sessions, users } from "~/server/db/schema/tables";
import { tokenResultSchema } from "../schema";

/**
 * Redirects the user to the consent page. If successful, they will be returned to the redirect with an authorization code in the URL search parameters.
 * @param stateToken Used to track state and prevent CSRF attacks; this token will be present in the URL search parameters with the authorization code.
 * @param redirectUri Where to navigate the user with the authorization code after consent is obtained
 */
export function requestAuthorization(
  stateToken: string,
  redirectUri: string,
): never {
  redirect(
    "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        state: stateToken,
        redirect_uri: redirectUri,
        client_id: env.AUTH_GOOGLE_ID,
        response_type: "code",
        scope:
          "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        access_type: "online",
        include_granted_scopes: "true",
        hd: "uga.edu",
      }).toString(),
  );
}

const profileSchema = z
  .object({
    email: z.string(),
    name: z.string(),
    picture: z.string().nullish(),
  })
  .transform((obj) => ({
    ugaMyId: obj.email.split("@")[0]!,
    legalName: obj.name,
  }));

/**
 * Retrieves access tokens and profile data from the Google API using the authorization code and creates a new session. Creates a new user and public profile if they don't exist yet.
 * @param authorizationCode The authorization code obtained via OAuth
 * @param redirectUri The same `redirectUri` used in the authorization request
 * @param userAgent The user-agent (browser/device identifier) to associate with this session
 * @return The newly created session token
 * @see `requestAuthorization(...)`
 */
export async function createSession(
  authorizationCode: string,
  redirectUri: string,
  userAgent: string | null,
) {
  // Retrieve access token
  const { accessToken } = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.AUTH_GOOGLE_ID,
      client_secret: env.AUTH_GOOGLE_SECRET,
      code: authorizationCode,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  })
    .then((res) => res.json())
    .then((obj) => tokenResultSchema.parseAsync(obj));

  // Retrieve user profile data using access token
  const profile = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    {
      headers: {
        authorization: "Bearer " + accessToken,
      },
    },
  )
    .then((res) => res.json())
    .then((obj) => profileSchema.parseAsync(obj));

  // Create the session (use a transaction to ensure the entire operation succeeds or fails together)
  return await db.transaction(async (tx) => {
    // Find or create the user (and the corresponding public profile)
    const userId = await tx.transaction(async (tx2) => {
      const existingUser = await tx2.query.users.findFirst({
        where: {
          ugaMyId: {
            eq: profile.ugaMyId,
          },
        },
        columns: { id: true },
      });

      if (existingUser) {
        return existingUser.id;
      }

      // The user does not already exist: insert them
      const [insertedUser] = await tx2
        .insert(users)
        .values(profile)
        .$returningId();

      if (!insertedUser) {
        return tx2.rollback();
      }

      await tx2.insert(publicProfiles).values({
        userId: insertedUser.id,
        name: profile.legalName.split(" ")[0] ?? "",
      });

      return insertedUser.id;
    });

    // Create the session once we have the user ID
    const [insertedSession] = await tx
      .insert(sessions)
      .values({
        userId,
        userAgent,
      })
      .$returningId();

    if (!insertedSession) {
      return tx.rollback();
    }

    return insertedSession.token;
  });
}
