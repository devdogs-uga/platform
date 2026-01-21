"use client";

import {
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

export default function NavContainer({ children }: PropsWithChildren) {
  const [isFloating, setIsFloating] = useState(false);

  const handleScroll = useCallback(() => {
    if (document.scrollingElement) {
      setIsFloating(document.scrollingElement.scrollTop !== 0);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    handleScroll();
    window.addEventListener("scroll", handleScroll, controller);

    return () => controller.abort();
  }, [handleScroll]);
  return (
    <nav
      className="fixed top-0 left-0 w-full transition-[background-color,box-shadow,backdrop-filter] data-float:bg-black/30 data-float:shadow-xl data-float:backdrop-blur-sm"
      data-float={isFloating || undefined}
    >
      {children}
    </nav>
  );
}
