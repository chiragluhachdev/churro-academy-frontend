"use client";

import Link from "next/link";
import { Edit3, ExternalLink } from "lucide-react";

import { deleteCourseAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/fields";

export function CourseRowActions({
  id,
  slug,
  title,
  published,
  enrollmentCount,
}: {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  enrollmentCount: number;
}) {
  return (
    <div className="flex items-center justify-end gap-5">
      {published && (
        <Link
          href={`/courses/${slug}`}
          target="_blank"
          className="text-muted hover:text-ink inline-flex items-center gap-1.5 font-medium"
        >
          <ExternalLink className="size-4" />
          View
        </Link>
      )}
      <Link
        href={`/admin/courses/${id}/edit`}
        className="text-forest hover:text-forest-deep inline-flex items-center gap-1.5 font-medium"
      >
        <Edit3 className="size-4" />
        Edit
      </Link>
      <DeleteButton
        action={() => deleteCourseAction(id)}
        confirmText={
          enrollmentCount > 0
            ? `"${title}" has ${enrollmentCount} paid order${enrollmentCount === 1 ? "" : "s"} against it, so it can't be deleted.\n\nIf you just want to stop selling it, unpublish it instead.\n\nTry anyway?`
            : `Delete "${title}"? This can't be undone.`
        }
      />
    </div>
  );
}
