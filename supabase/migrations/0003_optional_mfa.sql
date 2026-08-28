-- Make TOTP optional: a user who never enrolls a factor can use the app at
-- aal1. A user who HAS enrolled one must still complete the aal2 challenge —
-- enrolling isn't a decoration, it's a commitment. Uses Supabase's documented
-- pattern (restrictive policy gating on live factor count) instead of the
-- previous blanket "aal2 required" clause baked into every ownership policy.

-- jobs — drop the aal2 clause from the ownership policies, keep ownership only
drop policy if exists jobs_select on public.jobs;
drop policy if exists jobs_insert on public.jobs;
drop policy if exists jobs_update on public.jobs;
drop policy if exists jobs_delete on public.jobs;

create policy jobs_select on public.jobs
  for select
  using (auth.uid() = user_id);

create policy jobs_insert on public.jobs
  for insert
  with check (auth.uid() = user_id);

create policy jobs_update on public.jobs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy jobs_delete on public.jobs
  for delete
  using (auth.uid() = user_id);

create policy jobs_aal_gate on public.jobs
  as restrictive
  for all
  using (
    array[(select auth.jwt()->>'aal')] <@ (
      select case when count(id) > 0 then array['aal2'] else array['aal1', 'aal2'] end
      from auth.mfa_factors
      where auth.mfa_factors.user_id = auth.uid() and status = 'verified'
    )
  );

-- interviews — same split: ownership via EXISTS join, AAL gate separate
drop policy if exists interviews_select on public.interviews;
drop policy if exists interviews_insert on public.interviews;
drop policy if exists interviews_update on public.interviews;
drop policy if exists interviews_delete on public.interviews;

create policy interviews_select on public.interviews
  for select
  using (exists (select 1 from public.jobs where jobs.id = interviews.job_id and jobs.user_id = auth.uid()));

create policy interviews_insert on public.interviews
  for insert
  with check (exists (select 1 from public.jobs where jobs.id = interviews.job_id and jobs.user_id = auth.uid()));

create policy interviews_update on public.interviews
  for update
  using (exists (select 1 from public.jobs where jobs.id = interviews.job_id and jobs.user_id = auth.uid()))
  with check (exists (select 1 from public.jobs where jobs.id = interviews.job_id and jobs.user_id = auth.uid()));

create policy interviews_delete on public.interviews
  for delete
  using (exists (select 1 from public.jobs where jobs.id = interviews.job_id and jobs.user_id = auth.uid()));

create policy interviews_aal_gate on public.interviews
  as restrictive
  for all
  using (
    array[(select auth.jwt()->>'aal')] <@ (
      select case when count(id) > 0 then array['aal2'] else array['aal1', 'aal2'] end
      from auth.mfa_factors
      where auth.mfa_factors.user_id = auth.uid() and status = 'verified'
    )
  );

-- storage (cvs bucket) — same split
drop policy if exists cvs_select on storage.objects;
drop policy if exists cvs_insert on storage.objects;
drop policy if exists cvs_update on storage.objects;
drop policy if exists cvs_delete on storage.objects;

create policy cvs_select on storage.objects
  for select
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy cvs_insert on storage.objects
  for insert
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy cvs_update on storage.objects
  for update
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy cvs_delete on storage.objects
  for delete
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy cvs_aal_gate on storage.objects
  as restrictive
  for all
  using (
    bucket_id != 'cvs'
    or array[(select auth.jwt()->>'aal')] <@ (
      select case when count(id) > 0 then array['aal2'] else array['aal1', 'aal2'] end
      from auth.mfa_factors
      where auth.mfa_factors.user_id = auth.uid() and status = 'verified'
    )
  );
