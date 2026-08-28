"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthFormState {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
}

export interface DisplayNameFormState {
  errors?: {
    fullName?: string[];
  };
  message?: string;
}

async function getOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return `${proto}://${host}`;
}

function validateEmail(email: FormDataEntryValue | null): string[] | undefined {
  const value = String(email ?? "").trim();
  if (!value) return ["Email is required."];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return ["Enter a valid email."];
  return undefined;
}

function validatePassword(password: FormDataEntryValue | null): string[] | undefined {
  const value = String(password ?? "");
  if (value.length < 8) return ["Password must be at least 8 characters."];
  return undefined;
}

export async function signInWithPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  const emailErrors = validateEmail(email);
  if (emailErrors || !password) {
    return { errors: { email: emailErrors, password: password ? undefined : ["Password is required."] } };
  }

  const supabase = await createClient();
  const captchaToken = String(formData.get("captchaToken") ?? "") || undefined;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email),
    password: String(password),
    options: { captchaToken },
  });

  if (error) {
    return { message: error.message };
  }

  const factors = data.user.factors ?? [];
  const hasVerifiedTotp = factors.some(
    (f) => f.factor_type === "totp" && f.status === "verified"
  );

  // TOTP is opt-in (enrolled from Settings) - only users who've enrolled a
  // factor are routed through the challenge; everyone else goes straight in.
  redirect(hasVerifiedTotp ? "/login/verify" : "/dashboard");
}

export async function signUpWithPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  const emailErrors = validateEmail(email);
  const passwordErrors = validatePassword(password);
  if (emailErrors || passwordErrors) {
    return { errors: { email: emailErrors, password: passwordErrors } };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const captchaToken = String(formData.get("captchaToken") ?? "") || undefined;
  const { error } = await supabase.auth.signUp({
    email: String(email),
    password: String(password),
    options: { emailRedirectTo: `${origin}/auth/callback`, captchaToken },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { errors: { email: ["An account with this email already exists."] } };
    }
    return { message: error.message };
  }

  // TOTP is opt-in - new accounts land straight on the dashboard and can
  // enroll a factor later from Settings if they want it.
  redirect("/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email");
  const emailErrors = validateEmail(email);
  if (emailErrors) {
    return { errors: { email: emailErrors } };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  await supabase.auth.resetPasswordForEmail(String(email), {
    redirectTo: `${origin}/reset-password`,
  });

  // Always return the same message, whether or not the email exists, so
  // this can't be used to enumerate accounts.
  return { message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = formData.get("password");
  const passwordErrors = validatePassword(password);
  if (passwordErrors) {
    return { errors: { password: passwordErrors } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: String(password) });

  if (error) {
    return { message: error.message };
  }

  redirect("/dashboard");
}

export async function updateDisplayName(
  _prevState: DisplayNameFormState,
  formData: FormData
): Promise<DisplayNameFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) return { errors: { fullName: ["Name is required."] } };
  if (fullName.length > 80) return { errors: { fullName: ["Keep it under 80 characters."] } };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });

  if (error) return { message: error.message };

  revalidatePath("/", "layout");
  return { message: "Display name updated." };
}

/**
 * Deletes the account outright - jobs/interviews/notes/backup-codes cascade
 * from the auth.users FK, but storage objects (CV uploads) don't, so those
 * are removed explicitly first via the admin client before the user row goes.
 */
export async function deleteAccount(
  _prevState: { error?: string },
  _formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Session expired - please sign in again." };
  const userId = userData.user.id;

  const admin = createAdminClient();

  // CV objects live two levels deep (userId/jobId/filename - see uploadCv),
  // so list() on the user prefix returns job subfolders, not files: recurse
  // one level to collect actual object paths before removing them.
  const { data: jobFolders } = await admin.storage.from("cvs").list(userId);
  const filePaths: string[] = [];
  for (const folder of jobFolders ?? []) {
    const { data: files } = await admin.storage.from("cvs").list(`${userId}/${folder.name}`);
    for (const file of files ?? []) {
      filePaths.push(`${userId}/${folder.name}/${file.name}`);
    }
  }
  if (filePaths.length > 0) {
    await admin.storage.from("cvs").remove(filePaths);
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect("/login");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
