"use client";

import { Root } from "@radix-ui/react-collapsible";
import { usePathname, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export default function NavContainer({ children }: PropsWithChildren) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
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
    if (document.scrollingElement) {
      setHasScrolled(document.scrollingElement.scrollTop !== 0);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    handleScroll();
    window.addEventListener("scroll", handleScroll, controller);

    return () => controller.abort();
  }, [handleScroll]);

  useEffect(() => {
    setMenuOpen(isFromLinkInBio);
  }, [pathname, isFromLinkInBio]);

  return (
    <Root
      className="group"
      data-scrolled={hasScrolled || undefined}
      data-from-link-in-bio={isFromLinkInBio || undefined}
      open={isMenuOpen}
      onOpenChange={setMenuOpen}
    >
      {children}
    </Root>
  );
}
