"use server";
import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { authenticate, expectUserWith } from "../auth";
import { unlinkProfile } from "../auth/providers/github";
import { db } from "../db";
import { oauthClients } from "../db/schema/tables";
import { supabaseAdmin } from "../supabaseAdmin";

export default async function unlinkGithubProfile() {
  const user = await expectUserWith({
    profile: { with: { oauthClient: true } },
  }).catch(() => authenticate("google", "/settings/profile"));

  const clientId = user.profile?.oauthClient?.clientId;
  if (clientId) {
    await db.transaction(async (tx) => {
      await tx
        .delete(oauthClients)
        .where(eq(oauthClients.userId, user.id));
      await supabaseAdmin.auth.admin.oauth.deleteClient(clientId);
    });
  }

  await unlinkProfile();
  refresh();
}
