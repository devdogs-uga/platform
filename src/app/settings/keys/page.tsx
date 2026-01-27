import OAuthSecrets from "~/components/OAuthSecrets";
import SettingsNavigation from "~/components/SettingsNavigation";
import { expectSession } from "~/server/auth";

export default async function Keys() {
  const session = await expectSession("/settings/profile", {
    user: true,
  });

  return (
    <SettingsNavigation title="Public Profile" pathname="/settings/keys">
      <section className="w-full overflow-hidden rounded-md border border-zinc-800">
        <OAuthSecrets userId={session.userId} />
      </section>
    </SettingsNavigation>
  );
}
