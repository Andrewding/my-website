import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE_SECONDS, checkAdminCredentials, createSessionToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = body?.username;
  const password = body?.password;

  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = checkAdminCredentials(username, password);
  } catch (err) {
    // Missing ADMIN_USERNAME/ADMIN_PASSWORD env vars — a deployment config issue.
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server misconfiguration" }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
