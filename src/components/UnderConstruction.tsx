import { PiArrowRightBold } from "react-icons/pi";
import LinkButton from "./LinkButton";

export default function UnderConstruction() {
  return (
    <main className="flex h-dvh flex-col items-center justify-around px-4 py-18.75">
      <section className="flex max-w-md flex-col items-center md:gap-12 gap-8 text-center text-lg md:text-xl font-medium">
        <h2 className="text-4xl/none md:text-5xl/none font-bold">
          Under <span className="text-rose-400">Construction</span>
        </h2>
        <p className="text-zinc-200 text-balance flex flex-col items-center gap-4">
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
          className="flex items-center justify-center gap-5 px-8 rounded-sm bg-rose-900 py-2 md:py-3 md:px-12 text-white ring-rose-900 hover:bg-rose-200 hover:text-rose-900"
        >
          Check it Out
          <PiArrowRightBold />
        </LinkButton>
      </section>
    </main>
  );
}
