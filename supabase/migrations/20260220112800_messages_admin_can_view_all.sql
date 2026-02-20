-- Allow admins to view/manage all messages while normal users keep own-message access
alter table if exists public.messages enable row level security;

create policy "messages_select_own_or_admin"
on public.messages
for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  )
);

create policy "messages_insert_own_or_admin"
on public.messages
for insert
with check (
  auth.uid() = user_id
  or exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  )
);

create policy "messages_update_own_or_admin"
on public.messages
for update
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  )
);

create policy "messages_delete_own_or_admin"
on public.messages
for delete
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  )
);
