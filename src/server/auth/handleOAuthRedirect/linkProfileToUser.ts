import { eq } from "drizzle-orm";
import type * as providers from "~/server/auth/providers";
import { db } from "~/server/db";
import { oauthStates, users } from "~/server/db/schema/tables";

// A user tried to sign in for the first time using a non-`uga` account. They've completed creaeting the UGA account, but we want to automatically link their non-`uga` profile to the `uga` user.
export default async function linkProfileToUser<
  T extends (typeof providers)[Exclude<keyof typeof providers, "uga">],
>(provider: T, stateToken: string, userId: string) {
  await db.transaction(async (tx) => {
    await tx.update(users).set({ [provider.userRelationColumnName]: userId });
    await tx.delete(oauthStates).where(eq(oauthStates.token, stateToken));
  });
}
