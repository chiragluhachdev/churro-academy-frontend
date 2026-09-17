import type { Chef, Post, Testimonial } from "@/lib/api";
import type { Course } from "@/types/course";

/**
 * One source of truth for the deployed origin, so every canonical URL and
 * JSON-LD `url` field agrees with `metadataBase` in the root layout instead
 * of drifting from it.
 */
export const SITE_URL = "https://www.churroacademyglobal.com";
export const SITE_NAME = "Churro Academy";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Organization + WebSite — emitted once, sitewide, in the root layout. This
 * is what lets Google attribute course/article rich results to a real
 * publisher and show the right name/logo in the knowledge panel.
 */
export function organizationJsonLd(chef?: Chef) {
  const sameAs = (chef?.socials ?? [])
    .map((s) => s.href)
    .filter((href) => /^https?:\/\//.test(href));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "Churro Academy Global",
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/logo.png"),
    description:
      "Churro Academy is an online baking school offering structured, step-by-step video courses in cakes, churros, French pastry, breads and more — taught by Chef Simone Kathuria.",
    ...(sameAs.length > 0 && { sameAs }),
    founder: {
      "@type": "Person",
      name: "Simone Kathuria",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: "Churro Academy Global",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
  };
}

/** Chef Simone Kathuria as a Person, on /chef — the page Google should show for her name. */
export function personJsonLd(chef: Chef) {
  const sameAs = chef.socials.map((s) => s.href).filter((href) => /^https?:\/\//.test(href));
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/chef#person`,
    name: chef.name,
    jobTitle: chef.title || "Founder & Head Pastry Chef",
    description: chef.bio,
    image: chef.portrait || chef.avatar,
    url: absoluteUrl("/chef"),
    ...(sameAs.length > 0 && { sameAs }),
    worksFor: { "@id": `${SITE_URL}/#organization` },
    knowsAbout: chef.specialities,
  };
}

/**
 * Course rich result. Google's spec wants at minimum name/description/
 * provider; aggregateRating and offers are optional but both are backed by
 * real, visible data here (star rating shown on the card, price shown in
 * the enroll box), so they're worth including.
 */
export function courseJsonLd(course: Course) {
  const price = course.discountPrice ?? course.price;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${SITE_URL}/courses/${course.slug}#course`,
    name: course.title,
    description: course.description || course.shortDescription,
    url: absoluteUrl(`/courses/${course.slug}`),
    image: course.heroImage || course.thumbnail,
    inLanguage: "en",
    provider: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    instructor: {
      "@type": "Person",
      name: course.instructor?.name || "Chef Simone Kathuria",
      "@id": `${SITE_URL}/chef#person`,
    },
    ...(course.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: course.rating,
        reviewCount: course.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/courses/${course.slug}`),
      category: "Paid",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: course.duration || undefined,
    },
  };
}

/** Only emitted when the FAQ accordion it mirrors is actually on the page. */
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** A blog post as an Article, for /blog/[slug]. */
export function articleJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt,
    image: post.cover,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: "en",
    author: { "@type": "Person", name: post.author, "@id": `${SITE_URL}/chef#person` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };
}

/** ItemList of the published catalogue, for /courses. */
export function courseListJsonLd(courses: Course[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((course, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/courses/${course.slug}`),
      name: course.title,
    })),
  };
}

/** Star-rated reviews as a Review list on /reviews, matched to what's on screen. */
export function reviewsJsonLd(testimonials: Testimonial[]) {
  if (testimonials.length === 0) return null;
  const avg = testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Math.round(avg * 10) / 10,
      reviewCount: testimonials.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: testimonials.slice(0, 20).map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
      reviewBody: t.quote,
    })),
  };
}

/** Renders a JSON-LD object as a script tag. Pass null to render nothing. */
export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return (
    // eslint-disable-next-line react/no-danger -- JSON.stringify output, no user HTML.
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
