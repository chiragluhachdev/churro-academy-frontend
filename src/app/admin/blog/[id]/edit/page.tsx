import { notFound } from "next/navigation";

import { PostForm } from "@/components/admin/PostForm";
import { Reveal } from "@/components/ui/Reveal";
import { adminApi } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin - Edit Post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { accessToken } = await requireAdmin();
  const post = (await adminApi.posts(accessToken)).find((p) => p.id === id);
  if (!post) notFound();

  return (
    <div className="space-y-10">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight">Edit post</h1>
        <p className="text-muted mt-2 text-[0.95rem]">{post.title}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <PostForm initialData={post} />
      </Reveal>
    </div>
  );
}
