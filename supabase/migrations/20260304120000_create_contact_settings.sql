-- Contact settings editable via admin UI

create table if not exists public.contact_settings (
  id uuid primary key default gen_random_uuid(),
  contact_title text not null default '取得聯繫',
  contact_description text not null default '我隨時歡迎討論新專案、創意想法或合作機會',
  email text not null default 'hello@example.com',
  phone text not null default '+1 (555) 123-4567',
  location text not null default 'San Francisco, CA',
  social_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.contact_settings enable row level security;

drop policy if exists "contact_settings_public_read" on public.contact_settings;
create policy "contact_settings_public_read"
on public.contact_settings
for select
using (true);

drop policy if exists "contact_settings_admin_insert" on public.contact_settings;
create policy "contact_settings_admin_insert"
on public.contact_settings
for insert
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "contact_settings_admin_update" on public.contact_settings;
create policy "contact_settings_admin_update"
on public.contact_settings
for update
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

-- Seed a single row if empty
insert into public.contact_settings (
  contact_title,
  contact_description,
  email,
  phone,
  location,
  social_links
)
select
  '取得聯繫',
  '我隨時歡迎討論新專案、創意想法或合作機會',
  'hello@example.com',
  '+1 (555) 123-4567',
  'San Francisco, CA',
  '[]'::jsonb
where not exists (select 1 from public.contact_settings);
