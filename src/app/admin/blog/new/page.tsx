import { PostForm } from "@/components/admin/PostForm";
import { Reveal } from "@/components/ui/Reveal";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin - New Post" };

export default async function NewPostPage() {
  await requireAdmin();
  return (
    <div className="space-y-10">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight">New post</h1>
      </Reveal>
      <Reveal delay={0.1}>
        <PostForm />
      </Reveal>
    </div>
  );
}
