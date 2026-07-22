import "server-only";
import { createClient } from "@supabase/supabase-js";

// ⚠️ SERVER-ONLY. This client uses the SERVICE ROLE key, which bypasses
// Row Level Security entirely (full read/write access to every table and
// every file in Storage). The `server-only` import above makes Next.js
// throw a build error if this file is ever accidentally imported from a
// Client Component or anywhere that could ship it to the browser.
//
// Used by: app/api/admin/** route handlers only, and only after the request
// has already passed the admin-session check in middleware.ts.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Add them to .env.local (see .env.local.example). " +
      "SUPABASE_SERVICE_ROLE_KEY must also be set in Vercel's server-side env vars."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// Name of the public Storage bucket product images are uploaded to.
// Create this bucket once in the Supabase dashboard (Storage → New bucket →
// name it exactly this → mark it Public). See README-ADMIN.md.
export const PRODUCT_IMAGES_BUCKET = "product-images";
