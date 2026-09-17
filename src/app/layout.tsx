import type { Metadata } from "next";
import { Caveat, Inter, Playfair_Display } from "next/font/google";
import { auth } from "@/auth";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { fetchChef } from "@/lib/api";
import { JsonLd, SITE_URL, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
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

const TITLE = "Churro Academy — Online Baking Courses with Chef Simone Kathuria";
const DESCRIPTION =
  "Churro Academy (Churro Academy Global) turns your passion for desserts into real skills. Learn cakes, churros, French pastry and more from Chef Simone Kathuria through structured, step-by-step online baking courses with lifetime access.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.churroacademyglobal.com"),
  title: {
    default: TITLE,
    template: "%s · Churro Academy",
  },
  description: DESCRIPTION,
  applicationName: "Churro Academy",
  keywords: [
    "Churro Academy",
    "Churro Academy Global",
    "Chef Simone Kathuria",
    "online baking courses",
    "online baking classes",
    "churro making course",
    "learn churros",
    "online dessert courses",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  // Set once a Search Console property exists — no tag renders until then.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  // Absolute URLs, plain filenames under /public (never Next's hashed
  // app/icon.* route) — so the address Google indexes today is the address
  // it still finds on every future deploy. logo.png is the square CA
  // monogram; favicon.ico/apple-touch-icon.png/icon-*.png are generated
  // from it (see the favicon.ico's own multi-size frames for legacy UAs).
  icons: {
    icon: [
      { url: `${SITE_URL}/favicon.ico`, sizes: "any" },
      { url: `${SITE_URL}/icon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${SITE_URL}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${SITE_URL}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: `${SITE_URL}/favicon.ico` }],
    apple: [{ url: `${SITE_URL}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    siteName: "Churro Academy",
    locale: "en_IN",
    url: "/",
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
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [session, chef] = await Promise.all([
    auth(),
    // sameAs on the sitewide Organization schema; never worth failing the
    // whole page over if content service hiccups.
    fetchChef().catch(() => undefined),
  ]);

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="bg-cream text-ink flex min-h-full flex-col overflow-x-hidden">
        <JsonLd data={organizationJsonLd(chef)} />
        <JsonLd data={websiteJsonLd()} />
        <SessionProvider session={session}>
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
