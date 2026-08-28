"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { NoteFormState } from "@/lib/types";

export async function createNote(
  jobId: string,
  _prevState: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { errors: { body: ["Note can't be empty."] } };

  const supabase = await createClient();
  const { error } = await supabase.from("job_notes").insert({ job_id: jobId, body });

  if (error) return { message: error.message };

  revalidatePath(`/jobs/${jobId}`);
  return { message: "Note added." };
}

export async function deleteNote(
  noteId: string,
  jobId: string,
  _prevState: { error?: string },
  _formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("job_notes").delete().eq("id", noteId);

  if (error) return { error: error.message };

  revalidatePath(`/jobs/${jobId}`);
  return {};
}
