import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Everything public is crawlable. The admin console, the account-free
 * checkout/order endpoints and the per-order invoice link are excluded —
 * none of them are ever linked from a public page, and an invoice link is
 * effectively a private bearer token, so it has no business being indexed
 * even though nothing here is technically secret.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/login", "/invoice"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
