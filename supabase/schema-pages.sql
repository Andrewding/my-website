-- ============================================================
-- ThermalWear — "pages" table (editable static content)
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run.
-- This is an ADDITION to schema.sql — run schema.sql first if you
-- haven't already, then run this file.
-- ============================================================

create table if not exists public.pages (
  slug        text primary key,   -- "about" | "contact" | "shipping" | "return" | "privacy"
  title       text not null,
  -- Lightweight markdown: blank line = new paragraph, a line starting
  -- with "## " becomes a section heading. No other formatting is parsed —
  -- kept intentionally simple so the admin textarea stays simple too.
  content     text not null default '',
  updated_at  timestamptz not null default now()
);

create or replace function public.set_pages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_pages_updated_at on public.pages;
create trigger trg_pages_updated_at
  before update on public.pages
  for each row execute function public.set_pages_updated_at();

-- RLS: this content isn't sensitive (it's public marketing/legal copy),
-- so anon can read all rows. Only the service-role key (used in
-- app/api/admin/pages/** route handlers, after the admin-session check)
-- can write.
alter table public.pages enable row level security;

drop policy if exists "Public can read all pages" on public.pages;
create policy "Public can read all pages"
  on public.pages
  for select
  to anon
  using (true);

-- Seed the 5 pages with the current placeholder copy, so the site keeps
-- working immediately after this runs — edit any of it from /admin/pages.
insert into public.pages (slug, title, content) values
('about', 'About ThermalWear',
'[Brand introduction placeholder — replace with your real brand story: why the company started, the problem it solves, and what makes the product line different.]

ThermalWear designs heated massage wearables — belts, socks, and gloves — built around adjustable heat and on-demand vibration massage.'),

('contact', 'Contact Us',
'Questions about sizing, heat settings, warranty, or bulk orders? Send us a message.'),

('shipping', 'Shipping Policy',
'## Processing Time

[Placeholder] Orders are typically processed within 1–2 business days.

## Shipping Costs

[Placeholder] Shipping costs are calculated at checkout based on destination and weight.

## Customs & Import Duties

[Placeholder] International orders may be subject to customs fees charged by the destination country.'),

('return', 'Return & Refund Policy',
'## Return Window

[Placeholder] Items may be returned within 30 days of delivery, unused and in original packaging.

## Refunds

[Placeholder] Approved refunds are issued to the original payment method within 5–10 business days.

## Warranty & Defective Items

[Placeholder] Defective items may be replaced or refunded at our discretion.'),

('privacy', 'Privacy Policy',
'## Cookies & Local Storage

We use a cookie consent banner in line with EU ePrivacy / GDPR expectations. Browsing-history tracking only begins after you actively accept cookies, and is stored in your browser only — it is never sent to our server. You can clear it any time on the History page.

## Contact Form Data

[Placeholder] Data submitted via the contact form is used only to respond to your inquiry.

## Your Rights (GDPR / CCPA)

[Placeholder] Describe your process for access/correction/deletion requests here.')

on conflict (slug) do nothing;
