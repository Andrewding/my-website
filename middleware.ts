import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};