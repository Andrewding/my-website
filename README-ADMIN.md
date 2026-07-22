# ThermalWear — Admin Back Office + Supabase Setup

This adds a `/admin` back office (login-protected) and moves the storefront from a
static `products.json` file to live data in Supabase (Postgres + Storage).

## 1. Create the Supabase project

1. Go to https://supabase.com → New project. Pick any name/region/password.
2. Once created, open **SQL Editor → New query**, paste in the full contents of
   `supabase/schema.sql` from this repo, and click **Run**. This creates:
   - the `products` table
   - Row Level Security policies (public visitors can only read `status = 'active'` products)
   - the `product-images` Storage bucket, set to public
3. Open **Project Settings → API** and copy three values you'll need in step 3:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ never expose this to the browser)

## 2. Set your admin login

Pick your own admin username/password — there's no sign-up flow, it's a single
account defined entirely by env vars:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=pick-a-strong-password
ADMIN_SESSION_SECRET=any-long-random-string   # e.g. `openssl rand -base64 32`
```

## 3. Environment variables

Copy `.env.local.example` → `.env.local` and fill in the 6 values from steps 1–2:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

## 4. Run locally

```bash
npm install
npm run dev
```

- Storefront: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

Log in, then **Products → + New Product** to add your first item — fill in name,
English description, price, category, specs (add as many label/value rows as
you want), upload a main image and any number of gallery images, then Create.
It appears on the live storefront immediately (no rebuild needed — pages are
rendered dynamically and always read the current Supabase data).

## 5. Deploy to Vercel

1. Push this project to a GitHub repo, then **Import Project** in Vercel.
2. In Vercel: **Project → Settings → Environment Variables**, add all 6 variables
   from step 3 (for Production, and Preview if you want preview deploys to work
   too). `SUPABASE_SERVICE_ROLE_KEY` only needs to exist as a server-side var —
   Vercel does this correctly by default since it has no `NEXT_PUBLIC_` prefix.
3. Deploy. No other build configuration is required — this is a standard
   Next.js App Router project (`next build` / `next start`), fully compatible
   with Vercel's default settings.

### Deployment gotchas worth knowing about

- **Don't reuse `NEXT_PUBLIC_SUPABASE_ANON_KEY` as the service role key** by
  accident when pasting into Vercel — double-check you copied the `anon` key
  into the `NEXT_PUBLIC_` var and the `service_role` key into the non-public one.
- **RLS is your safety net.** Even if the anon key leaked, it can only ever
  `SELECT` products where `status = 'active'` (see `supabase/schema.sql`). All
  writes require the service-role key, which only ever runs inside
  `app/api/admin/**` route handlers on the server, after `middleware.ts`
  has already verified the admin session cookie.
- **Storage bucket must be public** for `<img>` tags on the storefront to load
  product photos directly from the Supabase CDN URL. `schema.sql` already sets
  this up; double check under **Storage → product-images → bucket settings**
  if photos don't load.
- **Session cookie is `httpOnly` + `secure` in production**, so it requires
  HTTPS — Vercel serves everything over HTTPS by default, so no action needed
  there, just don't test the login flow over plain `http://` in production.
- **Changing the admin password** later is just changing `ADMIN_PASSWORD` in
  Vercel's env vars and redeploying (or Vercel → Settings → Environment
  Variables → Redeploy) — no database migration involved.

## 6. What's stored where

| Data | Where | Notes |
|---|---|---|
| Product name, description, price, category, specs, status | Supabase Postgres (`products` table) | `specs` is JSONB — add/remove fields freely from the admin form, no migration needed |
| Product photos (main + gallery) | Supabase Storage (`product-images` bucket) | Public URLs, uploaded via `/api/admin/upload` |
| Admin login session | Signed cookie in the browser | No session table — see `lib/admin-auth.ts` |
| Visitor browsing history | `localStorage` in the visitor's browser | Unrelated to Supabase — unchanged from the original static site |

## 7. Extending this later

- **Multiple admin accounts / password reset** → swap `lib/admin-auth.ts` +
  the login route for real Supabase Auth (email/password or magic link).
- **Soft-delete history** → the DELETE route in
  `app/api/admin/products/[id]/route.ts` currently hard-deletes; there's a
  comment there showing the one-line change to make it a soft "off-shelf"
  instead.
- **New product fields** → add a column to `products` in Supabase, then add
  the matching input to `components/admin/ProductForm.tsx` and to the
  `Product`/`ProductInput` types in `lib/types.ts`. Anything that doesn't need
  its own column (most spec-sheet-style attributes) can just go in the
  existing free-form `specs` JSON instead — no schema change at all.
