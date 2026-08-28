-- Backup/recovery codes for TOTP-enrolled accounts. Generated once at
-- enrollment (and on regenerate), shown once, stored hashed (sha-256).

create table public.mfa_backup_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index mfa_backup_codes_user_id_idx on public.mfa_backup_codes(user_id);

alter table public.mfa_backup_codes enable row level security;

-- Gated at aal1+ (not aal2): a backup code's whole purpose is logging in
-- when TOTP is unavailable, i.e. before the session has reached aal2.
create policy mfa_backup_codes_select on public.mfa_backup_codes
  for select
  using (auth.uid() = user_id);

create policy mfa_backup_codes_insert on public.mfa_backup_codes
  for insert
  with check (auth.uid() = user_id);

create policy mfa_backup_codes_delete on public.mfa_backup_codes
  for delete
  using (auth.uid() = user_id);

create policy mfa_backup_codes_update on public.mfa_backup_codes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
