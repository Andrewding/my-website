import { createClient } from "@supabase/supabase-js";

// This client uses the ANON key, which is safe to expose to the browser.
// It can only do what your Row Level Security (RLS) policies allow — see
// supabase/schema.sql, where the policy only allows reading products
// with status = 'active'. It must NEVER be used to write data.
//
// Used by: storefront pages (home, products list, product detail).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Thrown at build/runtime so a missing .env.local is obvious immediately,
  // instead of failing silently with confusing empty product lists.
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Add them to .env.local (see .env.local.example)."
  );
}

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }, // we don't use Supabase Auth for visitors
});
