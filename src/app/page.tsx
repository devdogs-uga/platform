import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import Marquee from "react-fast-marquee";
import { PiArrowRightBold } from "react-icons/pi";
import backendDiscussion from "~/assets/BackendDiscussion.jpg";
import bg from "~/assets/bg.png";
import LinkButton from "~/components/LinkButton";
import jack from "~/assets/jack.jpg";
import kade from "~/assets/kade.jpg";
import maya from "~/assets/maya.jpg";
import nandan from "~/assets/nandan.jpg";
import rayan from "~/assets/rayan.jpg";
import samantha from "~/assets/samantha.jpg";
import sloan from "~/assets/sloan.jpg";
import zayan from "~/assets/zayan.jpg";
import anika from "~/assets/anika.png";

function MarqueeItem({ children }: PropsWithChildren) {
  return (
    <li className="flex items-center gap-4 px-2">
      <span>{children}</span>
      <span className="font-black opacity-30">/</span>
    </li>
  );
}

interface AvatarProps {
  name: string;
  title: string;
  imageSrc: StaticImageData;
  smaller?: boolean;
}

function Avatar({ name, title, imageSrc, smaller = false }: AvatarProps) {
  return (
    <figure
      className="group flex w-40 flex-col items-center gap-4 data-smaller:w-40 sm:w-48"
      data-smaller={smaller || undefined}
    >
      <Image
        alt={name}
        className="aspect-square w-28 rounded-full border-3 border-zinc-950 object-cover object-center ring-3 ring-rose-700 group-data-smaller:w-24 sm:w-32 sm:group-data-smaller:w-28"
        src={imageSrc}
      />
      <figcaption className="flex flex-col items-center gap-0.5 text-center font-medium text-balance">
        <span className="text-xl font-bold group-data-smaller:text-lg">
          {name}
        </span>
        <span className="text-base text-zinc-400 group-data-smaller:text-sm">
          {title}
        </span>
      </figcaption>
    </figure>
  );
}

