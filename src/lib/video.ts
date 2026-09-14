export type VideoSource =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "vimeo"; embedUrl: string }
  | { kind: "file"; src: string }
  | { kind: "none" };

/**
 * Admins paste whatever link they have. YouTube and Vimeo need their embed
 * players; anything else (a Cloudinary upload, an .mp4) plays in <video>.
 */
export function resolveVideo(url?: string): VideoSource {
  if (!url?.trim()) return { kind: "none" };
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return { kind: "none" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return { kind: "none" };
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be" || host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
    const id =
      host === "youtu.be"
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get("v") ?? parsed.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{6,})/)?.[1];
    if (id && /^[\w-]{6,}$/.test(id)) {
      return { kind: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` };
    }
    return { kind: "none" };
  }
  if (host.endsWith("vimeo.com")) {
    const id = parsed.pathname.match(/\/(\d+)/)?.[1];
    return id ? { kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}` } : { kind: "none" };
  }
  return { kind: "file", src: parsed.toString() };
}

export function formatMinutes(total: number): string {
  if (!total) return "";
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}
