import { NextResponse, type NextRequest } from "next/server";

import { PROTECTED_PREFIX, routes } from "@/config/routes";
import { proxySession } from "@/server/backend";

const isAdminPath = (pathname: string) =>
  pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`);

/**
 * Runs before admin requests (and /login):
 *  1. refreshes the session when the 15-minute access token has expired
 *     (rotating the refresh token)
 *  2. optimistic redirect: no session on /admin -> /login, session on /login -> /admin
 *
 * The public website never touches the session. This is NOT authorization:
 * pages and actions still check via the DAL (src/server/auth/session.ts).
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { response, hasSession } = await proxySession(request);

  if (!hasSession && isAdminPath(pathname)) {
    const url = new URL(routes.login, request.url);
    if (pathname !== routes.home) url.searchParams.set("next", `${pathname}${search}`);
    return withCookies(NextResponse.redirect(url), response);
  }

  if (hasSession && pathname === routes.login) {
    return withCookies(NextResponse.redirect(new URL(routes.home, request.url)), response);
  }

  return response;
}

/** Keep refreshed session cookies when we replace the response with a redirect. */
function withCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export const config = {
  // Admin pages and the login page only; the public site stays session-free and cacheable.
  matcher: ["/admin/:path*", "/login"],
};
