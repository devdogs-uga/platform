"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import {
  PiChatCircleDotsBold,
  PiKeyBold,
  PiLineVerticalBold,
  PiLinkBold,
  PiListBold,
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
        className="flex items-center gap-2 rounded-md px-3 py-2 text-nowrap transition-colors hover:bg-zinc-900 hover:text-white data-active:bg-zinc-800 data-active:text-white"
        data-active={active || undefined}
        href={href}
      >
        {children}
      </Link>
    </li>
  );
}

interface NavContentProps {
  pathname: string;
}

function NavContent({ pathname }: NavContentProps) {
  return (
    <nav className="contents">
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
          href="/settings/keys"
          active={pathname.startsWith("/settings/keys")}
        >
          <PiKeyBold />
          API Keys
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
        <input className="hidden" type="hidden" name="callbackPath" value="/" />
        <button
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-rose-300 transition-colors hover:bg-rose-950/50 hover:text-rose-200"
          type="submit"
        >
          <PiSignOutBold />
          Sign Out
        </button>
      </form>
    </nav>
  );
}

interface Props extends PropsWithChildren {
  title: string;
  pathname: string;
}

export default function SettingsNavigation({
  title,
  pathname,
  children,
}: Props) {
  return (
    <Dialog.Root>
      <header className="top:mt-19.25 sticky top-18 z-50 mt-17.25 border-y border-zinc-800 bg-black/30 shadow-xl backdrop-blur-sm md:top-20 md:shadow-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-xl/none sm:py-6 md:px-6 md:py-8">
          <h2 className="flex cursor-default items-center gap-1.5 font-semibold text-zinc-500 sm:text-2xl/none md:text-3xl">
            Settings <PiLineVerticalBold className="rotate-24" />{" "}
            <span className="text-white">{title}</span>
          </h2>

          <Dialog.Trigger className="-my-1.5 rounded-sm border border-zinc-600 bg-zinc-950 p-1.5 text-zinc-300 shadow-sm hover:border-zinc-500 hover:bg-zinc-900 hover:shadow-sm md:hidden">
            <PiListBold />
          </Dialog.Trigger>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 grid-cols-[1fr_3fr] gap-x-6 py-8 pb-8 sm:px-6 md:grid">
        <aside className="top-26 hidden flex-col gap-0.5 self-start text-zinc-400 md:sticky md:flex">
          <NavContent pathname={pathname} />
        </aside>

        <div className="flex flex-1 flex-col gap-8 px-3">{children}</div>
      </main>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-70 h-screen w-screen bg-black/40 opacity-100 transition-opacity duration-75 starting:opacity-0" />
        <Dialog.Content className="fixed bottom-0 left-0 z-70 w-screen translate-y-0 rounded-t-lg bg-black px-3 py-6 shadow-xl transition-transform duration-100 starting:translate-y-full">
          <Dialog.Title className="sr-only">Settings Navigation</Dialog.Title>

          <NavContent pathname={pathname} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
