"use client";

import { getUploadTicketAction } from "@/app/admin/actions";

export const UPLOAD_LIMITS = { image: { bytes: 10 * 1024 * 1024, label: "10 MB" } } as const;

/** Uploads straight to Cloudinary, reporting progress (0–100). Resolves to the file URL. */
export async function uploadFile(file: File, onProgress?: (percent: number) => void): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image.");
  if (file.size > UPLOAD_LIMITS.image.bytes) {
    throw new Error(`Images must be under ${UPLOAD_LIMITS.image.label}.`);
  }

  const ticket = await getUploadTicketAction();
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