export default async function HomePage() {
  return (
    <main className="flex flex-col items-center">
      <section className="relative w-full bg-radial-[at_50%_100%] from-rose-950/40 to-indigo-950/40 pt-19">
        <svg className="pointer-events-none absolute inset-0 isolate z-10 size-full opacity-70 mix-blend-soft-light">
          <filter id="delbadeoliveiraisalegend">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.80"
              numOctaves="4"
              stitchTiles="stitch"
            />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#delbadeoliveiraisalegend)"
          />
        </svg>

        <h2 className="-z-10 mx-auto -mb-3 max-w-3xl px-4 pt-6 text-center text-4xl/none font-black text-balance text-rose-400 sm:-mb-6 sm:pt-12 sm:text-5xl/none md:-mb-9 md:pt-15 md:text-6xl/none">
          Open-Source Software for the UGA Community.
        </h2>

        <Image
          alt=""
          src={bg}
          className="pointer-events-none z-0 w-full opacity-50 mix-blend-luminosity"
        />
      </section>

      <section className="w-full border-t border-zinc-800 bg-zinc-900/60">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto flex max-w-prose flex-col items-center gap-10 text-center text-base md:items-start md:text-left lg:text-lg">
            <h2 className="text-3xl font-extrabold text-rose-300 md:text-4xl">
              Our Mission
            </h2>

            <p className="flex flex-col gap-4 text-balance">
              <span>
                DevDogs provides a space for ambitious, motivated students to
                take ownership of impactful software projects from concept to
                completion.
              </span>
              <span>
                While DevDogs is one of many on-campus coding clubs, our size
                allows us build career-readiness through a development
                environment which reflects what students will see after they
                graduate.
              </span>
              <span>
                Every year, we embark on a new project with the goal of
                bettering the Athens or UGA community.
              </span>
              <span>
                Along the way, we teach newer developers skills they&rsquo;ll
                use throughout their careers, and we give more experienced
                developers the ability to shape a project they&rsquo;re
                passionate about.
              </span>
            </p>

            <LinkButton
              href="/projects"
              className="flex items-center justify-center gap-5 rounded-sm bg-rose-900 px-8 py-2 text-white ring-rose-900 hover:bg-rose-200 hover:text-rose-900"
            >
              View Our Projects
              <PiArrowRightBold />
            </LinkButton>
          </div>

          <figure className="hidden w-full max-w-100 min-w-80 flex-col overflow-hidden rounded-md border border-zinc-700 bg-linear-to-br from-rose-950 to-indigo-950 shadow-sm md:flex">
            <Image
              alt=""
              src={backendDiscussion}
              className="w-full mix-blend-luminosity"
            />
            <figcaption className="block w-full bg-zinc-800 p-1.5 text-right text-xs text-balance text-zinc-200 lg:text-sm">
              Project planning by the backend team for DevDogs&rsquo;{" "}
              <Link
                href="https://github.com/DevDogs-UGA/Optimal-Schedule-Builder"
                className="hover:underline"
              >
                Optimal Schedule Builder
              </Link>
              , the 2024-2025 project.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="flex w-full flex-col gap-3 border-t border-zinc-800 bg-black py-3">
        <h2 className="px-4 text-center text-sm font-extrabold tracking-wide text-zinc-400 uppercase">
          Contributors to DevDogs are
        </h2>
        <ul className="w-full overflow-hidden text-cyan-300">
          <Marquee className="overflow-hidden text-xl/none" autoFill>
            <MarqueeItem>Software Engineers</MarqueeItem>
            <MarqueeItem>UI Designers</MarqueeItem>
            <MarqueeItem>Data Gurus</MarqueeItem>
            <MarqueeItem>Impact-Havers</MarqueeItem>
            <MarqueeItem>Leaders</MarqueeItem>
          </Marquee>
        </ul>
      </section>

      <section className="w-full border-t border-zinc-800 bg-zinc-900/60">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-20 px-4 py-12 text-base md:px-6 md:py-16 md:text-lg">
          <div className="space-y-6">
            <h2 className="text-center text-3xl font-extrabold text-rose-400 md:text-4xl">
              Leadership
            </h2>

            <p className="max-w-prose text-center">
              DevDogs is proud to consist of over 350 UGA students from all tech
              disciplines and backgrounds. We firmly believe that different
              perspectives breed the best solutions&mdash;and we think our work
              shows!
            </p>
          </div>

          <article className="w-full space-y-8">
            <h3 className="flex items-center gap-4 font-black text-rose-300 uppercase">
              <span className="h-0.5 w-full bg-current" />
              <span className="whitespace-nowrap">
                2025&ndash;2026 Executive Board
              </span>
              <span className="h-0.5 w-full bg-current" />
            </h3>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-x-8">
              <Avatar name="Kade Styron" title="President" imageSrc={kade} />
              <Avatar
                name="Sloan Finger"
                title="Vice President"
                imageSrc={sloan}
              />
              <Avatar
                name="Jack Harrington"
                title="Project Manager"
                imageSrc={jack}
              />
              <Avatar
                name="Anika Khatri"
                title="Membership and Analytics Chair"
                imageSrc={anika}
              />
              <Avatar
                name="Maya Castillo"
                title="Social Media Manager"
                imageSrc={maya}
              />
            </div>
          </article>

          <article className="w-full space-y-8">
            <h3 className="flex items-center gap-4 font-black text-rose-300 uppercase">
              <span className="h-0.5 w-full bg-current" />
              <span className="whitespace-nowrap">Spring 2026 Focus Leads</span>
              <span className="h-0.5 w-full bg-current" />
            </h3>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-4 sm:gap-x-8">
              <Avatar
                name="Samantha Scalzini"
                title="UI/UX"
                imageSrc={samantha}
                smaller
              />
              <Avatar
                name="Nandan Praveen"
                title="Post Collections"
                imageSrc={nandan}
                smaller
              />
              <Avatar
                name="Zayan Hoodani"
                title="Event Pipeline"
                imageSrc={zayan}
                smaller
              />
              <Avatar
                name="Rayan Batada"
                title="Recommendation Engine"
                imageSrc={rayan}
                smaller
              />
            </div>
          </article>

          <LinkButton
            href="/community"
            className="flex items-center justify-center gap-5 rounded-sm bg-rose-900 px-8 py-2 text-lg text-white ring-rose-900 hover:bg-rose-200 hover:text-rose-900"
          >
            View Our Community
            <PiArrowRightBold />
          </LinkButton>
        </div>
      </section>
    </main>
  );
}
