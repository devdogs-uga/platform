import "~/styles/globals.css";

import { addWeeks } from "date-fns";
import { type Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import Footer from "~/components/Footer";
import Navigation from "~/components/Navigation";
import { getSession } from "~/server/auth";

export const metadata: Metadata = {
  title: "DevDogs",
  description:
    "DevDogs is a club at UGA devoted to bettering our community through open-source software.",
  applicationName: "DevDogs",
};

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession({
    user: {
      columns: {},
      with: { github: { with: { points: true } }, publicProfile: true },
    },
  });

  const currentYear = new Date().getUTCFullYear();
  const currentYearPoints = session?.user?.github?.points?.find(
    (points) => points.year === currentYear,
  );

  const streak = currentYearPoints
    ? {
        length: currentYearPoints.streakLength,
        renewalStart: addWeeks(
          currentYearPoints.streakStart,
          currentYearPoints.streakLength,
        ),
        renewalCutoff: addWeeks(
          currentYearPoints.streakStart,
          currentYearPoints.streakLength + 1,
        ),
      }
    : null;

  return (
    <html lang="en" className={`${sans.variable}`}>
      <body className="bg-zinc-950 text-white">
        <div className="flex min-h-screen flex-col">
          <Navigation
            githubProfile={session?.user.github}
            streak={streak}
            publicProfile={session?.user.publicProfile}
          />
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
