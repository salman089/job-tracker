"use server";

import { randomBytes, createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface TotpEnrollState {
  factorId: string;
  qrCode: string;
  secret: string;
}

export interface TotpVerifyState {
  error?: string;
  backupCodes?: string[];
}

/**
 * A backup code cannot itself raise a session to aal2 - that JWT claim is
 * only set by Supabase's own `mfa.verify` against an enrolled factor, and
 * there's no API to grant it from our own table. So a valid backup code
 * instead triggers a support-assisted reset: it unenrolls the user's lost
 * TOTP factor via the service-role admin API (the one operation that can
 * bypass the aal2 requirement a normal session can't get past), then sends
 * them to re-enroll a fresh authenticator at aal1.
 */

export async function enrollTotp(): Promise<TotpEnrollState | { error: string }> {
  const supabase = await createClient();

  // Clear out any unverified factor left over from a prior abandoned attempt
  // (or React Strict Mode double-invoking this in dev) - Supabase rejects a
  // second enroll with the same (blank) friendly name otherwise.
  const { data: existing } = await supabase.auth.mfa.listFactors();
  const stale =
    existing?.all.filter((f) => f.factor_type === "totp" && f.status === "unverified") ?? [];
  await Promise.all(
    stale.map((f) => supabase.auth.mfa.unenroll({ factorId: f.id }))
  );

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });

  if (error || !data) {
    return { error: error?.message ?? "Could not start TOTP enrollment." };
  }

  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

function generateBackupCodes(count = 10): { plaintext: string[]; hashed: string[] } {
  const plaintext: string[] = [];
  const hashed: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = randomBytes(5).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-");
    plaintext.push(code);
    hashed.push(createHash("sha256").update(code).digest("hex"));
  }

  return { plaintext, hashed };
}

async function issueBackupCodes(userId: string) {
  const supabase = await createClient();
  const { plaintext, hashed } = generateBackupCodes();

  await supabase
    .from("mfa_backup_codes")
    .insert(hashed.map((code_hash) => ({ user_id: userId, code_hash })));

  return plaintext;
}

export async function verifyTotpEnrollment(
  _prevState: TotpVerifyState,
  formData: FormData
): Promise<TotpVerifyState> {
  const factorId = String(formData.get("factor_id") ?? "");
  const code = String(formData.get("code") ?? "");

  if (!factorId || code.length !== 6) {
    return { error: "Enter the 6-digit code from your authenticator app." };
  }

  const supabase = await createClient();
  const { data: verifyData, error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });

  if (error || !verifyData) {
    return { error: error?.message ?? "That code didn't work - check the time on your device and try again." };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Session expired - please sign in again." };
  }

  const backupCodes = await issueBackupCodes(userData.user.id);
  return { backupCodes };
}

export async function verifyTotpChallenge(
  _prevState: TotpVerifyState,
  formData: FormData
): Promise<TotpVerifyState> {
  const code = String(formData.get("code") ?? "");
  if (code.length !== 6) {
    return { error: "Enter the 6-digit code from your authenticator app." };
  }

  const supabase = await createClient();
  const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
  if (factorsError || !factorsData) {
    return { error: "Could not load your authenticator." };
  }

  const totpFactor = factorsData.totp.find((f) => f.status === "verified");
  if (!totpFactor) {
    redirect("/mfa/enroll");
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: totpFactor.id,
    code,
  });

  if (error) {
    return { error: "That code didn't work - check the time on your device and try again." };
  }

  redirect("/dashboard");
}

export async function recoverWithBackupCode(
  _prevState: TotpVerifyState,
  formData: FormData
): Promise<TotpVerifyState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) {
    return { error: "Enter a backup code." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Session expired - please sign in again." };
  }
  const userId = userData.user.id;

  const codeHash = createHash("sha256").update(code).digest("hex");
  const { data: match } = await supabase
    .from("mfa_backup_codes")
    .select("id")
    .eq("user_id", userId)
    .eq("code_hash", codeHash)
    .is("used_at", null)
    .maybeSingle();

  if (!match) {
    return { error: "That backup code is invalid or already used." };
  }

  await supabase
    .from("mfa_backup_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", match.id);

  const admin = createAdminClient();
  const { data: factorsData } = await admin.auth.admin.mfa.listFactors({ userId });
  await Promise.all(
    (factorsData?.factors ?? [])
      .filter((f) => f.factor_type === "totp")
      .map((f) => admin.auth.admin.mfa.deleteFactor({ id: f.id, userId }))
  );

  // The lost factor is gone - remaining codes (used or not) belonged to it.
  await supabase.from("mfa_backup_codes").delete().eq("user_id", userId);

  redirect("/mfa/enroll");
}

export async function disableTotp(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Session expired - please sign in again." };
  }

  const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
  if (factorsError) {
    return { error: factorsError.message };
  }

  for (const factor of factorsData?.totp ?? []) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (error) return { error: error.message };
  }

  await supabase.from("mfa_backup_codes").delete().eq("user_id", userData.user.id);

  return {};
}

export async function regenerateBackupCodes(): Promise<TotpVerifyState> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Session expired - please sign in again." };
  }

  await supabase.from("mfa_backup_codes").delete().eq("user_id", userData.user.id);
  const backupCodes = await issueBackupCodes(userData.user.id);
  return { backupCodes };
}
