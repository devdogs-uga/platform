import * as Collapsible from "@radix-ui/react-collapsible";
import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, PropsWithChildren, ReactNode } from "react";
import {
  PiArrowRightBold,
  PiCalendarStarDuotone,
  PiCodeDuotone,
  PiDotsNineBold,
  PiDotsThreeVertical,
  PiEnvelopeSimpleFill,
  PiGithubLogoFill,
  PiHandshakeDuotone,
  PiInstagramLogoFill,
  PiLink,
  PiLinkedinLogoFill,
  PiUsersThreeDuotone,
  PiXBold,
} from "react-icons/pi";
import devdog from "~/assets/devdog.png";
import linkGithubProfile from "~/server/actions/linkGithubProfile";
import { getSession } from "~/server/auth";
import Avatar from "./Avatar";
import LinkButton from "./LinkButton";
import NavContainer from "./NavContainer";
import Share from "./Share";
import { env } from "~/env";

interface NavItemProps extends PropsWithChildren {
  href: ComponentProps<typeof Link>["href"];
  icon: ReactNode;
}

function NavItem({ href, children, icon }: NavItemProps) {
  return (
    <li className="contents">
      <Link
        href={href}
        className="flex items-center gap-3 rounded-sm px-3 py-0.75 transition-[box-shadow,color] hover:bg-rose-950 hover:shadow-xs md:px-5"
      >
        <span className="text-rose-300 md:hidden">{icon}</span>
        {children}
      </Link>
    </li>
  );
}

function NavigationItems() {
  return (
    <ul className="contents">
      <NavItem icon={<PiUsersThreeDuotone />} href="/community">
        Community
      </NavItem>
      <NavItem icon={<PiCodeDuotone />} href="/projects">
        Projects
      </NavItem>
      <NavItem icon={<PiCalendarStarDuotone />} href="/events">
        Events
      </NavItem>
      <NavItem icon={<PiHandshakeDuotone />} href="/partners">
        Partners
      </NavItem>
    </ul>
  );
}

interface MobileNavigationProps {
  isSignedIn: boolean;
}

function MobileNavigation({ isSignedIn }: MobileNavigationProps) {
  return (
    <div className="flex w-full flex-col items-start gap-1.5 self-start text-lg">
      <NavigationItems />
      {!isSignedIn && (
        <LinkButton
          href="/join"
          className="mt-4.5 flex w-full items-center justify-center gap-5 rounded-sm bg-rose-900 py-1.5 font-extrabold tracking-wide text-white ring-rose-900 hover:bg-rose-200 hover:text-rose-900"
        >
          Join DevDogs!
        </LinkButton>
      )}
    </div>
  );
}

function LinkInBio() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-12 py-4">
      <div className="flex w-full flex-col items-center gap-6">
        <p className="animate-wave cursor-default text-5xl">👋</p>
        <p className="text-center">
          <span className="inline-block">
            Hey, we&rsquo;re DevDogs, a club at UGA building
          </span>
          <span className="inline-block">
            software with an impact. Join us below!
          </span>
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <LinkButton
          href="/join"
          className="flex items-center justify-center gap-5 rounded-sm bg-rose-900 px-12 py-3 text-xl font-extrabold tracking-wide text-white ring-rose-900 hover:bg-rose-200 hover:text-rose-900"
        >
          Join DevDogs!
        </LinkButton>
        <Link
          href="?"
          className="flex items-center justify-center gap-2 rounded-sm bg-rose-300 px-4 py-2 font-medium text-black hover:underline"
        >
          Continue to Website
          <PiArrowRightBold />
        </Link>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Link
          href="https://uga.campuslabs.com/engage/organization/devdogs"
          target="_blank"
          className="flex items-center justify-between gap-2 rounded-sm bg-rose-200 px-4 py-2 text-black hover:underline"
        >
          <PiLink />
          <span className="w-full text-center">
            UGA Involvement Network Listing
          </span>
          <Share>
            <button className="-m-1 rounded-full p-1 transition-colors hover:bg-rose-300">
              <PiDotsThreeVertical />
            </button>
          </Share>
        </Link>
        <Link
          href="https://gdg.community.dev/gdg-on-campus-university-of-georgia-athens-united-states/"
          target="_blank"
          className="flex items-center justify-between gap-2 rounded-sm bg-rose-200 px-4 py-2 text-black hover:underline"
        >
          <PiLink />
          <span className="w-full text-center">Google DGC: UGA Listing</span>
          <Share>
            <button className="-m-1 rounded-full p-1 transition-colors hover:bg-rose-300">
              <PiDotsThreeVertical />
            </button>
          </Share>
        </Link>
        <Link
          href="https://docs.google.com/forms/d/e/1FAIpQLSfH6BQCUm96Q9rUu-WKVeG6qzM4tRrXzfwxj_Np8XJoZtlZJQ/viewform"
          target="_blank"
          className="flex items-center justify-between gap-2 rounded-sm bg-rose-200 px-4 py-2 text-black hover:underline"
        >
          <PiLink />
          <span className="w-full text-center">Focus Lead Interest Form</span>
          <Share>
            <button className="-m-1 rounded-full p-1 transition-colors hover:bg-rose-300">
              <PiDotsThreeVertical />
            </button>
          </Share>
        </Link>
        <Link
          href="https://forms.gle/7DFteDC9iGu5rVCL7"
          target="_blank"
          className="flex items-center justify-between gap-2 rounded-sm bg-rose-200 px-4 py-2 text-black hover:underline"
        >
          <PiLink />
          <span className="w-full text-center">A-Team Interest Form</span>
          <Share>
            <button className="-m-1 rounded-full p-1 transition-colors hover:bg-rose-300">
              <PiDotsThreeVertical />
            </button>
          </Share>
        </Link>
      </div>

      <div className="flex gap-8 text-2xl text-rose-100">
        <Link
          className="transition-[scale,color] hover:scale-120 hover:text-rose-200"
          href="#"
          target="_blank"
        >
          <PiInstagramLogoFill />
        </Link>
        <Link
          className="transition-[scale,color] hover:scale-120 hover:text-rose-200"
          href="#"
          target="_blank"
        >
          <PiGithubLogoFill />
        </Link>
        <Link
          className="transition-[scale,color] hover:scale-120 hover:text-rose-200"
          href="#"
          target="_blank"
        >
          <PiLinkedinLogoFill />
        </Link>
        <Link
          className="transition-[scale,color] hover:scale-120 hover:text-rose-200"
          href="#"
          target="_blank"
        >
          <PiEnvelopeSimpleFill />
        </Link>
      </div>
    </div>
  );
}

