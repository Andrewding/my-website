// Minimal signed-cookie session for a single admin account — no Supabase
// Auth, no session table, no extra deps. Good enough for "one admin logs
// into one back office"; if you later need multiple admin accounts or
// password resets, swap this for Supabase Auth instead.
//
// Session token format: "<username>.<expiresAtMs>.<hmacSignature>"
// The signature proves the token wasn't tampered with; it does NOT encrypt
// anything, so don't put secrets other than the username in the payload.

export const ADMIN_COOKIE_NAME = "twh_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Missing ADMIN_SESSION_SECRET env var. Set it to any long random string."
    );
  }
  return secret;
}

async function hmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return arrayBufferToBase64Url(signature);
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Checks the submitted username/password against the two env vars. */
export function checkAdminCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) {
    throw new Error("Missing ADMIN_USERNAME or ADMIN_PASSWORD env var.");
  }
  return username === expectedUser && password === expectedPass;
}

/** Creates a signed session token to store in the admin cookie after login. */
export async function createSessionToken(username: string): Promise<string> {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${username}.${expiresAt}`;
  const signature = await hmacSha256(payload, getSecret());
  return `${payload}.${signature}`;
}

/** Verifies a session token read back from the cookie. Returns true if valid & not expired. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [username, expiresAtStr, signature] = parts;

  const expectedSignature = await hmacSha256(`${username}.${expiresAtStr}`, getSecret());
  if (signature !== expectedSignature) return false;

  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || Date.now() > expiresAt) return false;

  return true;
}
