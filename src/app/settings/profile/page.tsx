import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";
import {
  PiEnvelopeSimpleBold,
  PiGithubLogoBold,
  PiGlobeBold,
  PiInstagramLogoBold,
  PiLinkedinLogoBold,
  PiUserBold,
} from "react-icons/pi";
import * as z from "zod";
import * as zfd from "zod-form-data";
import FormButton from "~/components/FormButton";
import IconInput from "~/components/IconInput";
import SettingsNavigation from "~/components/SettingsNavigation";
import { expectSession, getSession } from "~/server/auth";
import { db } from "~/server/db";
import { publicProfiles, users } from "~/server/db/schema/tables";

async function updatePreferredName(formData: FormData) {
  "use server";

  const session = await getSession({});

  if (!session) {
    unauthorized();
  }

  const { name } = await zfd
    .formData({ name: zfd.text(z.string().max(32)) })
    .parseAsync(formData);

  await db
    .update(publicProfiles)
    .set({ name })
    .where(eq(publicProfiles.userId, session.userId));

  revalidatePath("/settings/profile");
}

async function updateEmail(formData: FormData) {
  "use server";

  const session = await getSession({});

  if (!session) {
    unauthorized();
  }

  await db
    .update(publicProfiles)
    .set(
      await zfd
        .formData({ email: zfd.text(z.email()).nullish().default(null) })
        .parseAsync(formData),
    )
    .where(eq(publicProfiles.userId, session.userId));

  revalidatePath("/settings/profile");
}

async function updateProfileUrl(formData: FormData) {
  "use server";

  const session = await getSession({});

  if (!session) {
    unauthorized();
  }

  await db
    .update(publicProfiles)
    .set(
      await zfd
        .formData({ portfolioUrl: zfd.text(z.url()).nullish().default(null) })
        .parseAsync(formData),
    )
    .where(eq(publicProfiles.userId, session.userId));

  revalidatePath("/settings/profile");
}

async function updateSocialMedia(formData: FormData) {
  "use server";

  const session = await getSession({});

  if (!session) {
    unauthorized();
  }

  await db
    .update(publicProfiles)
    .set(
      await zfd
        .formData({
          linkedinUsername: zfd.text(z.string().regex(/[\w\.]{2,}/)).nullish(),
          githubUsername: zfd.text(z.string().regex(/[\w\.]{2,}/)).nullish(),
          instagramUsername: zfd.text(z.string().regex(/[\w\.]{2,}/)).nullish(),
        })
        .parseAsync(formData),
    )
    .where(eq(publicProfiles.userId, session.userId));

  revalidatePath("/settings/profile");
}

export default async function Settings() {
  const session = await expectSession("/settings/profile", {
    user: {
      with: {
        publicProfile: true,
        github: { columns: { login: true } },
        discord: { columns: { username: true } },
      },
    },
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
        <form className="contents" action={updatePreferredName}>
          <div className="flex flex-col gap-3 bg-zinc-900 px-4 py-5 inset-shadow-sm">
            <h3 className="text-xl font-bold">Preferred Name</h3>

            <p className="max-w-prose text-zinc-300">
              <span className="inline-block">
                This will be displayed publicly.
              </span>{" "}
              <span className="inline-block">
                We recommend using your full name.
              </span>
            </p>

            <IconInput
              icon={<PiUserBold />}
              placeholder={session.user.legalName.split(" ")[0]}
              defaultValue={session.user.publicProfile.name}
              minLength={1}
              maxLength={32}
              name="name"
              type="text"
              required
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-zinc-800 bg-black p-4 font-medium">
            <p className="max-w-prose text-sm text-zinc-400">
              Please use 32 characters at maximum.
            </p>

            <FormButton className="rounded-sm bg-purple-900 px-4 py-1 ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950">
              Save
            </FormButton>
          </div>
        </form>
      </section>

      <section className="w-full overflow-hidden rounded-md border border-zinc-800">
        <form className="contents" action={updateEmail}>
          <div className="flex flex-col gap-3 bg-zinc-900 px-4 py-5 inset-shadow-sm">
            <h3 className="pb-2 text-xl font-bold">Email</h3>

            <IconInput
              icon={<PiEnvelopeSimpleBold />}
              placeholder={session.user.ugaMyId + "@uga.edu"}
              defaultValue={session.user.publicProfile.email ?? ""}
              maxLength={254}
              pattern="^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+\-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$"
              name="email"
              type="email"
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-zinc-800 bg-black p-4 font-medium">
            <p className="max-w-prose text-sm text-zinc-400">
              Please use an email you check regularly.
            </p>

            <FormButton className="rounded-sm bg-purple-900 px-4 py-1 ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950">
              Save
            </FormButton>
          </div>
        </form>
      </section>

      <section className="w-full overflow-hidden rounded-md border border-zinc-800">
        <form className="contents" action={updateProfileUrl}>
          <div className="flex flex-col gap-3 bg-zinc-900 px-4 py-5 inset-shadow-sm">
            <h3 className="pb-2 text-xl font-bold">Portfolio Website</h3>

            <IconInput
              icon={<PiGlobeBold />}
              placeholder="https://devdogsuga.com"
              defaultValue={session.user.publicProfile.portfolioUrl ?? ""}
              maxLength={254}
              name="portfolioUrl"
              type="url"
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-zinc-800 bg-black p-4 font-medium">
            <p className="max-w-prose text-sm text-zinc-400">
              Alternatively, use a download link for your resume.
            </p>

            <FormButton className="rounded-sm bg-purple-900 px-4 py-1 ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950">
              Save
            </FormButton>
          </div>
        </form>
      </section>

      <section className="w-full overflow-hidden rounded-md border border-zinc-800">
        <form className="contents" action={updateSocialMedia}>
          <div className="flex flex-col gap-3 bg-zinc-900 px-4 py-5 inset-shadow-sm">
            <h3 className="pb-3 text-xl font-bold">Social Medias</h3>

            <IconInput
              icon={<PiLinkedinLogoBold />}
              prefix="linkedin.com/in/"
              placeholder={session.user.legalName
                .replaceAll(/\W/g, "")
                .toLocaleLowerCase()}
              defaultValue={session.user.publicProfile.linkedinUsername ?? ""}
              maxLength={32}
              minLength={2}
              pattern="[\w\.]{2,}"
              name="linkedinUsername"
              type="text"
            />

            <IconInput
              icon={<PiInstagramLogoBold />}
              prefix="instagram.com/"
              placeholder={session.user.legalName
                .replaceAll(/\W/g, "")
                .toLocaleLowerCase()}
              defaultValue={session.user.publicProfile.instagramUsername ?? ""}
              maxLength={32}
              minLength={2}
              pattern="[\w\.]{2,}"
              name="instagramUsername"
              type="text"
            />

            <IconInput
              icon={<PiGithubLogoBold />}
              prefix="github.com/"
              placeholder={
                session.user.github?.login ??
                session.user.legalName.replaceAll(/\W/g, "").toLocaleLowerCase()
              }
              defaultValue={session.user.publicProfile.githubUsername ?? ""}
              maxLength={32}
              minLength={2}
              pattern="[\w\.]{2,}"
              name="githubUsername"
              type="text"
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-zinc-800 bg-black p-4 font-medium">
            <p className="max-w-prose text-sm text-zinc-400">
              Remember, these will be shared publicly.
            </p>

            <FormButton className="rounded-sm bg-purple-900 px-4 py-1 ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950">
              Save
            </FormButton>
          </div>
        </form>
      </section>
    </SettingsNavigation>
  );
}
