"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications/create";
import { INTERVIEW_ROUND_LABELS, type InterviewFormState, type InterviewRoundType } from "@/lib/types";

function validate(formData: FormData): InterviewFormState["errors"] {
  const errors: NonNullable<InterviewFormState["errors"]> = {};
  const roundType = String(formData.get("round_type") ?? "");
  const scheduledAt = String(formData.get("scheduled_at") ?? "");

  if (!roundType) errors.round_type = ["Round type is required."];
  if (scheduledAt && new Date(scheduledAt).getTime() < Date.now()) {
    errors.scheduled_at = ["Date must be in the future."];
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
}

export async function createInterview(
  _prevState: InterviewFormState,
  formData: FormData
): Promise<InterviewFormState> {
  const errors = validate(formData);
  if (errors) return { errors };

  const jobId = String(formData.get("job_id") ?? "");
  const roundType = String(formData.get("round_type")) as InterviewRoundType;
  const scheduledAt = String(formData.get("scheduled_at") ?? "") || null;
  const supabase = await createClient();
  const { error } = await supabase.from("interviews").insert({
    job_id: jobId,
    round_type: roundType,
    scheduled_at: scheduledAt,
    notes: String(formData.get("notes") ?? "") || null,
  });

  if (error) return { message: error.message };

  const { data: job } = await supabase
    .from("jobs")
    .select("company, user_id")
    .eq("id", jobId)
    .single();

  if (job) {
    await createNotification({
      userId: job.user_id,
      type: "interview_scheduled",
      title: `Interview scheduled: ${INTERVIEW_ROUND_LABELS[roundType]}`,
      body: scheduledAt
        ? `${job.company} - ${new Date(scheduledAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`
        : job.company,
      jobId,
    });
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
  return { message: "Interview added." };
}

export async function updateInterview(
  interviewId: string,
  _prevState: InterviewFormState,
  formData: FormData
): Promise<InterviewFormState> {
  const errors = validate(formData);
  if (errors) return { errors };

  const jobId = String(formData.get("job_id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase
    .from("interviews")
    .update({
      round_type: String(formData.get("round_type")) as InterviewRoundType,
      scheduled_at: String(formData.get("scheduled_at") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
    })
    .eq("id", interviewId);

  if (error) return { message: error.message };

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
  return { message: "Interview updated." };
}

export async function deleteInterview(
  interviewId: string,
  jobId: string,
  _prevState: { error?: string },
  _formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("interviews").delete().eq("id", interviewId);

  if (error) return { error: error.message };

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
  return {};
}
