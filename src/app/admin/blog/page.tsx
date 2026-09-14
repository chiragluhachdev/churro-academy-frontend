import Image from "next/image";
import Link from "next/link";
import { Edit3, ExternalLink, Eye, EyeOff, Plus, Sparkles } from "lucide-react";

import { deletePostAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/fields";
import { Reveal } from "@/components/ui/Reveal";
import { adminApi, formatPostDate } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin - Blog" };

export default async function AdminBlogPage() {
  const { accessToken } = await requireAdmin();
  const posts = await adminApi.posts(accessToken);

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight">Blog</h1>
            <p className="text-muted mt-2 text-[0.95rem]">Articles on the /blog page.</p>
          </div>
          <Link
            href="/admin/blog/new"
            className="bg-forest hover:bg-forest-deep text-cream inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.9rem] font-medium transition-colors"
          >
            <Plus className="size-4" strokeWidth={2} />
            New post
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <ul className="border-line/50 bg-cream-warm divide-line/30 divide-y overflow-hidden rounded-2xl border">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image src={post.cover} alt="" fill sizes="80px" className="object-cover" unoptimized />
                </div>
                <div className="min-w-0">
                  <p className="text-ink truncate font-medium">{post.title}</p>
                  <p className="text-muted mt-0.5 text-[0.8rem]">
                    {post.category} · {formatPostDate(post.publishedAt)} · {post.readingMinutes} min
                  </p>
                  <div className="mt-1.5 flex gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${post.published ? "bg-forest/10 text-forest" : "bg-sand text-ink/70"}`}>
                      {post.published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                      {post.published ? "Published" : "Draft"}
                    </span>
                    {post.featured && (
                      <span className="bg-gold/15 text-ink inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium">
                        <Sparkles className="size-3" />
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-5 text-sm">
                {post.published && (
                  <Link href={`/blog/${post.slug}`} target="_blank" className="text-muted hover:text-ink inline-flex items-center gap-1.5 font-medium">
                    <ExternalLink className="size-4" />
                    View
                  </Link>
                )}
                <Link href={`/admin/blog/${post.id}/edit`} className="text-forest hover:text-forest-deep inline-flex items-center gap-1.5 font-medium">
                  <Edit3 className="size-4" />
                  Edit
                </Link>
                <DeleteButton action={deletePostAction.bind(null, post.id)} confirmText={`Delete "${post.title}"?`} />
              </div>
            </li>
          ))}
          {posts.length === 0 && <li className="text-muted px-6 py-12 text-center">No posts yet.</li>}
        </ul>
      </Reveal>
    </div>
  );
}
