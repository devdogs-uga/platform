import "~/styles/globals.css";

import { type Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import localFont from "next/font/local"; 
import Navigation from "~/components/Navigation";

import Navbar from "~/components/Navbar"; 

export const metadata: Metadata = {};

// const sans = Hanken_Grotesk({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

const baru = localFont({
  src: [
    {
      path: "../../public/fonts/baru-sans-font/BaruSansRegular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansItalic.otf",
      weight: "400",
      style: "italic",
    }, 
    {
      path: "../../public/fonts/baru-sans-font/BaruSansThin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansThinItalic.otf",
      weight: "100",
      style: "italic",
    }, 
    {
      path: "../../public/fonts/baru-sans-font/BaruSansExtraLight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansExtltIta.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansLight.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansLightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansMedium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansMediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansSemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansSemiBoldItalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansBold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansBoldItalic.otf",
      weight: "700",
      style: "italic",
    }, 
    {
      path: "../../public/fonts/baru-sans-font/BaruSansExtraBold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansExtbdita.otf",
      weight: "800",
      style: "italic",
    }, 
    {
      path: "../../public/fonts/baru-sans-font/BaruSansBlack.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/baru-sans-font/BaruSansBlackItalic.otf",
      weight: "900",
      style: "italic",
    }
  ], 
  variable: "--font-baru", 
  display: "swap",
}); 

const myriad = localFont({
  src: [
    {
      path: "../../public/fonts/myriad-pro/MYRIADPRO-REGULAR.otf",
      weight: "400", 
      style: "normal",
    }, 
    {
      path: "../../public/fonts/myriad-pro/MyriadPro-Light.otf", 
      weight: "300",
      style: "normal",
    }, 
    {
      path: "../../public/fonts/myriad-pro/MYRIADPRO-SEMIBOLD.otf",
      weight: "600", 
      style: "normal",
    }, 
    {
      path: "../../public/fonts/myriad-pro/MYRIADPRO-BOLD.otf",
      weight: "700", 
      style: "normal",
    }, 
    {
      path: "../../public/fonts/myriad-pro/MYRIADPRO-SEMIBOLDIT.otf",
      weight: "600",
      style: "italic",
    }, 
    {
      path: "../../public/fonts/myriad-pro/MYRIADPRO-BOLDIT.otf",
      weight: "700",
      style: "italic",
    }, 
  ], 
  variable: "--font-myriad", 
  display: "swap",
}); 

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-theme="dark" lang="en" className={`${baru.variable} ${myriad.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Navigation /> 
        <main className="flex-1 text-night bg-linear-to-b from-snow to-putty dark:text-snow dark:from-dark-purple dark:to-night">{children}</main>
      </body>
    </html>
  );
}