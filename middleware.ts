import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "./lib/admin-auth";

// Runs before every request to /admin/** and /api/admin/**.
// - /admin/login and POST /api/admin/login are public (that's how you log in).
// - Everything else under those two prefixes requires a valid session cookie.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);

  if (!valid) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
