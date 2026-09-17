import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { PostCard } from "@/components/blog/PostCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { fetchPost, fetchPosts, formatPostDate } from "@/lib/api";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [{ url: post.cover, width: 1600, height: 900, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.cover],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, all] = await Promise.all([fetchPost(slug), fetchPosts()]);
  if (!post) notFound();

  // Body is plain text; a blank line starts a new paragraph.
  const paragraphs = post.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const more = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <article className="bg-cream">
        <div className="mx-auto max-w-3xl px-5 pt-28 pb-12 sm:px-8 lg:pt-36">
          <Reveal>
            <Link
              href="/blog"
              className="text-muted hover:text-forest group inline-flex items-center gap-2 text-[0.85rem] transition-colors"
            >
              <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
              All articles
            </Link>
            <p className="text-muted mt-8 flex flex-wrap items-center gap-2.5 text-[0.8rem]">
              <span className="text-forest font-medium">{post.category}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingMinutes} min read</span>
            </p>
            <h1 className="font-display text-ink mt-4 text-[2.1rem] leading-[1.12] font-medium tracking-[-0.015em] text-balance sm:text-[3rem]">
              {post.title}
            </h1>
            <p className="text-muted mt-5 text-[1.05rem] leading-[1.75]">{post.excerpt}</p>
            <p className="text-ink mt-6 text-[0.88rem] font-medium">By {post.author}</p>
          </Reveal>
        </div>

        <Reveal className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Image src={post.cover} alt={post.title} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
          </div>
        </Reveal>

        <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 lg:py-20">
          {paragraphs.length > 0 ? (
            <div className="space-y-6">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-ink/85 text-[1.05rem] leading-[1.85]">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            // Seeded articles have no body yet — say so plainly instead of a blank page.
            <div className="border-line/80 rounded-2xl border border-dashed px-8 py-12 text-center">
              <p className="text-muted leading-[1.75]">The full article is being written. The summary above covers the key idea.</p>
              <Link href="/courses" className="text-forest group mt-5 inline-flex items-center gap-2 text-[0.9rem] font-medium">
                Learn it properly in a course
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </article>

      {more.length > 0 && (
        <section className="bg-cream-warm">
          <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:py-20">
            <Eyebrow>Keep reading</Eyebrow>
            <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
