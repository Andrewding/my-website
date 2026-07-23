import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// This client uses the ANON key, which is safe to expose to the browser.
// It can only do what your Row Level Security (RLS) policies allow — see
// supabase/schema.sql, where the policy only allows reading products
// with status = 'active'. It must NEVER be used to write data.
//
// Used by: storefront pages (home, products list, product detail).
//
// Same lazy-init pattern as lib/supabase/admin.ts: the client is only
// actually constructed (and env vars checked) on first real use, so a
// missing env var surfaces as a runtime error on the affected page rather
// than failing the entire `next build`.
let cachedClient: SupabaseClient | null = null;

function createPublicClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Add them to .env.local for local dev, and to Vercel → Project → " +
        "Settings → Environment Variables (Production + Preview) for deployment."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }, // we don't use Supabase Auth for visitors
  });
}

export const supabasePublic: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!cachedClient) cachedClient = createPublicClient();
    return Reflect.get(cachedClient, prop, receiver);
  },
});
