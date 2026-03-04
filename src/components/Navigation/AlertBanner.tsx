import * as Collapsible from "@radix-ui/react-collapsible";
import Link from "next/link";
import { PiArrowRightBold, PiXBold } from "react-icons/pi";
import isBetween from "~/lib/isBetween";
import linkGithubProfile from "~/server/actions/linkGithubProfile";
import Countdown from "../Countdown";
import { useMemo } from "react";

interface Props {
  linkedGithubProfile: boolean;
  streak: {
    length: number;
    renewalStart: Date;
    renewalCutoff: Date;
  } | null;
}

export default function AlertBanner({ linkedGithubProfile, streak }: Props) {
  const streakExpiresSoon = useMemo(
    () =>
      !!streak &&
      isBetween([streak.renewalStart, streak.renewalCutoff], new Date()),
    [streak],
  );

  return (
    <Collapsible.Root
      className="border-t-3 border-rose-700 bg-rose-700"
      defaultOpen={!linkedGithubProfile || streakExpiresSoon}
    >
      <Collapsible.Content
        className="data-[state=open]:animate-collapsible-open animate-collapsible-closed relative mx-auto w-full max-w-360 overflow-hidden pb-0.75 font-medium"
        suppressHydrationWarning
      >
        <div className="relative flex items-center justify-center gap-2 px-2 py-0.75 sm:px-14">
          <div className="flex w-full flex-row flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm transition-opacity has-[[data-countdown]:empty]:opacity-0 @md:pb-0">
            {!linkedGithubProfile && (
              <form className="contents" action={linkGithubProfile}>
                <p className="text-center text-balance">
                  Start Contributing by Linking your GitHub Account to DevDogs
                </p>
                <button
                  className="mb-0.5 flex items-center gap-1.5 rounded-sm border border-current bg-rose-800 px-3 py-0.75 text-xs/none font-semibold text-rose-100 shadow-[2px_2px_0px_black] transition-colors hover:bg-rose-900 hover:text-white"
                  type="submit"
                >
                  Sign In with GitHub
                  <PiArrowRightBold className="text-sm" />
                </button>
              </form>
            )}
            {streak && streakExpiresSoon && (
              <>
                <p className="mb-0.5 shrink text-center text-rose-100">
                  Your{" "}
                  <span className="font-extrabold tracking-wide text-amber-300 text-shadow-[2px_2px_0px_black]">
                    {streak.length} week streak
                  </span>{" "}
                  expires in{" "}
                  <span
                    className="inline-block font-extrabold tracking-wide text-white text-shadow-[2px_2px_0px_black]"
                    data-countdown
                  >
                    <Countdown until={streak.renewalCutoff} />
                  </span>
                </p>
                <Link
                  className="mb-0.5 flex items-center gap-1.5 rounded-sm border border-current bg-rose-800 px-3 py-0.75 text-xs/none font-semibold whitespace-nowrap text-rose-100 shadow-[2px_2px_0px_black] transition-colors hover:bg-rose-900 hover:text-white"
                  href="https://github"
                  target="_blank"
                >
                  Complete an Issue
                  <PiArrowRightBold className="text-sm" />
                </Link>
              </>
            )}
          </div>
          <Collapsible.Trigger
            className="justify-self-end rounded-full p-1 transition-colors hover:bg-rose-900 sm:absolute sm:right-4"
            suppressHydrationWarning
          >
            <PiXBold />
          </Collapsible.Trigger>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