export default async function Navigation() {
  const session = await getSession({
    user: {
      with: { github: { with: { points: true } }, publicProfile: true },
    },
  });

  const streakLength =
    session?.user.github?.points[env.DEVDOGS_EPOCH.getUTCFullYear()]
      ?.streakLength;

  return (
    <NavContainer>
      <nav className="fixed top-0 left-0 z-60 flex w-full flex-col from-rose-950/20 to-black/30 py-0.75 transition-[background-color,box-shadow,backdrop-filter] group-data-from-link-in-bio:h-dvh group-data-scrolled:bg-black/30 group-data-scrolled:shadow-xl group-data-scrolled:backdrop-blur-sm group-data-[state=open]:border-rose-600 group-data-[state=open]:bg-radial group-data-[state=open]:backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-360 grid-cols-[1fr_max-content_1fr] items-center justify-between px-4 py-4.25 md:px-6 md:py-4.5 lg:grid">
          <Link href="/">
            <h1 className="flex items-center gap-2 text-xl font-bold md:text-2xl lg:gap-2.5">
              <figure className="size-[1.5em]">
                <Image alt="Home" src={devdog} />
              </figure>
              DevDogs
            </h1>
          </Link>

          <div className="hidden items-center md:flex lg:gap-4 lg:px-4 lg:text-lg">
            <NavigationItems />
          </div>

          <div className="flex items-center justify-end gap-3">
            {session ? (
              <>
                {!session.user.github && (
                  <form className="contents" action={linkGithubProfile}>
                    <button
                      className="flex items-center gap-2 rounded-md border border-rose-800 bg-rose-950/50 px-2 py-1 text-xs transition-colors hover:bg-rose-950 lg:text-sm"
                      type="submit"
                    >
                      <PiLink />
                      Link GitHub
                    </button>
                  </form>
                )}

                <p className="relative flex items-center gap-3 rounded-full border border-rose-950 bg-rose-950/50">
                  {session.user.github && (
                    <Link
                      className="ml-4.5 flex items-center gap-3 text-[0.9rem]/none font-bold"
                      href="/community#leaderboard"
                    >
                      {session.user.github.allTimeRanking && (
                        <span className="text-rose-400">
                          #{session.user.github.allTimeRanking}
                        </span>
                      )}
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[0.9rem]/none">
                          {session.user.github.allTimePoints} Points
                        </span>
                        {streakLength && streakLength > 0 && (
                          <span className="text-[0.6rem]/none font-semibold text-amber-400 uppercase">
                            {streakLength} Week Streak
                          </span>
                        )}
                      </span>
                    </Link>
                  )}
                  <Link
                    className="text-3xl/0 md:text-4xl/0"
                    href="/settings/profile"
                  >
                    <Avatar {...session.user.publicProfile} />
                  </Link>
                </p>
              </>
            ) : (
              <Link
                className="group hidden items-center gap-2 place-self-end rounded-md border border-rose-950 bg-rose-900 px-5 py-1.5 font-semibold shadow-sm inset-ring-0 inset-ring-rose-900 transition-[color,box-shadow,background-color] hover:bg-rose-100 hover:text-rose-900 hover:shadow-md hover:inset-ring-3 md:flex lg:px-7 lg:text-lg"
                href="/join"
              >
                Join Us
                <PiArrowRightBold />
              </Link>
            )}

            <Collapsible.Trigger className="group -mx-1.5 grid grid-cols-1 grid-rows-1 items-center rounded-sm px-1.5 py-1 text-2xl text-zinc-200 transition-colors group-data-from-link-in-bio:hidden hover:bg-rose-950 hover:text-white md:hidden md:text-3xl">
              <PiDotsNineBold className="col-start-1 row-start-1 transition-opacity group-data-[state=open]:opacity-0" />
              <PiXBold className="col-start-1 row-start-1 opacity-0 transition-opacity group-data-[state=open]:opacity-100" />
            </Collapsible.Trigger>
          </div>
        </div>

        <Collapsible.Content className="group-data-[state=open]:animate-collapsible-open group-data-[state=closed]:animate-collapsible-closed flex items-center overflow-hidden border-b border-rose-700 group-data-from-link-in-bio:flex-1 group-data-from-link-in-bio:border-none">
          <div className="flex w-full items-center px-4 pb-5 group-data-from-link-in-bio:pb-0">
            <div className="hidden group-data-from-link-in-bio:contents">
              <LinkInBio />
            </div>
            <div className="contents group-data-from-link-in-bio:hidden">
              <MobileNavigation isSignedIn={session !== null} />
            </div>
          </div>
        </Collapsible.Content>
      </nav>
    </NavContainer>
  );
}
