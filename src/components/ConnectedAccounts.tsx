"use client";

import {
  PiDiscordLogoBold,
  PiGithubLogoBold,
  PiLinkBreakBold,
} from "react-icons/pi";
import { useAccountVisibility } from "~/hooks/useAccountVisibility";
import linkDiscordProfile from "~/server/actions/linkDiscordProfile";
import linkGithubProfile from "~/server/actions/linkGithubProfile";
import unlinkDiscordProfile from "~/server/actions/unlinkDiscordProfile";
import unlinkGithubProfile from "~/server/actions/unlinkGithubProfile";
import ConfirmDestructiveAction from "./ConfirmDestructiveAction";
import FormButton from "./FormButton";
import IconInput from "./IconInput";
import Toggle from "./Toggle";

interface Props {
  userId: string,
  githubLogin?: string;
  discordUsername?: string;
  showGithub: boolean;
  showDiscord: boolean;
}

export default function ConnectedAccounts({
  userId,
  githubLogin,
  discordUsername,
  showGithub: initialShowGithub,
  showDiscord: initialShowDiscord,
}: Props) {
  const { showGithub, showDiscord, toggle, isPending } = useAccountVisibility(userId, {
    showGithub: initialShowGithub,
    showDiscord: initialShowDiscord,
  });

  return (
    <section
      className="w-full overflow-hidden rounded-md border border-zinc-800"
      id="connectedAccounts"
    >
      <div className="flex flex-col gap-6 bg-zinc-900 px-4 py-5 inset-shadow-sm">
        <h3 className="text-xl font-bold">Connected Accounts</h3>

        <div className="flex flex-col gap-3">
          <h4 className="flex items-center">GitHub</h4>
          <p className="-mt-1.5 max-w-prose text-xs text-balance text-zinc-300">
            DevDogs uses GitHub to manage source code and organize
            contributions. Get access to this year&rsquo;s project by linking
            your GitHub account.
          </p>

          {githubLogin ? (
            <>
              <form
                className="flex items-center gap-3 self-start text-sm"
                onSubmit={(e) => {
                  e.preventDefault();
                  toggle("github");
                }}
              >
                <label className="contents">
                  <span className="w-12 text-base">
                    <Toggle
                      checked={showGithub}
                      pending={isPending("github")}
                      disabled={isPending("github")}
                    />
                  </span>
                  Display on Profile
                </label>
                <span className="text-zinc-400">
                  {showGithub ? "(Currently Visible)" : "(Currently Hidden)"}
                </span>
              </form>
              <IconInput
                icon={<PiGithubLogoBold />}
                defaultValue={githubLogin}
                readOnly
                disabled
                type="text"
              />
              <div className="flex w-full max-w-sm justify-end">
                <ConfirmDestructiveAction
                  action={unlinkGithubProfile}
                  title="Unlink GitHub"
                  description="Unlinking your GitHub account will remove you from the DevDogs organization and revoke your access to this year's project repositories. If you have an active OAuth client, it will be deleted, and your existing client ID and secret will be permanently invalidated."
                  submitLabel="Unlink GitHub"
                  userConfirmText="Unlink GitHub"
                >
                  <FormButton
                    className="rounded-sm bg-rose-900 px-3 py-1 text-sm font-medium text-nowrap ring-rose-950 hover:not-disabled:bg-rose-200 hover:not-disabled:text-rose-950"
                    type="submit"
                  >
                    <PiLinkBreakBold />
                    Unlink Account
                  </FormButton>
                </ConfirmDestructiveAction>
              </div>
            </>
          ) : (
            <form className="contents" action={linkGithubProfile}>
              <input
                type="hidden"
                name="callbackPath"
                value="/settings/profile"
              />
              <p className="text-sm text-zinc-400">GitHub not linked.</p>
              <FormButton className="w-fit rounded-md bg-purple-900 px-5 py-1.5 text-sm font-medium ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950">
                <PiGithubLogoBold />
                Sign in with GitHub
              </FormButton>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="flex items-center">Discord</h4>
          <p className="-mt-1.5 max-w-prose text-xs text-balance text-zinc-300">
            DevDogs uses Discord for communicating with members. Get access to
            the DevDogs server by linking your Discord account.
          </p>

          {discordUsername ? (
            <>
              <form
                className="flex items-center gap-3 self-start text-sm"
                onSubmit={(e) => {
                  e.preventDefault();
                  toggle("discord");
                }}
              >
                <label className="contents">
                  <span className="w-12 text-base">
                    <Toggle
                      checked={showDiscord}
                      pending={isPending("discord")}
                      disabled={isPending("discord")}
                    />
                  </span>
                  Display on Profile
                </label>
                <span className="text-zinc-400">
                  {showDiscord ? "(Currently Visible)" : "(Currently Hidden)"}
                </span>
              </form>
              <IconInput
                icon={<PiDiscordLogoBold />}
                defaultValue={discordUsername}
                readOnly
                disabled
                type="text"
              />
              <div className="flex w-full max-w-sm justify-end">
                <ConfirmDestructiveAction
                  action={unlinkDiscordProfile}
                  title="Unlink Discord"
                  description="Unlinking your Discord account will remove you from the DevDogs server."
                  submitLabel="Unlink Discord"
                  userConfirmText="Unlink Discord"
                >
                  <FormButton
                    className="rounded-sm bg-rose-900 px-3 py-1 text-sm font-medium text-nowrap ring-rose-950 hover:not-disabled:bg-rose-200 hover:not-disabled:text-rose-950"
                    type="submit"
                  >
                    <PiLinkBreakBold />
                    Unlink Account
                  </FormButton>
                </ConfirmDestructiveAction>
              </div>
            </>
          ) : (
            <form className="contents" action={linkDiscordProfile}>
              <input
                type="hidden"
                name="callbackPath"
                value="/settings/profile"
              />
              <p className="text-sm text-zinc-400">Discord not linked.</p>
              <FormButton className="w-fit rounded-md bg-purple-900 px-5 py-1.5 text-sm font-medium ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950">
                <PiDiscordLogoBold />
                Sign in with Discord
              </FormButton>
            </form>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 border-t border-zinc-800 bg-black px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-prose text-sm text-zinc-400">
          Connect DevDogs to other accounts for access to everything you need to
          contribute.
        </p>
      </div>
    </section>
  );
}
