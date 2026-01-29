import type { PropsWithChildren, ReactNode } from "react";
import {
  PiDiscordLogoBold,
  PiGithubLogoBold,
  PiLinkBreakBold,
} from "react-icons/pi";
import FormButton from "~/components/FormButton";
import SettingsNavigation from "~/components/SettingsNavigation";
import linkDiscordProfile from "~/server/actions/linkDiscordProfile";
import linkGithubProfile from "~/server/actions/linkGithubProfile";
import unlinkDiscordProfile from "~/server/actions/unlinkDiscordProfile";
import unlinkGithubProfile from "~/server/actions/unlinkGithubProfile";
import { expectSession } from "~/server/auth";

interface Props extends PropsWithChildren {
  linkProfileAction: (formData: FormData) => Promise<void>;
  unlinkProfileAction: () => Promise<void>;
  identifier?: string;
  logo: ReactNode;
  friendlyName: string;
}

function AccountCard({
  linkProfileAction,
  unlinkProfileAction,
  identifier,
  logo,
  friendlyName,
  children,
}: Props) {
  return (
    <section className="w-full overflow-hidden rounded-md border border-zinc-800">
      <div className="flex flex-col gap-3 bg-zinc-900 px-4 py-5 inset-shadow-sm">
        <h3 className="text-xl font-bold">{friendlyName}</h3>

        <p className="max-w-prose text-sm text-zinc-300">{children}</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 border-t border-zinc-800 bg-black p-4 font-medium sm:flex-row sm:justify-between">
        {identifier ? (
          <form className="contents" action={unlinkProfileAction}>
            <input
              className="hidden"
              type="hidden"
              name="callbackPath"
              value="/settings/accounts"
            />

            <p>
              Currently linked to{" "}
              <span className="cursor-default rounded-sm bg-zinc-800 px-1 py-0.5 font-mono text-rose-400">
                @{identifier}
              </span>
            </p>

            <FormButton
              className="rounded-md bg-purple-900 px-5 py-1.5 ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950"
              type="submit"
            >
              <PiLinkBreakBold />
              Unlink Account
            </FormButton>
          </form>
        ) : (
          <form className="contents" action={linkProfileAction}>
            <input
              className="hidden"
              type="hidden"
              name="callbackPath"
              value="/settings/accounts"
            />

            <p>No account linked.</p>

            <FormButton
              className="rounded-md bg-purple-900 px-5 py-1.5 ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950"
              type="submit"
            >
              {logo}
              Sign in with {friendlyName}
            </FormButton>
          </form>
        )}
      </div>
    </section>
  );
}

export default async function Settings() {
  const session = await expectSession("/settings/accounts", {
    user: {
      with: {
        discord: { columns: { username: true } },
        github: { columns: { login: true } },
      },
    },
  });

  return (
    <SettingsNavigation title="Linked Accounts" pathname="/settings/accounts">
      <AccountCard
        friendlyName="GitHub"
        logo={<PiGithubLogoBold />}
        identifier={session.user.github?.login}
        linkProfileAction={linkGithubProfile}
        unlinkProfileAction={unlinkGithubProfile}
      >
        <span className="inline-block">
          DevDogs uses GitHub to manage source code and organize contributions.
        </span>
        <span className="inline-block">
          Get access to this year&rsquo;s project by linking your GitHub
          account.
        </span>
        <span className="inline-block">
          Don&rsquo;t have a GitHub account? Don&rsquo;t worry, it&rsquo;s free!
        </span>
      </AccountCard>

      <AccountCard
        friendlyName="Discord"
        logo={<PiDiscordLogoBold />}
        identifier={session.user.discord?.username}
        linkProfileAction={linkDiscordProfile}
        unlinkProfileAction={unlinkDiscordProfile}
      >
        <span className="inline-block">
          DevDogs uses Discord for communicating with members.
        </span>
        <span className="inline-block">
          Get access to the DevDogs server by linking your Discord account.
        </span>
        <span className="inline-block">
          It&rsquo;s like Slack, but more laid-back.
        </span>
        <span className="inline-block">
          Don&rsquo;t have a Discord account? Don&rsquo;t worry, it&rsquo;s
          free!
        </span>
      </AccountCard>
    </SettingsNavigation>
  );
}
