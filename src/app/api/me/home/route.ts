import { getSession } from "@/lib/session";

/**
 * Where the signed-in user belongs. The login form calls this straight after
 * sign-in, when the client does not yet know the username.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("/login", { status: 200 });
  const path =
    session.user.role === "admin" ? "/admin" : `/${session.user.username}/dashboard`;
  return new Response(path, { status: 200 });
}
