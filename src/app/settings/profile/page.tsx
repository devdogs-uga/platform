import { eq } from "drizzle-orm";
import type { PropsWithChildren, ReactNode } from "react";
import { PiLinkBreakBold } from "react-icons/pi";
import FormButton from "~/components/FormButton";
import SettingsNavigation from "~/components/SettingsNavigation";
import signIn from "~/server/actions/signIn";
import { expectSession } from "~/server/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema/tables";

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
      <div className="flex items-center justify-between border-t border-zinc-800 bg-black p-4 font-medium">
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
  const session = await expectSession("/settings/profile", {
    user: { with: { publicProfile: true } },
  });

  if (!session.user.viewedSettings) {
    await db
      .update(users)
      .set({ viewedSettings: true })
      .where(eq(users.id, session.userId));
  }

  return (
    <SettingsNavigation title="Public Profile" pathname="/settings/profile">
      <section className="w-full overflow-hidden rounded-md border border-zinc-800">
        <form className="contents">
          <div className="flex flex-col gap-3 bg-zinc-900 px-4 py-5 inset-shadow-sm">
            <h3 className="text-xl font-bold">Preferred Name</h3>

            <p className="max-w-prose text-zinc-300">
              <span className="inline-block">This name will be displayed publicly.</span>{" "}
              <span className="inline-block">We recommend using your full name.</span>
            </p>

            <input className="form-input max-w-3xs w-full rounded-sm bg-zinc-800 border border-zinc-700 inset-shadow-sm" type="text" defaultValue={session.user.publicProfile.name} />
          </div>
          <div className="flex items-center justify-between border-t border-zinc-800 bg-black p-4 font-medium">
            <p className="max-w-prose text-sm text-zinc-400">
              Please use 32 characters at maximum.
            </p>

            <FormButton className="bg-purple-900 ring-purple-950 px-4 py-1 rounded-sm hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950">
              Save
            </FormButton>
          </div>
        </form>
      </section>
    </SettingsNavigation>
  );
}
