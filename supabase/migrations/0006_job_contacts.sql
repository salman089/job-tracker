-- Recruiter/hiring-manager contacts per job. Same ownership + optional-MFA
-- gate pattern as `job_notes` and `interviews` (EXISTS-join via jobs.user_id,
-- restrictive aal2 gate through the SECURITY DEFINER helper from 0004).

create table public.job_contacts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  linkedin_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index job_contacts_job_id_idx on public.job_contacts(job_id);

alter table public.job_contacts enable row level security;

create policy job_contacts_select on public.job_contacts
  for select
  using (exists (select 1 from public.jobs where jobs.id = job_contacts.job_id and jobs.user_id = auth.uid()));

create policy job_contacts_insert on public.job_contacts
  for insert
  with check (exists (select 1 from public.jobs where jobs.id = job_contacts.job_id and jobs.user_id = auth.uid()));

create policy job_contacts_update on public.job_contacts
  for update
  using (exists (select 1 from public.jobs where jobs.id = job_contacts.job_id and jobs.user_id = auth.uid()))
  with check (exists (select 1 from public.jobs where jobs.id = job_contacts.job_id and jobs.user_id = auth.uid()));

create policy job_contacts_delete on public.job_contacts
  for delete
  using (exists (select 1 from public.jobs where jobs.id = job_contacts.job_id and jobs.user_id = auth.uid()));

create policy job_contacts_aal_gate on public.job_contacts
  as restrictive
  for all
  using (
    not public.user_has_verified_totp(auth.uid())
    or (select auth.jwt()->>'aal') = 'aal2'
  );
