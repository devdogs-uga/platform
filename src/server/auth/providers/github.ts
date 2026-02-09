import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import z from "zod";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  githubProfiles,
  SERVER_ONLY_DO_NOT_LEAK_accessTokens,
  users,
} from "~/server/db/schema/tables";
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
    "https://github.com/login/oauth/authorize?" +
      new URLSearchParams({
        state: stateToken,
        redirect_uri: redirectUri,
        response_type: "code",
        client_id: env.GITHUB_CLIENT_ID,
        scope: "write:org user:email",
      }).toString(),
  );
}

const profileSchema = z.object({
  id: z.int(),
  login: z.string(),
  avatar_url: z.string(),
});

/**
 * Retrieves access tokens and profile data from the GitHub API using the authorization code and links it to a user. They will also be added as a contributor to the DevDogs GitHub organization.
 * @param authorizationCode The authorization code obtained via OAuth
 * @param redirectUri The same `redirectUri` used in the authorization request
 * @param userId The ID of the user to associate this profile with
 * @see `requestAuthorization(...)`
 */
export async function linkProfile(
  authorizationCode: string,
  redirectUri: string,
  userId: string,
) {
  // Retrieve access/refresh tokens
  const tokens = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: authorizationCode,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  })
    .then((res) => res.json())
    .then((obj) => tokenResultSchema.parseAsync(obj));

  // Get GitHub profile data
  const profile = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: "Bearer " + tokens.accessToken,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })
    .then((res) => res.json())
    .then((obj) => profileSchema.parseAsync(obj));

  // Invite GitHub user as a contributor to the DevDogs organization (TODO: add team IDs)
  await fetch(`https://api.github.com/orgs/${env.GITHUB_ORG}/invitations`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.GITHUB_TOKEN,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      invitee_id: profile.id,
      role: "direct_member",
      team_ids: [14192632],
    }),
  })
    .then((res) => res.json())
    .then(console.log)
    .catch(console.error);

  // Accept organization invitation on behalf of the user
  await fetch(
    "https://api.github.com/user/memberships/orgs/" + env.GITHUB_ORG,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + tokens.accessToken,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ state: "active" }),
    },
  )
    .then((res) => res.json())
    .then(console.log)
    .catch(console.error);

  // Insert GitHub profile and access tokens and link to user
  await db.transaction(async (tx) => {
    const [insertedRow] = await tx
      .insert(SERVER_ONLY_DO_NOT_LEAK_accessTokens)
      .values(tokens)
      .$returningId();

    if (!insertedRow) {
      return tx.rollback();
    }

    await tx
      .insert(githubProfiles)
      .values({ ...profile, accessTokenId: insertedRow.id })
      .onDuplicateKeyUpdate({
        set: {
          accessTokenId: sql`values(${githubProfiles.accessTokenId})`,
        },
      });

    await tx
      .update(users)
      .set({ githubId: profile.id })
      .where(eq(users.id, userId));
  });
}

/**
 * Unlinks a GitHub profile from a user and removes them from the DevDogs organization
 * @param githubLogin The target GitHub user login (not ID)
 */
export async function unlinkProfile(githubLogin: string) {
  // Remove GitHub user from the DevDogs organization
  await fetch(
    `https://api.github.com/orgs/${env.GITHUB_ORG}/memberships/${githubLogin}`,
    {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + env.GITHUB_TOKEN,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  // Remove Discord profile from database (because of cascade rules, this sets the `discordId` column on the user to `NULL` automatically)
  await db.delete(githubProfiles).where(eq(githubProfiles.login, githubLogin));
}
