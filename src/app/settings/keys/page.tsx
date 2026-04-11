import { redirect } from "next/navigation";
import OAuthKeys from "~/components/OAuthKeys";
import SettingsNavigation from "~/components/SettingsNavigation";
import { env } from "~/env";
import { expectUserWith } from "~/server/auth";
import { supabaseAdmin } from "~/server/supabaseAdmin";

export default async function Keys() {
  const { profile, githubIdentity } = await expectUserWith({
    profile: { with: { oauthClient: true } },
    githubIdentity: { columns: { id: true } },
  }).catch(() => redirect("/api/auth"));

  const clientId = profile?.oauthClient?.clientId ?? null;

  const redirectUris: string[] = [];

  if (clientId) {
    const { data } = await supabaseAdmin.auth.admin.oauth.getClient(clientId);

    if (data) {
      redirectUris.push(...data.redirect_uris);
    }
  }

  return (
    <SettingsNavigation title="Profile" pathname="/settings/keys">
      <section className="w-full overflow-hidden rounded-md border border-zinc-800">
        <OAuthKeys
          clientId={clientId}
          redirectUris={redirectUris}
          oauthUrl={env.API_URL}
          hasGithub={githubIdentity !== null}
        />
      </section>
    </SettingsNavigation>
  );
}
