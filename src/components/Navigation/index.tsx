"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps, PropsWithChildren, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PiArrowRightBold,
  PiCalendarStarDuotone,
  PiCodeDuotone,
  PiHandshakeDuotone,
  PiUsersThreeDuotone,
} from "react-icons/pi";
import devdog from "~/assets/devdog.png";
import AlertBanner from "./AlertBanner";
import ProfileMenu from "./ProfileMenu";
import LinkInBio from "./LinkInBio";

interface NavItemProps extends PropsWithChildren {
  href: ComponentProps<typeof Link>["href"];
  icon: ReactNode;
}

function NavItem({ href, children, icon }: NavItemProps) {
  return (
    <li className="contents">
      <Link
        href={href}
        className="flex items-center gap-3 rounded-sm px-3 py-0.75 transition-[box-shadow,color] hover:bg-black/50 hover:shadow-xs md:px-5"
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

interface Props {
  streak: ComponentProps<typeof AlertBanner>["streak"] &
    ComponentProps<typeof ProfileMenu>["streak"];
  publicProfile:
    | ComponentProps<typeof ProfileMenu>["publicProfile"]
    | null
    | undefined;
  githubProfile:
    | ComponentProps<typeof ProfileMenu>["githubProfile"]
    | null
    | undefined;
}

export default function Navigation({
  publicProfile,
  githubProfile,
  streak,
}: Props) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isFromLinkInBio = useMemo(
    () =>
      searchParams
        .getAll("utm_content")
        .some((s) => s.toLowerCase().replaceAll(/[^a-z]/g, "") === "linkinbio"),
    [searchParams],
  );

  const handleScroll = useCallback(() => {
    if (navigationRef.current) {
      console.log(navigationRef.current.getBoundingClientRect());
      setHasScrolled(navigationRef.current.getBoundingClientRect().top === 0);
    }
  }, []);

  const handleMenuToggle = useCallback(() => {
    setMenuOpen((o) => !o);

    navigationRef.current?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    handleScroll();
    window.addEventListener("scroll", handleScroll, controller);

    return () => controller.abort();
  }, [handleScroll]);

  useEffect(() => {
    setMenuOpen(isFromLinkInBio);
    handleScroll();
  }, [pathname, isFromLinkInBio, handleScroll]);

  return (
    <>
      {!isFromLinkInBio && (
        <AlertBanner linkedGithubProfile={!!githubProfile} streak={streak} />
      )}

      <nav
        className="sticky top-0 left-0 z-60 flex h-0 w-full flex-col"
        ref={navigationRef}
      >
        <div
          className="group absolute flex h-18 w-full flex-col overflow-y-hidden from-rose-950/20 to-black/30 transition-[background-color,box-shadow,backdrop-filter,translate,height] data-backdrop:bg-zinc-950/60 data-backdrop:shadow-xl data-backdrop:backdrop-blur-sm data-menu-open:h-dvh md:h-19"
          data-scrolled={hasScrolled || undefined}
          data-menu-open={isMenuOpen || undefined}
          data-from-link-in-bio={isFromLinkInBio || undefined}
          data-backdrop={hasScrolled || isMenuOpen || undefined}
        >
          <div className="mx-auto flex w-full max-w-360 grid-cols-[1fr_max-content_1fr] items-center justify-between px-4 py-5 md:grid md:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold md:text-2xl lg:gap-2.5"
            >
              <figure className="size-[1.5em]">
                <Image alt="Home" src={devdog} />
              </figure>
              <h1 className="contents">DevDogs</h1>
            </Link>

            <div className="hidden items-center md:flex lg:gap-4 lg:px-4 lg:text-lg">
              <NavigationItems />
            </div>

            <div className="flex items-center justify-end gap-3 transition-opacity group-data-from-link-in-bio:pointer-events-none group-data-from-link-in-bio:opacity-0">
              <button
                type="button"
                onClick={handleMenuToggle}
                className="relative flex size-8 flex-col items-end justify-center gap-1 rounded-sm pr-2 pl-3.5 text-zinc-300 hover:bg-rose-700/30 hover:text-white md:hidden"
              >
                <span className="box-content h-0.5 w-full border-l-6 bg-current transition-transform group-data-menu-open:translate-y-0.75 group-data-menu-open:-rotate-45" />
                <span className="box-content h-0.5 w-full bg-current transition-transform group-data-menu-open:-translate-y-0.75 group-data-menu-open:rotate-45 group-data-menu-open:border-l-6" />
              </button>

              {publicProfile ? (
                <ProfileMenu
                  publicProfile={publicProfile}
                  githubProfile={githubProfile}
                  streak={streak}
                />
              ) : (
                <Link
                  className="flex items-center gap-1.5 place-self-end rounded-md border border-rose-950 bg-rose-900 px-3 py-1 text-sm font-semibold shadow-sm inset-ring-0 inset-ring-rose-900 transition-[color,box-shadow,background-color] hover:bg-rose-100 hover:text-rose-900 hover:shadow-md hover:inset-ring-3 md:gap-2 md:px-5 md:py-1.5 md:text-base lg:px-7 lg:text-lg"
                  href="/join"
                >
                  Join Us
                  <PiArrowRightBold />
                </Link>
              )}
            </div>
          </div>

          <div className="hidden transition-[display] delay-500 group-data-from-link-in-bio:contents">
            <div className="mb-18 flex grow flex-col justify-center px-3 md:mb-19">
              <LinkInBio />
            </div>
          </div>

          <div className="contents transition-[display] delay-500 group-data-from-link-in-bio:hidden">
            <div className="flex flex-col items-start gap-1.5 px-3">
              <NavigationItems />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
