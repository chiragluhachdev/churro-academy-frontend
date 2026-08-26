import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { ApiError, api } from "@/lib/api";
import { getSession } from "@/lib/session";

/**
 * Purchase a course.
 *
 * There is no payment gateway yet: the backend records the enrollment as paid
 * with provider "manual". When Razorpay/Cashfree is added, the gateway's
 * callback should hit the backend directly and this route becomes the step that
 * creates the *order*, not the enrollment.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to enrol." }, { status: 401 });
  }

  try {
    const { courseId } = (await request.json()) as { courseId?: string };
    if (!courseId) {
      return NextResponse.json({ error: "Which course?" }, { status: 400 });
    }

    const data = await api<{ ok?: boolean; alreadyEnrolled?: boolean; slug: string }>(
      "/enrollments",
      { method: "POST", body: { courseId }, token: session.accessToken },
    );

    revalidatePath(`/${session.user.username}/dashboard`);
    revalidatePath(`/${session.user.username}/dashboard/courses`);

    return NextResponse.json({
      ...data,
      redirect: `/${session.user.username}/dashboard/courses`,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not complete enrolment." }, { status: 500 });
  }
}
