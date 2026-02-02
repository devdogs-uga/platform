import Link from "next/link";
import { PiArrowRightBold } from "react-icons/pi";
import LinkButton from "~/components/LinkButton";

export default async function HomePage() {
  return (
    <main className="flex h-dvh flex-col items-center justify-around px-4 py-18.75">
      <section className="flex max-w-xl flex-col items-center gap-8 text-center text-lg font-medium md:gap-12 md:text-xl">
        <h2 className="text-4xl/none font-bold md:text-5xl/none">
          Welcome to <span className="text-rose-400">DevDogs</span>!
        </h2>
        <p className="flex flex-col items-center gap-6 text-balance text-zinc-200">
          <span className="block">
            We&rsquo;re a club devoted to bettering our community through
            open-source software.
          </span>
          <span className="block">
            Right now, we&rsquo;re in the process of redesigning our website to
            make it more useful, accessible, and beautiful!
          </span>
          <span className="block">
            In the meantime, use the button below to sign in and set up
            everything you need to get started.
          </span>
        </p>

        <LinkButton
          href="/join"
          className="flex items-center justify-center gap-5 rounded-sm bg-rose-900 px-8 py-2 text-white ring-rose-900 hover:bg-rose-200 hover:text-rose-900 md:px-12 md:py-3"
        >
          Join Us
          <PiArrowRightBold />
        </LinkButton>

        <p className="text-sm text-balance text-zinc-400">
          When you click &ldquo;Join Us&rdquo;, you will sign in with Google. We
          use the data you provide to verify your status as a student at UGA. By
          continuing, you agree to our{" "}
          <Link className="underline" href="/legal/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
