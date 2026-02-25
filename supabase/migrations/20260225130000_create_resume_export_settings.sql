-- Resume export settings for admin-controlled PDF output

create table if not exists public.resume_export_settings (
  id uuid primary key default gen_random_uuid(),
  show_header boolean not null default true,
  show_summary boolean not null default true,
  show_experiences boolean not null default true,
  show_skills boolean not null default true,
  show_projects boolean not null default true,
  show_contact boolean not null default true,
  show_email boolean not null default false,
  show_phone boolean not null default false,
  contact_email text,
  contact_phone text,
  updated_at timestamptz not null default now()
);

alter table public.resume_export_settings enable row level security;

drop policy if exists "resume_export_settings_public_read" on public.resume_export_settings;
create policy "resume_export_settings_public_read"
on public.resume_export_settings
for select
using (true);

drop policy if exists "resume_export_settings_admin_insert" on public.resume_export_settings;
create policy "resume_export_settings_admin_insert"
on public.resume_export_settings
for insert
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "resume_export_settings_admin_update" on public.resume_export_settings;
create policy "resume_export_settings_admin_update"
on public.resume_export_settings
for update
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

insert into public.resume_export_settings (
  show_header, show_summary, show_experiences, show_skills, show_projects, show_contact,
  show_email, show_phone, contact_email, contact_phone
)
select true, true, true, true, true, true, false, false, null, null
where not exists (select 1 from public.resume_export_settings);
