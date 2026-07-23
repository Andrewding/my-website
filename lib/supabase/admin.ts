import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ⚠️ SERVER-ONLY. This client uses the SERVICE ROLE key, which bypasses
// Row Level Security entirely (full read/write access to every table and
// every file in Storage). The `server-only` import above makes Next.js
// throw a build error if this file is ever accidentally imported from a
// Client Component or anywhere that could ship it to the browser.
//
// Used by: app/api/admin/** route handlers only, and only after the request
// has already passed the admin-session check in middleware.ts.
//
// IMPORTANT: the client is created lazily (on first real use), not at
// module load time. Next.js's build step ("collect page data") imports
// every route file just to inspect it, before your real env vars are
// necessarily available in that phase — throwing here unconditionally
// would fail `next build` even when the env vars are set correctly for
// the deployed app. Throwing only when the client is actually used avoids
// that false-positive build failure.
let cachedClient: SupabaseClient | null = null;

function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Add them to .env.local for local dev, and to Vercel → Project → " +
        "Settings → Environment Variables (Production + Preview) for deployment."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// Proxy defers actual client creation (and the env var check above) until
// the first time a method like `.from(...)` is called at request time,
// instead of at import time.
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!cachedClient) cachedClient = createAdminClient();
    return Reflect.get(cachedClient, prop, receiver);
  },
});

// Name of the public Storage bucket product images are uploaded to.
// Create this bucket once in the Supabase dashboard (Storage → New bucket →
// name it exactly this → mark it Public). See README-ADMIN.md.
export const PRODUCT_IMAGES_BUCKET = "product-images";
