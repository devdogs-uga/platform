import Image from "next/image";
import Link from "next/link";
import { PiArrowRightBold, PiDotsNineBold, PiLink } from "react-icons/pi";
import devdog from "~/assets/devdog.png";
import signIn from "~/server/actions/signIn";
import { getSession } from "~/server/auth";
import Avatar from "./Avatar";
import NavContainer from "./NavContainer";

export default async function Navigation() {
  const session = await getSession({
    user: {
      with: { github: true },
    },
  });

  return (
    <NavContainer>
      <div className="mx-auto flex h-19 max-w-360 grid-cols-[1fr_max-content_1fr] items-center justify-between px-4 py-3 md:grid md:px-6 md:py-4.5 lg:py-4">
        <Link href="/">
          <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl lg:gap-2.5 lg:text-3xl">
            <figure className="size-[1.5em]">
              <Image alt="Home" src={devdog} />
            </figure>
            DevDogs
          </h1>
        </Link>

        <ul className="hidden items-center md:flex lg:gap-4 lg:text-lg">
          <li className="contents">
            <Link
              href="/community"
              className="rounded-sm px-5 py-0.75 transition-[box-shadow,color] hover:bg-rose-950 hover:shadow-xs"
            >
              Community
            </Link>
          </li>
          <li className="contents">
            <Link
              href="/projects"
              className="rounded-sm px-5 py-0.75 transition-[box-shadow,color] hover:bg-rose-950 hover:shadow-xs"
            >
              Projects
            </Link>
          </li>
          <li className="contents">
            <Link
              href="/events"
              className="rounded-sm px-5 py-0.75 transition-[box-shadow,color] hover:bg-rose-950 hover:shadow-xs"
            >
              Events
            </Link>
          </li>
          <li className="contents">
            <Link
              href="/partners"
              className="rounded-sm px-5 py-0.75 transition-[box-shadow,color] hover:bg-rose-950 hover:shadow-xs"
            >
              Partners
            </Link>
          </li>
        </ul>

        <div className="flex justify-end gap-3">
          <button className="rounded-sm px-1.5 text-3xl text-zinc-200 transition-colors hover:bg-rose-950 hover:text-white md:hidden md:text-3xl">
            <PiDotsNineBold />
          </button>

          {session ? (
            <>
              {!(session.user.github) && (
                <form className="hidden md:contents" action={signIn}>
                  <input
                    className="hidden"
                    type="hidden"
                    name="realm"
                    value="github"
                  />
                  <button
                    className="flex items-center gap-2 rounded-sm border border-rose-800 bg-rose-950/50 px-2 py-0.5 text-sm transition-colors hover:bg-rose-950"
                    type="submit"
                  >
                    <PiLink />
                    Link GitHub
                  </button>
                </form>
              )}

              <p className="relative flex items-center gap-3 self-end rounded-full border-rose-950 bg-rose-950/50 text-4xl/0 md:border">
                {session.user.github && (
                  <Link
                    className="ml-4.5 hidden items-center gap-3 text-[0.9rem]/none font-bold md:flex"
                    href="/community#leaderboard"
                  >
                    {session.user.github && (
                      <span className="text-rose-400">
                        #{session.user.github.ranking}
                      </span>
                    )}
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[0.9rem]/none">
                        {session.user.github.points} Points
                      </span>
                      {session.user.github.currentStreak > 0 && (
                        <span className="text-[0.6rem]/none font-semibold text-amber-400 uppercase">
                          {session.user?.github.currentStreak} Week Streak
                        </span>
                      )}
                    </span>
                  </Link>
                )}
                <Link className="" href="/settings/profile">
                  <Avatar {...session.user} />
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
        </div>
      </div>
    </NavContainer>
  );
}
