-- Create experiences table for timeline page + admin editor

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text not null,
  location text,
  start_date text not null,
  end_date text,
  is_current boolean not null default false,
  summary text not null,
  highlights text[] not null default array[]::text[],
  tech_stack text[] not null default array[]::text[],
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_experiences_sort_order on public.experiences(sort_order);

alter table public.experiences enable row level security;

drop policy if exists "experiences_public_read" on public.experiences;
create policy "experiences_public_read"
on public.experiences
for select
using (true);

drop policy if exists "experiences_admin_insert" on public.experiences;
create policy "experiences_admin_insert"
on public.experiences
for insert
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "experiences_admin_update" on public.experiences;
create policy "experiences_admin_update"
on public.experiences
for update
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "experiences_admin_delete" on public.experiences;
create policy "experiences_admin_delete"
on public.experiences
for delete
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

-- Seed initial real experience data if table is empty
insert into public.experiences (
  role, company, location, start_date, end_date, is_current, summary, highlights, tech_stack, sort_order
)
select * from (
  values
    (
      '軟體工程師',
      '欣河資訊',
      '新北市',
      '2021-09',
      null,
      true,
      '負責校務系統與相關模組開發，持續維護並處理跨單位需求協作。',
      array['校務流程開發與維運', '商業邏輯與資料流程整合']::text[],
      array['C#', '.NET', 'MS SQL']::text[],
      10
    ),
    (
      '軟體工程師',
      '全鼎科技股份有限公司',
      '台灣',
      '2019-11',
      '2021-09',
      false,
      '參與政府網站與系統建置，重視資安細節、需求溝通與可維運品質。',
      array['政府專案網站建置', '資安導向開發與測試', '跨團隊需求溝通']::text[],
      array['C#', '.NET', 'MS SQL', 'IIS']::text[],
      20
    ),
    (
      '軟體工程師',
      '三川科技有限公司',
      '台灣',
      '2019-07',
      '2019-10',
      false,
      '第一份軟體工程工作，從零基礎進入實務，快速建立 Web 開發能力。',
      array['台鐵與民航局 Web 維護', '完成從學習到實作的能力轉換']::text[],
      array['C#', 'MS SQL', 'jQuery', 'JavaScript', 'HTML', 'CSS']::text[],
      30
    ),
    (
      '煉油工廠管理',
      '聖福香',
      '台灣',
      '2012-10',
      '2019-06',
      false,
      '早期職涯累積現場管理與流程執行經驗，奠定後續轉職工程領域的問題解決能力。',
      array['現場流程管理', '跨角色協作']::text[],
      array['流程管理']::text[],
      40
    )
) as v(role, company, location, start_date, end_date, is_current, summary, highlights, tech_stack, sort_order)
where not exists (select 1 from public.experiences);
