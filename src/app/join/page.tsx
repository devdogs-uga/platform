import type { PropsWithChildren, ReactNode } from "react";
import {
  PiArrowRightBold,
  PiCheckCircleDuotone,
  PiDiscordLogoBold,
  PiGithubLogoBold,
  PiHeartFill,
} from "react-icons/pi";
import FormButton from "~/components/FormButton";
import LinkButton from "~/components/LinkButton";
import linkDiscordProfile from "~/server/actions/linkDiscordProfile";
import linkGithubProfile from "~/server/actions/linkGithubProfile";
import { expectSession } from "~/server/auth";

interface Props extends PropsWithChildren {
  heading: ReactNode;
  complete: boolean;
}

function OnboardingStep({ complete, children, heading }: Props) {
  return (
    <section
      className="pointer-events-none flex w-full scale-95 flex-col gap-4 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-4 opacity-75 inset-shadow-sm first-of-type:not-data-complete:pointer-events-auto first-of-type:not-data-complete:scale-100 first-of-type:not-data-complete:opacity-100 sm:gap-6 sm:px-4 [[data-complete]_+:not([data-complete])]:pointer-events-auto [[data-complete]_+:not([data-complete])]:scale-100 [[data-complete]_+:not([data-complete])]:opacity-100"
      data-complete={complete || undefined}
    >
      <h3 className="relative flex flex-col gap-1.5">
        <span className="w-max rounded-sm bg-rose-400 px-1.5 text-xs font-extrabold text-rose-950 uppercase after:content-[counter(step)] after:[counter-increment:step] sm:text-sm">
          Step&nbsp;
        </span>
        <span className="text-xl font-bold sm:text-2xl">{heading}</span>

        {complete && (
          <span className="absolute top-1/2 right-0 -translate-y-1/2 text-5xl text-emerald-500">
            <PiCheckCircleDuotone />
          </span>
        )}
      </h3>

      {!complete && children}
    </section>
  );
}

export default async function Join() {
  const session = await expectSession("/join", {
    user: { with: { publicProfile: true } },
  });

  const githubStepComplete = session.user.githubId !== null;
  const discordStepComplete = session.user.discordId !== null;
  const profileStepComplete = session.user.viewedSettings;

  // if (githubStepComplete && discordStepComplete && profileStepComplete) {
  //   redirect("/");
  // }

  return (
    <main className="mx-auto mt-18.75 flex w-full max-w-2xl flex-col gap-4 px-3 py-8 [counter-reset:step_0] sm:gap-6 sm:py-12">
      <header className="pb-10 text-center">
        <h2 className="pb-4 text-3xl font-bold sm:text-4xl">
          Hi there,{" "}
          <span className="text-rose-400">
            {session.user.publicProfile.name}
          </span>
        </h2>
        <p className="mx-auto max-w-sm text-lg font-medium text-zinc-400 sm:max-w-prose sm:text-xl">
          {githubStepComplete && discordStepComplete && profileStepComplete ? (
            <>
              <span className="inline-block">
                You&rsquo;re all done for now!
              </span>{" "}
              <span className="inline-block">
                We&rsquo;ll have more for you soon{" "}
                <PiHeartFill className="-mt-1 ml-0.5 inline text-rose-400" />
              </span>
            </>
          ) : (
            <>
              <span className="inline-block">Thanks for joining DevDogs!</span>{" "}
              <span className="inline-block">
                Let&rsquo;s get you set up...
              </span>
            </>
          )}
        </p>
      </header>

      <OnboardingStep
        heading={
          <>
            Get Access to <span className="text-rose-400">GitHub</span>
          </>
        }
        complete={githubStepComplete}
      >
        <p className="flex max-w-prose flex-col gap-2 text-sm text-zinc-300 sm:block sm:text-base">
          <span className="inline-block">
            DevDogs uses GitHub to manage source code and organize
            contributions.
          </span>
          <span className="inline-block">
            Get access to this year&rsquo;s project by linking your GitHub
            account.
          </span>
          <span className="inline-block">
            Don&rsquo;t have a GitHub account? Don&rsquo;t worry, it&rsquo;s
            free!
          </span>
        </p>

        <form action={linkGithubProfile} className="contents">
          <input
            className="hidden"
            type="hidden"
            name="callbackPath"
            value="/join"
          />
          <FormButton
            className="self-start rounded-md bg-purple-900 px-6 py-2 font-medium ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950 lg:px-7 lg:text-lg"
            type="submit"
          >
            <PiGithubLogoBold />
            Sign In with GitHub
          </FormButton>
        </form>
      </OnboardingStep>

      <OnboardingStep
        heading={
          <>
            Join the <span className="text-rose-400">Discord</span>
          </>
        }
        complete={discordStepComplete}
      >
        <p className="flex max-w-prose flex-col gap-2 text-sm text-zinc-300 sm:block sm:text-base">
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
        </p>

        <form action={linkDiscordProfile} className="contents">
          <input
            className="hidden"
            type="hidden"
            name="callbackPath"
            value="/join"
          />
          <FormButton
            className="self-start rounded-md bg-purple-900 px-6 py-2 font-medium ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950 lg:px-7 lg:text-lg"
            type="submit"
          >
            <PiDiscordLogoBold />
            Sign In with Discord
          </FormButton>
        </form>
      </OnboardingStep>

      <OnboardingStep
        heading={
          <>
            Complete Your <span className="text-rose-400">Public Profile</span>
          </>
        }
        complete={profileStepComplete}
      >
        <p className="flex max-w-prose flex-col gap-2 text-sm text-zinc-300 sm:block sm:text-base">
          <span className="inline-block">
            DevDogs projects are resume- and portfolio-builders.
          </span>
          <span className="inline-block">
            Make sure the information about you which is accessible to
            recruiters and other students is up-to-date!
          </span>
        </p>

        <LinkButton
          className="self-start rounded-md bg-purple-900 px-6 py-2 font-medium ring-purple-950 hover:not-disabled:bg-purple-200 hover:not-disabled:text-purple-950 lg:px-7 lg:text-lg"
          href="/settings/profile"
        >
          Go to Settings
          <PiArrowRightBold />
        </LinkButton>
      </OnboardingStep>
    </main>
  );
}
