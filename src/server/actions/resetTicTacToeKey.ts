"use server";

import { sql } from "drizzle-orm";
import { expectSession } from "../auth";
import { db } from "../db";
import { ticTacToeKeys } from "../db/schema/tables";
import { generateSecureString } from "../utilts";

export default async function resetTicTacToeKey() {
  const session = await expectSession("/settings/keys", {});
  const publicKey = "ddk_public_" + generateSecureString(64);

  await db
    .insert(ticTacToeKeys)
    .values({
      userId: session.userId,
      publicKey,
    })
    .onDuplicateKeyUpdate({
      set: {
        publicKey: sql`values(${ticTacToeKeys.publicKey})`,
      },
    });

  return { publicKey };
}
