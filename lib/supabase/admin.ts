import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client - bypasses RLS and the aal2 requirement on factor
 * management. Never import this from a Client Component. Used only by the
 * backup-code recovery flow to unenroll a lost TOTP factor on the user's
 * behalf, since a normal (aal1) session cannot remove its own factor.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are required for admin operations."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
