"use server";
import { refresh } from "next/cache";
import { expectSession } from "../auth";
import { unlinkProfile } from "../auth/providers/github";

export default async function unlinkGithubProfile() {
  const session = await expectSession(null, {
    user: { columns: {}, with: { github: { columns: { login: true } } } },
  });

  if (session.user.github?.login) {
    await unlinkProfile(session.user.github.login);
  }

  refresh();
}
