import type { Metadata } from "next";
import { Caveat, Inter, Playfair_Display } from "next/font/google";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Used sparingly, for the signature-style flourishes only.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.churroacademyglobal.com"),
  title: {
    default: "Churro Academy — Master the Art of Baking, Your Way",
    template: "%s · Churro Academy",
  },
  description:
    "Churro Academy turns your passion for desserts into real skills. Learn from expert pastry chefs through structured, step-by-step online baking courses.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Churro Academy — Master the Art of Baking, Your Way",
    description:
      "Learn baking from expert chefs through structured, step-by-step online courses.",
    type: "website",
    siteName: "Churro Academy",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Churro Academy Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Churro Academy — Master the Art of Baking, Your Way",
    description:
      "Learn baking from expert chefs through structured, step-by-step online courses.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="bg-cream text-ink flex min-h-full flex-col overflow-x-hidden">
        <SessionProvider>
          <ChromeGate>
            <Navbar />
          </ChromeGate>
        <main id="main" className="flex-1">
          {children}
        </main>
          <ChromeGate>
            <Footer />
            <ChatWidget />
          </ChromeGate>
        </SessionProvider>
      </body>
    </html>
  );
}
