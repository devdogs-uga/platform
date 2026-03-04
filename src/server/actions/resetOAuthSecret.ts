"use server";

import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";
import { env } from "~/env";
import { expectSession } from "../auth";
import { db } from "../db";
import { oauthKeys } from "../db/schema/tables";
import { generateSecureString } from "../utilts";

export default async function resetOAuthSecret() {
  const session = await expectSession("/settings/keys", {});
  const clientId = createId();
  const clientSecret = "ddk_" + generateSecureString(64);

  await db
    .insert(oauthKeys)
    .values({
      userId: session.userId,
      clientId,
      clientSecret: await bcrypt.hash(clientSecret, env.BCRYPT_ROUNDS),
    })
    .onDuplicateKeyUpdate({
      set: {
        clientId: sql`values(${oauthKeys.clientId})`,
        clientSecret: sql`values(${oauthKeys.clientSecret})`,
      },
    });

  return { clientId, clientSecret };
}
