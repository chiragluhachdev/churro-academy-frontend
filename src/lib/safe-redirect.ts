/**
 * Accepts only same-site paths for post-login redirects. Without this,
 * `/login?next=https://evil.example` would bounce a freshly signed-in user to
 * any site — a standard phishing trick.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  // Must be a root-relative path; "//host" and "/\\host" are protocol-relative.
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  try {
    const url = new URL(next, "http://local.invalid");
    if (url.origin !== "http://local.invalid") return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}
