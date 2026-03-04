-- Home page settings editable via admin UI

create table if not exists public.home_settings (
  id uuid primary key default gen_random_uuid(),
  hero_title text not null default '歡迎來到我的作品集',
  hero_subtitle text not null default '用現代技術打造優雅且可靠的解決方案',

  cta_portfolio_text text not null default '查看作品',
  cta_about_text text not null default '關於我',
  cta_resume_text text not null default '履歷 PDF',
  cta_contact_text text not null default '聯絡我',

  skills_title text not null default '技能與專長',
  skills_description text not null default '探索我在前端、後端與更多領域的技術能力。',

  services_title text not null default '服務項目',
  services_description text not null default '看看我能如何把你的想法落地成產品。',

  portfolio_title text not null default '作品集',
  portfolio_description text not null default '查看我近期的專案與案例整理。',

  final_cta_title text not null default '準備開始一個專案？',
  final_cta_description text not null default '我隨時歡迎討論新專案與創意想法，我們一起做出很棒的作品。',
  final_cta_button_text text not null default '取得聯繫',

  updated_at timestamptz not null default now()
);

alter table public.home_settings enable row level security;

drop policy if exists "home_settings_public_read" on public.home_settings;
create policy "home_settings_public_read"
on public.home_settings
for select
using (true);

drop policy if exists "home_settings_admin_insert" on public.home_settings;
create policy "home_settings_admin_insert"
on public.home_settings
for insert
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "home_settings_admin_update" on public.home_settings;
create policy "home_settings_admin_update"
on public.home_settings
for update
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

-- Seed a single row if empty
insert into public.home_settings (
  hero_title,
  hero_subtitle,
  cta_portfolio_text,
  cta_about_text,
  cta_resume_text,
  cta_contact_text,
  skills_title,
  skills_description,
  services_title,
  services_description,
  portfolio_title,
  portfolio_description,
  final_cta_title,
  final_cta_description,
  final_cta_button_text
)
select
  '歡迎來到我的作品集',
  '用現代技術打造優雅且可靠的解決方案',
  '查看作品',
  '關於我',
  '履歷 PDF',
  '聯絡我',
  '技能與專長',
  '探索我在前端、後端與更多領域的技術能力。',
  '服務項目',
  '看看我能如何把你的想法落地成產品。',
  '作品集',
  '查看我近期的專案與案例整理。',
  '準備開始一個專案？',
  '我隨時歡迎討論新專案與創意想法，我們一起做出很棒的作品。',
  '取得聯繫'
where not exists (select 1 from public.home_settings);
