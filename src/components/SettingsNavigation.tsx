"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import {
  PiChatCircleDotsBold,
  PiLineVerticalBold,
  PiLinkBold,
  PiSignOutBold,
  PiUserBold,
} from "react-icons/pi";
import signOut from "~/server/actions/signOut";

interface NavLinkProps extends PropsWithChildren {
  href: string;
  active: boolean;
}

function NavLink({ active, href, children }: NavLinkProps) {
  return (
    <li className="contents">
      <Link
        className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-zinc-900 hover:text-white data-active:bg-zinc-800 data-active:text-white"
        data-active={active || undefined}
        href={href}
      >
        {children}
      </Link>
    </li>
  );
}

interface Props extends PropsWithChildren {
  title: string;
  pathname: string;
}

export default function SettingsNavigation({ title, pathname, children }: Props) {
  return (
    <>
      <header className="mt-18.5 border-y border-zinc-800 bg-black px-6 py-10">
        <h2 className="flex items-center gap-1.5 text-3xl/none font-semibold text-zinc-500">
          Settings <PiLineVerticalBold className="rotate-24" />{" "}
          <span className="text-white">{title}</span>
        </h2>
      </header>
      <main className="grid flex-1 grid-cols-[1fr_3fr] gap-x-6 px-6 py-8">
        <nav className="flex flex-col gap-0.5 text-zinc-400">
          <ul className="contents">
            <NavLink
              href="/settings/profile"
              active={pathname.startsWith("/settings/profile")}
            >
              <PiUserBold />
              Public Profile
            </NavLink>
            <NavLink
              href="/settings/accounts"
              active={pathname.startsWith("/settings/accounts")}
            >
              <PiLinkBold />
              Linked Accounts
            </NavLink>
            <NavLink
              href="/settings/feedback"
              active={pathname.startsWith("/settings/feedback")}
            >
              <PiChatCircleDotsBold />
              Feedback
            </NavLink>
          </ul>

          <hr className="m-2 h-px border-none bg-zinc-800" />

          <form className="contents" action={signOut}>
            <input
              className="hidden"
              type="hidden"
              name="callbackPath"
              value="/"
            />
            <button
              className="flex items-center gap-2 rounded-md px-3 py-2 text-rose-300 transition-colors hover:bg-rose-950/50 hover:text-rose-200"
              type="submit"
            >
              <PiSignOutBold />
              Sign Out
            </button>
          </form>
        </nav>
        <div className="flex-1 flex flex-col gap-8">{children}</div>
      </main>
    </>
  );
}
