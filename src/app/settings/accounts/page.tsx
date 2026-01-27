import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { PropsWithChildren, ReactNode } from "react";
import {
  PiDiscordLogoBold,
  PiGithubLogoBold,
  PiLinkBreakBold,
} from "react-icons/pi";
import FormButton from "~/components/FormButton";
import SettingsNavigation from "~/components/SettingsNavigation";
import signIn from "~/server/actions/signIn";
import { expectSession } from "~/server/auth";
import { db } from "~/server/db";
import { discordProfiles, users } from "~/server/db/schema/tables";

interface Props extends PropsWithChildren {
  unlinkAction: (formData: FormData) => Promise<void>;
  identifier?: string;
  realm: string;
  logo: ReactNode;
  friendlyName: string;
}

function AccountCard({
  unlinkAction,
  identifier,
  realm,
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
          <form className="contents" action={unlinkAction}>
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
          <form className="contents" action={signIn}>
            <input
              className="hidden"
              type="hidden"
              name="realm"
              value={realm}
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

  async function unlinkGithub() {
    "use server";

    await db
      .update(users)
      .set({ githubId: null })
      .where(eq(users.id, session.userId));

    revalidatePath("/settings/account");
  }

  async function unlinkDiscord() {
    "use server";

    if (session.user.discordId) {
      await db
        .delete(discordProfiles)
        .where(eq(discordProfiles.id, session.user.discordId));
    }

    revalidatePath("/settings/account");
  }

  return (
    <SettingsNavigation title="Linked Accounts" pathname="/settings/accounts">
      <AccountCard
        identifier={session.user.github?.login}
        unlinkAction={unlinkGithub}
        realm="github"
        friendlyName="GitHub"
        logo={<PiGithubLogoBold />}
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
        identifier={session.user.discord?.username}
        unlinkAction={unlinkDiscord}
        realm="discord"
        friendlyName="Discord"
        logo={<PiDiscordLogoBold />}
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
