import Link from "next/link";
import {
  PiArrowRightBold,
  PiLink,
  PiDotsThreeVertical,
  PiInstagramLogoFill,
  PiGithubLogoFill,
  PiLinkedinLogoFill,
  PiEnvelopeSimpleFill,
} from "react-icons/pi";
import LinkButton from "~/components/LinkButton";
import Share from "~/components/Share";

export default function LinkInBio() {
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
          scroll={false}
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
