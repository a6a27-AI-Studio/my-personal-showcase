-- Message thread support: admin reply + soft delete metadata
alter table if exists public.messages
  add column if not exists admin_reply text,
  add column if not exists replied_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid;
