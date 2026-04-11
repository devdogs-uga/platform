import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import AvatarUpload from "~/components/AvatarUpload";
import ConnectedAccounts from "~/components/ConnectedAccounts";
import ProfileIdentity from "~/components/ProfileIdentity";
import ProfileLinks from "~/components/ProfileLinks";
import SettingsNavigation from "~/components/SettingsNavigation";
import { expectUserWith } from "~/server/auth";
import { db } from "~/server/db";
import { profiles } from "~/server/db/schema/tables";

export default async function Settings() {
  const user = await expectUserWith({
    profile: {
      with: { links: true },
    },
    githubIdentity: { columns: { identityData: true } },
    discordIdentity: { columns: { identityData: true } },
  }).catch(() => redirect("/api/auth"));

  if (!user.profile?.viewedSettings) {
    await db
      .update(profiles)
      .set({ viewedSettings: true })
      .where(eq(profiles.userId, user.id));
  }

  const githubLogin = user.githubIdentity?.identityData?.user_name;
  const discordLogin = user.discordIdentity?.identityData?.user_name;

  return (
    <SettingsNavigation title="Profile" pathname="/settings/profile">
      <AvatarUpload userId={user.id} preferredName={user.profile.preferredName} />

      <ProfileIdentity
        userId={user.id}
        initialName={user.profile.preferredName}
        email={user.email}
      />

      <ProfileLinks initialLinks={user.profile.links} />

      <ConnectedAccounts
        userId={user.id}
        githubLogin={githubLogin}
        discordUsername={discordLogin}
        showGithub={user.profile.showGithub}
        showDiscord={user.profile.showDiscord}
      />
    </SettingsNavigation>
  );
}
