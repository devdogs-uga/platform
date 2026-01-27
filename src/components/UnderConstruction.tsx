import { PiArrowRightBold } from "react-icons/pi";
import LinkButton from "./LinkButton";

export default function UnderConstruction() {
  return (
    <main className="flex h-dvh flex-col items-center justify-around px-4 py-18.75">
      <section className="flex max-w-md flex-col items-center gap-8 text-center text-lg font-medium md:gap-12 md:text-xl">
        <h2 className="text-4xl/none font-bold md:text-5xl/none">
          Under <span className="text-rose-400">Construction</span>
        </h2>
        <p className="flex flex-col items-center gap-4 text-balance text-zinc-200">
          <span className="inline-block">
            We&rsquo;re in the process of redesigning our website to make it
            more useful, accessible, and beautiful!
          </span>
          <span className="inline-block">
            This page isn&rsquo;t quite done yet, but some other (more
            important) pages are.
          </span>
        </p>

        <LinkButton
          href="/join"
          className="flex items-center justify-center gap-5 rounded-sm bg-rose-900 px-8 py-2 text-white ring-rose-900 hover:bg-rose-200 hover:text-rose-900 md:px-12 md:py-3"
        >
          Check it Out
          <PiArrowRightBold />
        </LinkButton>
      </section>
    </main>
  );
}
