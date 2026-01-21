import "~/styles/globals.css";

import { type Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import Navigation from "~/components/Navigation";

export const metadata: Metadata = {};

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable}`}>
      <body className="flex min-h-screen flex-col border-t-3 border-rose-600 bg-zinc-950 text-white">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
