import "~/styles/globals.css";

import { addWeeks } from "date-fns";
import { type Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import Footer from "~/components/Footer";
import Navigation from "~/components/Navigation";
import QueryProvider from "~/components/QueryProvider";
import { expectUserWith } from "~/server/auth";

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
  const user = await expectUserWith({
    profile: true,
    leaderboardProfile: { with: { points: true } },
  }).catch(() => null);

  const currentYear = new Date().getUTCFullYear();
  const currentYearPoints = user?.leaderboardProfile?.points?.find(
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
        <QueryProvider>
          <div className="flex min-h-screen flex-col">
            <Navigation
              githubProfile={user?.leaderboardProfile}
              streak={streak}
              profile={user?.profile}
            />
            {children}
          </div>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
