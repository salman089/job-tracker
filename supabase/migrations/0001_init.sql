-- Job & CV Application Tracker — initial schema, RLS, storage, triggers.
-- See architecture blueprint for rationale (AAL2-gated RLS, EXISTS-join for interviews).

create type job_status as enum ('wishlist', 'applied', 'interviewing', 'offer', 'rejected');

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  status job_status not null default 'wishlist',
  salary_min int,
  salary_max int,
  currency text default 'USD',
  jd_text text,
  extracted_skills jsonb default '[]',
  cv_url text,
  board_order double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  round_type text not null,
  scheduled_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index jobs_user_id_idx on public.jobs(user_id);
create index jobs_user_id_status_idx on public.jobs(user_id, status);
create index interviews_job_id_idx on public.interviews(job_id);

-- updated_at trigger

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row
  execute function public.set_updated_at();

-- Row Level Security — gated on AAL2 (TOTP-verified session). A password/Google
-- session that has not completed the TOTP challenge cannot read or write data,
-- enforced in Postgres so no client-side check can be bypassed.

alter table public.jobs enable row level security;
alter table public.interviews enable row level security;

create policy jobs_select on public.jobs
  for select
  using (auth.uid() = user_id and (select auth.jwt()->>'aal') = 'aal2');

create policy jobs_insert on public.jobs
  for insert
  with check (auth.uid() = user_id and (select auth.jwt()->>'aal') = 'aal2');

create policy jobs_update on public.jobs
  for update
  using (auth.uid() = user_id and (select auth.jwt()->>'aal') = 'aal2')
  with check (auth.uid() = user_id and (select auth.jwt()->>'aal') = 'aal2');

create policy jobs_delete on public.jobs
  for delete
  using (auth.uid() = user_id and (select auth.jwt()->>'aal') = 'aal2');

create policy interviews_select on public.interviews
  for select
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = interviews.job_id
        and jobs.user_id = auth.uid()
    )
    and (select auth.jwt()->>'aal') = 'aal2'
  );

create policy interviews_insert on public.interviews
  for insert
  with check (
    exists (
      select 1 from public.jobs
      where jobs.id = interviews.job_id
        and jobs.user_id = auth.uid()
    )
    and (select auth.jwt()->>'aal') = 'aal2'
  );

create policy interviews_update on public.interviews
  for update
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = interviews.job_id
        and jobs.user_id = auth.uid()
    )
    and (select auth.jwt()->>'aal') = 'aal2'
  )
  with check (
    exists (
      select 1 from public.jobs
      where jobs.id = interviews.job_id
        and jobs.user_id = auth.uid()
    )
    and (select auth.jwt()->>'aal') = 'aal2'
  );

create policy interviews_delete on public.interviews
  for delete
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = interviews.job_id
        and jobs.user_id = auth.uid()
    )
    and (select auth.jwt()->>'aal') = 'aal2'
  );

-- Storage — private `cvs` bucket, one folder per user (folder name = user id)

insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

create policy cvs_select on storage.objects
  for select
  using (
    bucket_id = 'cvs'
    and (select auth.jwt()->>'aal') = 'aal2'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy cvs_insert on storage.objects
  for insert
  with check (
    bucket_id = 'cvs'
    and (select auth.jwt()->>'aal') = 'aal2'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy cvs_update on storage.objects
  for update
  using (
    bucket_id = 'cvs'
    and (select auth.jwt()->>'aal') = 'aal2'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy cvs_delete on storage.objects
  for delete
  using (
    bucket_id = 'cvs'
    and (select auth.jwt()->>'aal') = 'aal2'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
