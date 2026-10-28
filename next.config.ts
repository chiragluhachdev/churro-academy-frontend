import type { NextConfig } from "next";

/**
 * The site is Churro AI for now. The academy pages still exist in app/ —
 * they're only sent home, so deleting an entry here brings that page back.
 * Temporary (307) redirects, so search engines don't forget the old URLs.
 */
const HIDDEN_ACADEMY_PAGES = [
  "/courses",
  "/courses/:path*",
  "/blog",
  "/blog/:path*",
  "/chef",
  "/about",
  "/success-stories",
  "/reviews",
  "/faqs",
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...HIDDEN_ACADEMY_PAGES.map((source) => ({ source, destination: "/", permanent: false })),
      // Churro AI used to live under /churroai before it became the whole site.
      { source: "/churroai/login", destination: "/signin", permanent: true },
      { source: "/churroai/calculator", destination: "/calculator", permanent: true },
      { source: "/churroai", destination: "/", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Admin uploads are stored on Cloudinary; without this next/image
      // refuses to render them and the page errors.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
