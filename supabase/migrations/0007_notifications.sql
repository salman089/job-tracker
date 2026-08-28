-- Inbox notifications: new applications, status changes, interviews
-- scheduled. Direct ownership (not the jobs EXISTS-join pattern) since a
-- notification can outlive its job (job_id is nullable, set null on
-- delete) — the notification itself still belongs to the user.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  job_id uuid references public.jobs(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_created_at_idx on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

create policy notifications_select on public.notifications
  for select
  using (auth.uid() = user_id);

create policy notifications_insert on public.notifications
  for insert
  with check (auth.uid() = user_id);

create policy notifications_update on public.notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy notifications_delete on public.notifications
  for delete
  using (auth.uid() = user_id);

create policy notifications_aal_gate on public.notifications
  as restrictive
  for all
  using (
    not public.user_has_verified_totp(auth.uid())
    or (select auth.jwt()->>'aal') = 'aal2'
  );
