import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PostCard } from "@/components/blog/PostCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { fetchPosts, formatPostDate } from "@/lib/api";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technique notes, ingredient deep-dives and behind-the-scenes writing from the Churro Academy kitchen.",
};

export default async function BlogPage() {
  const posts = await fetchPosts();
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const rest = posts.filter((post) => post.id !== featured?.id);

  if (!featured) {
    return (
      <>
        <PageHeader eyebrow="Blog" title="Notes from the kitchen." />
        <section className="bg-cream">
          <p className="text-muted mx-auto max-w-[1400px] px-5 py-24 text-center sm:px-8">
            New articles are on their way — check back soon.
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Notes from the kitchen."
        lede="Technique explained properly, ingredients pulled apart, and the occasional account of what went wrong during filming."
      />

      <section className="bg-cream">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group border-line/80 hover:border-forest/25 grid gap-8 overflow-hidden rounded-2xl border p-5 transition-colors duration-500 lg:grid-cols-2 lg:gap-12 lg:p-7"
            >
              <div className="relative aspect-[3/2] overflow-hidden rounded-xl">
                <Image
                  src={featured.cover}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-muted flex flex-wrap items-center gap-2.5 text-[0.78rem]">
                  <span className="bg-sand text-forest rounded-full px-3 py-1 font-medium">
                    Featured
                  </span>
                  <span>{featured.category}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={featured.publishedAt}>{formatPostDate(featured.publishedAt)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{featured.readingMinutes} min read</span>
                </p>
                <h2 className="font-display text-ink group-hover:text-forest mt-5 text-[1.9rem] leading-[1.18] font-medium tracking-[-0.01em] text-balance transition-colors sm:text-[2.3rem]">
                  {featured.title}
                </h2>
                <p className="text-muted mt-4 leading-[1.8]">{featured.excerpt}</p>
                <span className="text-forest mt-6 inline-flex items-center gap-2 text-[0.9rem] font-medium">
                  Read article
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>

          <Reveal className="mt-16">
            <Eyebrow>Latest Articles</Eyebrow>
          </Reveal>

          <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, index) => (
              <Reveal as="li" key={post.id} delay={(index % 3) * 0.07}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

    </>
  );
}
