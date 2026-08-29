"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications/create";
import { JOB_STATUS_LABELS, type JobFormState, type JobStatus } from "@/lib/types";

function parseSkills(formData: FormData): string[] {
  const raw = formData.get("extracted_skills");
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  if (!value || String(value).trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function createJob(
  _prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const company = String(formData.get("company") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const status = (String(formData.get("status") ?? "wishlist") as JobStatus);

  const errors: JobFormState["errors"] = {};
  if (!company) errors.company = ["Company is required."];
  if (!role) errors.role = ["Role is required."];
  if (Object.keys(errors).length > 0) return { errors };

  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { message: "Session expired - please sign in again." };

  const { data: maxOrderRow } = await supabase
    .from("jobs")
    .select("board_order")
    .eq("status", status)
    .order("board_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxOrderRow?.board_order ?? -1) + 1;

  const { data: inserted, error } = await supabase
    .from("jobs")
    .insert({
      user_id: user.user.id,
      company,
      role,
      status,
      salary_min: parseOptionalInt(formData.get("salary_min")),
      salary_max: parseOptionalInt(formData.get("salary_max")),
      currency: String(formData.get("currency") ?? "USD"),
      jd_text: String(formData.get("jd_text") ?? "") || null,
      extracted_skills: parseSkills(formData),
      board_order: nextOrder,
    })
    .select("id")
    .single();

  if (error) return { message: error.message };

  await createNotification({
    userId: user.user.id,
    type: "job_created",
    title: "New application added",
    body: `${company} - ${role}`,
    jobId: inserted.id,
  });

  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
  return { message: "Job added." };
}

export async function updateJob(
  jobId: string,
  _prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const company = String(formData.get("company") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  const errors: JobFormState["errors"] = {};
  if (!company) errors.company = ["Company is required."];
  if (!role) errors.role = ["Role is required."];
  if (Object.keys(errors).length > 0) return { errors };

  const supabase = await createClient();
  const status = String(formData.get("status") ?? "wishlist") as JobStatus;

  const { data: existing } = await supabase
    .from("jobs")
    .select("status, user_id")
    .eq("id", jobId)
    .single();

  const { error } = await supabase
    .from("jobs")
    .update({
      company,
      role,
      status,
      salary_min: parseOptionalInt(formData.get("salary_min")),
      salary_max: parseOptionalInt(formData.get("salary_max")),
      currency: String(formData.get("currency") ?? "USD"),
      jd_text: String(formData.get("jd_text") ?? "") || null,
      extracted_skills: parseSkills(formData),
    })
    .eq("id", jobId);

  if (error) return { message: error.message };

  if (existing && existing.status !== status) {
    await createNotification({
      userId: existing.user_id,
      type: "status_changed",
      title: `${company} moved to ${JOB_STATUS_LABELS[status]}`,
      jobId,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
  revalidatePath(`/jobs/${jobId}`);
  return { message: "Job updated." };
}

export async function deleteJob(
  jobId: string,
  _prevState: { error?: string },
  _formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: job } = await supabase.from("jobs").select("cv_url").eq("id", jobId).single();
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);

  if (error) return { error: error.message };

  if (job?.cv_url) {
    await supabase.storage.from("cvs").remove([job.cv_url]);
  }

  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
  return {};
}

export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  boardOrder: number
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("jobs")
    .select("status, company, user_id")
    .eq("id", jobId)
    .single();

  const { error } = await supabase
    .from("jobs")
    .update({ status, board_order: boardOrder })
    .eq("id", jobId);

  if (error) return { error: error.message };

  if (existing && existing.status !== status) {
    await createNotification({
      userId: existing.user_id,
      type: "status_changed",
      title: `${existing.company} moved to ${JOB_STATUS_LABELS[status]}`,
      jobId,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
  return {};
}
