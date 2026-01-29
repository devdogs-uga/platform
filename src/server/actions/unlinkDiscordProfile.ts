"use server";
import { refresh } from "next/cache";
import { expectSession } from "../auth";
import { unlinkProfile } from "../auth/providers/discord";

export default async function unlinkDiscordProfile() {
  const session = await expectSession(null, {
    user: { columns: { discordId: true } },
  });

  if (session.user.discordId) {
    await unlinkProfile(session.user.discordId);
  }

  refresh();
}
