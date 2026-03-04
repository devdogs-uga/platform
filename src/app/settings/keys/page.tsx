import OAuthSecrets from "~/components/OAuthSecrets";
import SettingsNavigation from "~/components/SettingsNavigation";
import TicTacToeKey from "~/components/TicTacToeKey";
import { expectSession } from "~/server/auth";

export default async function Keys() {
  const session = await expectSession("/settings/profile", {
    oauthKey: {
      columns: {
        clientId: true,
      },
    },
    ticTacToeKey: {
      columns: {
        publicKey: true
      }
    }
  });

  return (
    <SettingsNavigation title="Public Profile" pathname="/settings/keys">
      <section className="w-full overflow-hidden rounded-md border border-zinc-800">
        <OAuthSecrets clientId={session.oauthKey?.clientId ?? null} />
      </section>
      <section className="w-full overflow-hidden rounded-md border border-zinc-800">
        <TicTacToeKey publicKey={session.ticTacToeKey?.publicKey ?? null} />
      </section>
    </SettingsNavigation>
  );
}
