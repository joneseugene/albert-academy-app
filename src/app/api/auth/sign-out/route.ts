import { NextResponse, type NextRequest } from "next/server";

import { backend } from "@/server/backend";

/**
 * Sign out (revoke the session, clear the cookies) WITHOUT re-rendering the
 * current page. A server action would trigger a refresh of the admin shell,
 * which unmounts the account menu mid sign-out; the client calls this instead
 * and then navigates to the sign-in page itself.
 */
export async function POST(request: NextRequest) {
  // Only our own pages may sign people out (blocks cross-site form posts).
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  await backend.auth.signOut();
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
