import * as Menu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { PiConfettiBold, PiGearBold, PiSignOutBold } from "react-icons/pi";
import Avatar from "~/components/Avatar";
import signOut from "~/server/actions/signOut";
import {
  type githubProfiles,
  type publicProfiles,
} from "~/server/db/schema/tables";

interface Props {
  publicProfile: typeof publicProfiles.$inferSelect;
  githubProfile: typeof githubProfiles.$inferSelect | null | undefined;
  streak:
    | {
        length: number;
        renewalStart: Date;
        renewalCutoff: Date;
      }
    | null
    | undefined;
}

export default function ProfileMenu({
  publicProfile,
  githubProfile,
  streak,
}: Props) {
  const preventDefault = (e: Event) => e.preventDefault();

  return (
    <Menu.Root>
      <Menu.Trigger
        className="text-[2rem]/0 md:text-4xl/0"
        suppressHydrationWarning
      >
        <Avatar {...publicProfile} />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Content
          className="z-100 min-w-48 rounded-lg border border-zinc-700 bg-zinc-950/80 py-1.5 text-sm font-medium shadow-2xl backdrop-blur-xs"
          sideOffset={6}
          align="end"
        >
          <Link
            className="flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-zinc-800"
            href={`/community/${publicProfile.userId}`}
          >
            <span className="text-3xl/0">
              <Avatar {...publicProfile} />
            </span>
            <span className="flex flex-col gap-0.75">
              <span className="text-sm/none">{publicProfile.name}</span>
              <span className="text-xs/none text-zinc-400">Contributor</span>
            </span>
          </Link>
          <Menu.Separator className="mx-1.5 my-1.5 h-px w-[calc(100%-var(--spacing)*3)] bg-zinc-700" />

          {githubProfile && (
            <>
              <Menu.Item className="flex flex-col px-3 py-1.5 text-amber-400">
                <span className="text-[0.66rem]/none font-extrabold uppercase opacity-55">
                  This Year
                </span>
                <span className="font-bold">
                  {githubProfile.currentYearPoints} points{" "}
                  <span className="opacity-70">
                    (#{githubProfile.currentYearRanking})
                  </span>
                </span>
              </Menu.Item>

              {streak && (
                <div className="relative my-1.5 h-4.5 overflow-hidden border-t border-rose-700 bg-rose-700 py-px text-center text-xs font-extrabold tracking-wide text-rose-100 uppercase italic">
                  <div className="absolute inset-0 size-full drop-shadow-[1px_1px_0px_black]">
                    <Marquee autoFill>
                      <p className="flex items-center gap-3 pr-3">
                        {streak.length} Week Streak
                        <PiConfettiBold className="text-amber-300" />
                      </p>
                    </Marquee>
                  </div>
                </div>
              )}

              <Menu.Item className="flex flex-col px-3 py-1.5">
                <span className="text-[0.66rem]/none font-extrabold text-zinc-500 uppercase">
                  All Time
                </span>
                <span className="font-bold">
                  {githubProfile.allTimePoints} points{" "}
                  <span className="text-zinc-400">
                    (#{githubProfile.allTimeRanking})
                  </span>
                </span>
              </Menu.Item>
              <Menu.Separator className="mx-1.5 my-1.5 h-px w-[calc(100%-var(--spacing)*3)] bg-zinc-700" />
            </>
          )}

          <Menu.Item asChild>
            <Link
              href="/settings/profile"
              className="flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-zinc-800"
            >
              <PiGearBold /> Settings
            </Link>
          </Menu.Item>

          <form action={signOut}>
            <input name="callbackPath" value="/" type="hidden" />
            <Menu.Item onSelect={preventDefault} asChild>
              <button
                className="flex w-full items-center gap-2 px-3 py-1.5 text-rose-300 transition-colors hover:bg-rose-950 hover:text-rose-50"
                type="submit"
              >
                <PiSignOutBold /> Sign Out
              </button>
            </Menu.Item>
          </form>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
