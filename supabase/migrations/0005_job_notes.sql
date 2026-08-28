-- Freeform notes / activity timeline per job. Same ownership + optional-MFA
-- gate pattern as `interviews` (EXISTS-join via jobs.user_id, restrictive
-- aal2 gate through the SECURITY DEFINER helper from 0004). Notes are
-- append/delete only — no update policy — since this is a timeline of
-- entries, not an editable document.

create table public.job_notes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index job_notes_job_id_idx on public.job_notes(job_id);

alter table public.job_notes enable row level security;

create policy job_notes_select on public.job_notes
  for select
  using (exists (select 1 from public.jobs where jobs.id = job_notes.job_id and jobs.user_id = auth.uid()));

create policy job_notes_insert on public.job_notes
  for insert
  with check (exists (select 1 from public.jobs where jobs.id = job_notes.job_id and jobs.user_id = auth.uid()));

create policy job_notes_delete on public.job_notes
  for delete
  using (exists (select 1 from public.jobs where jobs.id = job_notes.job_id and jobs.user_id = auth.uid()));

create policy job_notes_aal_gate on public.job_notes
  as restrictive
  for all
  using (
    not public.user_has_verified_totp(auth.uid())
    or (select auth.jwt()->>'aal') = 'aal2'
  );
