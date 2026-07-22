-- ============================================================
-- ThermalWear — Supabase schema
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run.
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ---------- products table ----------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  description    text not null default '',
  price          numeric(10,2) not null default 0,
  category       text not null,
  -- Free-form spec sheet, e.g. {"Material": "Neoprene", "Voltage": "5V"}.
  -- Kept as JSONB (not fixed columns) so you can add/remove spec fields
  -- from the admin UI without a migration.
  specs          jsonb not null default '{}'::jsonb,
  main_image     text,
  gallery_images text[] not null default '{}',
  status         text not null default 'active' check (status in ('active', 'inactive')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Keep updated_at current on every edit.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------
-- The public/storefront pages use the ANON key. The admin back office uses
-- the SERVICE ROLE key (from app/api/admin/** route handlers), which
-- bypasses RLS entirely — so no INSERT/UPDATE/DELETE policy is needed for
-- the anon role at all. Visitors can only ever read active products.
alter table public.products enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products
  for select
  to anon
  using (status = 'active');

-- ---------- Storage bucket for product photos ----------
-- Easiest to create the bucket itself from the dashboard (Storage → New
-- bucket → name it "product-images" → toggle "Public bucket" ON), but this
-- also creates it via SQL in case you prefer running everything from here.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Public read access to files in this bucket (needed so <img> tags on the
-- storefront can load them directly from the Supabase CDN URL).
drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'product-images');

-- No insert/update/delete storage policies are added for `anon` — uploads
-- happen server-side via the SERVICE ROLE key in
-- app/api/admin/upload/route.ts, which bypasses these policies too.
