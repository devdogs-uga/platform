"use server";

import { expectSession } from "../auth";
import { db } from "../db";
import bcrypt from "bcrypt";
import { users } from "../db/schema/tables";
import { eq } from "drizzle-orm";
import { generateSecureString } from "../utilts";

export default async function resetOAuthSecret() {
  const session = await expectSession("/settings/keys", {});
  const oauthSecret = "ddk_" + generateSecureString(64);

  const encryptedSecret = await bcrypt.hash(oauthSecret, 12);

  await db
    .update(users)
    .set({ oauthSecret: encryptedSecret })
    .where(eq(users.id, session.userId));

  return { oauthSecret };
}
