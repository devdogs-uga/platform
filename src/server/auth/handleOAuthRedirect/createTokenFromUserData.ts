import { eq } from "drizzle-orm";
import type * as z from "zod";
import type * as providers from "~/server/auth/providers";
import { db } from "~/server/db";
import {
  oauthStates,
  publicProfiles,
  sessions,
  users,
} from "~/server/db/schema/tables";

export default async function createTokenFromUserData(
  stateToken: string,
  userAgent: string | null,
  userData: z.infer<typeof providers.uga.profileRequest.validator>,
) {
  return await db.transaction(async (tx) => {
    const userId = await tx.transaction(async (tx2) => {
      const existingUser = await tx2.query.users.findFirst({
        where: {
          ugaMyId: {
            eq: userData.ugaMyId,
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
        .values(userData)
        .$returningId();

      if (!insertedUser) {
        return tx2.rollback();
      }

      await tx2.insert(publicProfiles).values({
        id: insertedUser.id,
        name: userData.legalName.split(" ")[0] ?? "",
      });

      return insertedUser.id;
    });

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

    await tx.delete(oauthStates).where(eq(oauthStates.token, stateToken));

    return insertedSession.token;
  });
}
