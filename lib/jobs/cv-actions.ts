"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export interface CvActionState {
  error?: string;
}

export async function uploadCv(
  jobId: string,
  _prevState: CvActionState,
  formData: FormData
): Promise<CvActionState> {
  const file = formData.get("cv");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file first." };
  }
  if (file.type !== "application/pdf") {
    return { error: "Only PDF files are supported." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "File must be under 5MB." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Session expired - please sign in again." };
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("cv_url")
    .eq("id", jobId)
    .single();

  const path = `${userData.user.id}/${jobId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("cvs").upload(path, file);
  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({ cv_url: path })
    .eq("id", jobId);
  if (updateError) {
    // Uploaded but couldn't link it to the job - clean up the orphaned file.
    await supabase.storage.from("cvs").remove([path]);
    return { error: updateError.message };
  }

  if (job?.cv_url) {
    await supabase.storage.from("cvs").remove([job.cv_url]);
  }

  revalidatePath(`/jobs/${jobId}`);
  return {};
}

export async function deleteCv(
  jobId: string,
  cvPath: string,
  _prevState: CvActionState,
  _formData: FormData
): Promise<CvActionState> {
  const supabase = await createClient();
  await supabase.storage.from("cvs").remove([cvPath]);

  const { error } = await supabase.from("jobs").update({ cv_url: null }).eq("id", jobId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/jobs/${jobId}`);
  return {};
}

export async function getCvSignedUrl(cvPath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("cvs")
    .createSignedUrl(cvPath, 60 * 5);

  if (error) return null;
  return data.signedUrl;
}
