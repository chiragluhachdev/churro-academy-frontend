import Image from "next/image";
import Link from "next/link";

import { formatPostDate, type Post } from "@/lib/api";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group h-full">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <div className="border-line/70 relative aspect-[3/2] overflow-hidden rounded-2xl border">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 31vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.05]"
          />
        </div>
        <div className="flex flex-1 flex-col pt-5">
          <p className="text-muted flex flex-wrap items-center gap-2.5 text-[0.75rem]">
            <span className="text-forest font-medium">{post.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
          </p>
          <h3 className="font-display text-ink group-hover:text-forest mt-3 text-[1.25rem] leading-[1.25] font-medium transition-colors">
            {post.title}
          </h3>
          <p className="text-muted mt-3 text-[0.88rem] leading-[1.7]">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
