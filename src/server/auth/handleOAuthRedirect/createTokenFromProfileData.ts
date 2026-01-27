import { eq, sql } from "drizzle-orm";
import type * as z from "zod";
import type * as providers from "~/server/auth/providers";
import { db } from "~/server/db";
import {
  oauthStates,
  SERVER_ONLY_DO_NOT_LEAK_accessTokens,
  sessions,
  users,
} from "~/server/db/schema/tables";

export async function createTokenFromProfileData<
  T extends (typeof providers)[Exclude<keyof typeof providers, "uga">],
>(
  provider: T,
  stateToken: string,
  userAgent: string | null,
  existingSessionToken: string | undefined,
  authorization: typeof SERVER_ONLY_DO_NOT_LEAK_accessTokens.$inferInsert,
  profileData: z.infer<T["profileRequest"]["validator"]>,
) {
  return await db.transaction(async (tx) => {
    const session = existingSessionToken
      ? await tx.query.sessions.findFirst({
          where: {
            token: {
              eq: existingSessionToken,
            },
          },
          with: { user: true },
        })
      : undefined;

    const user =
      session?.user ??
      // The user does not currently have a session: find them using the linked profile ID.
      (await tx.query.users.findFirst({
        where: { [provider.userRelationColumnName]: { eq: profileData.id } },
      }));

    const [insertedAuthorization] = await tx
      .insert(SERVER_ONLY_DO_NOT_LEAK_accessTokens)
      .values(authorization)
      .$returningId();

    if (!insertedAuthorization) {
      tx.rollback();
      throw new Error("Token insertion failed.");
    }

    await tx
      .insert(provider.table)
      .values({
        ...profileData,
        accessTokenId: insertedAuthorization.id,
      })
      .onDuplicateKeyUpdate({
        set: {
          accessTokenId: sql`values(${provider.table.accessTokenId})`,
        },
      });

    if (!user) {
      // The user is signing in for the first time using a non-`uga` account: we can't create a session for them (yet) because there is no `user` to associate this profile with.
      return null;
    }

    if (!user[provider.userRelationColumnName]) {
      await tx
        .update(users)
        .set({
          [provider.userRelationColumnName]: profileData.id,
        })
        .where(eq(users.id, user.id));
    }

    const [insertedSession] = await tx
      .insert(sessions)
      .values({
        userId: user.id,
        userAgent,
      })
      .$returningId();

    if (!insertedSession) {
      return tx.rollback();
    }

    await tx.delete(oauthStates).where(eq(oauthStates.token, stateToken));
    return insertedSession.token;
  });
}
