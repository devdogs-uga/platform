import NavBar from "~/components/NavBar";
import Footer from "~/components/Footer";
import { Toaster } from "~/components/toaster";
import "~/styles/globals.css";

export const metadata = {
  title: "DevDogs",
  description: "Building software with a purpose at the University of Georgia.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="base-background">
          <NavBar />
          {children}
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}