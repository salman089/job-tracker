-- 0003's restrictive policies queried auth.mfa_factors directly from RLS,
-- but the `authenticated` role has no SELECT grant on that table — every
-- query hit "permission denied for table mfa_factors". Route the check
-- through a SECURITY DEFINER function instead: it runs with the privileges
-- of whoever creates it (the migration-running role, which does have
-- access to the auth schema), not the querying user's.

create or replace function public.user_has_verified_totp(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1 from auth.mfa_factors
    where user_id = target_user_id and status = 'verified'
  );
$$;

revoke all on function public.user_has_verified_totp(uuid) from public;
grant execute on function public.user_has_verified_totp(uuid) to authenticated;

drop policy if exists jobs_aal_gate on public.jobs;
create policy jobs_aal_gate on public.jobs
  as restrictive
  for all
  using (
    not public.user_has_verified_totp(auth.uid())
    or (select auth.jwt()->>'aal') = 'aal2'
  );

drop policy if exists interviews_aal_gate on public.interviews;
create policy interviews_aal_gate on public.interviews
  as restrictive
  for all
  using (
    not public.user_has_verified_totp(auth.uid())
    or (select auth.jwt()->>'aal') = 'aal2'
  );

drop policy if exists cvs_aal_gate on storage.objects;
create policy cvs_aal_gate on storage.objects
  as restrictive
  for all
  using (
    bucket_id != 'cvs'
    or not public.user_has_verified_totp(auth.uid())
    or (select auth.jwt()->>'aal') = 'aal2'
  );
