import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import z from "zod";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  discordProfiles,
  SERVER_ONLY_DO_NOT_LEAK_accessTokens,
  users,
  type publicProfiles,
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
    "https://discord.com/api/oauth2/authorize?" +
      new URLSearchParams({
        state: stateToken,
        redirect_uri: redirectUri,
        response_type: "code",
        client_id: env.DISCORD_CLIENT_ID,
        scope: "identify guilds.join",
      }).toString(),
  );
}

const profileSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.string(),
});

/**
 * Retrieves access tokens and profile data from the Discord API using the authorization code and links it to a user. They will also be added to the DevDogs Discord guild.
 * @param authorizationCode The authorization code obtained via OAuth
 * @param redirectUri The same `redirectUri` used in the authorization request
 * @param publicProfile The profile of the user to link the Discord profile to (we use their preferred `name` to set their Discord nickname)
 * @see `requestAuthorization(...)`
 */
export async function linkProfile(
  authorizationCode: string,
  redirectUri: string,
  publicProfile: typeof publicProfiles.$inferSelect,
) {
  // Retrieve access/refresh tokens
  const tokens = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      code: authorizationCode,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  })
    .then((res) => res.json())
    .then((obj) => tokenResultSchema.parseAsync(obj));

  // Get Discord profile data
  const profile = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: "Bearer " + tokens.accessToken },
  })
    .then((res) => res.json())
    .then((obj) => profileSchema.parseAsync(obj));

  // Add Discord user to DevDogs Guild
  await fetch(
    `https://discord.com/api/guilds/${env.DISCORD_GUILD_ID}/members/${profile.id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: tokens.accessToken,
        nick: publicProfile.name,
        roles: [],
      }),
    },
  ).then((res) => res.json());

  // Insert Discord profile and access tokens, and link to user
  await db.transaction(async (tx) => {
    const [insertedRow] = await tx
      .insert(SERVER_ONLY_DO_NOT_LEAK_accessTokens)
      .values(tokens)
      .$returningId();

    if (!insertedRow) {
      return tx.rollback();
    }

    await tx
      .insert(discordProfiles)
      .values({ ...profile, accessTokenId: insertedRow.id });

    await tx
      .update(users)
      .set({ discordId: profile.id })
      .where(eq(users.id, publicProfile.userId));
  });
}

/**
 * Unlinks a Discord profile from a user and removes them from the DevDogs guild
 * @param discordId The target Discord user ID
 */
export async function unlinkProfile(discordId: string) {
  // Remove Discord user from DevDogs Guild (TODO: this isn't working; we need to fix the permissions in Discord)
  const result = await fetch(
    `https://discord.com/api/guilds/${env.DISCORD_GUILD_ID}/members/${discordId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
        "X-Audit-Log-Reason": "Unlinked Discord account on devdogsuga.org",
      },
    },
  );

  // Debug:
  console.log(result);

  // Remove Discord profile from database (because of cascade rules, this sets the `discordId` column on the user to `NULL` automatically)
  await db.delete(discordProfiles).where(eq(discordProfiles.id, discordId));
}
