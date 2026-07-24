-- ============================================================
-- ThermalWear — "site_settings" table (site-wide editable settings,
-- e.g. the homepage hero banner image).
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run.
-- This is an ADDITION to schema.sql / schema-pages.sql — run those first
-- if you haven't already.
-- ============================================================

create table if not exists public.site_settings (
  id          int primary key default 1 check (id = 1),
  hero_image  text,
  updated_at  timestamptz not null default now()
);

create or replace function public.set_site_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_site_settings_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings
  for select
  to anon
  using (true);

insert into public.site_settings (id, hero_image) values (1, null)
on conflict (id) do nothing;
