"use client";

import { getUploadTicketAction } from "@/app/admin/actions";

export const UPLOAD_LIMITS = {
  image: { bytes: 10 * 1024 * 1024, label: "10 MB" },
  // Cloudinary's per-file ceiling on standard plans. Longer videos: host on
  // YouTube (unlisted) or Vimeo and paste the link instead.
  video: { bytes: 100 * 1024 * 1024, label: "100 MB" },
} as const;

/** Uploads straight to Cloudinary, reporting progress (0–100). Resolves to the file URL. */
export async function uploadFile(
  file: File,
  kind: "image" | "video",
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (!file.type.startsWith(`${kind}/`)) throw new Error(`That file isn't ${kind === "image" ? "an image" : "a video"}.`);
  if (file.size > UPLOAD_LIMITS[kind].bytes) {
    throw new Error(
      kind === "video"
        ? `Videos must be under ${UPLOAD_LIMITS.video.label}. For longer lessons, upload to YouTube (unlisted) or Vimeo and paste the link.`
        : `Images must be under ${UPLOAD_LIMITS.image.label}.`,
    );
  }

  const ticket = await getUploadTicketAction(kind);
  if (!ticket.ok) throw new Error(ticket.error);
  const { uploadUrl, apiKey, timestamp, folder, signature } = ticket.data;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  // XHR rather than fetch: fetch can't report upload progress.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) resolve(body.secure_url);
        else reject(new Error(body?.error?.message ?? "Upload failed."));
      } catch {
        reject(new Error("Upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed — check your connection."));
    xhr.send(form);
  });
}
