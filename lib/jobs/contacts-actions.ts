"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ContactFormState } from "@/lib/types";

function validate(formData: FormData): ContactFormState["errors"] {
  const errors: NonNullable<ContactFormState["errors"]> = {};
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const linkedinUrl = String(formData.get("linkedin_url") ?? "").trim();

  if (!name) errors.name = ["Name is required."];
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["Enter a valid email."];
  }
  if (linkedinUrl && !/^https?:\/\//.test(linkedinUrl)) {
    errors.linkedin_url = ["Enter a full URL, starting with https://"];
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
}

export async function createContact(
  jobId: string,
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const errors = validate(formData);
  if (errors) return { errors };

  const supabase = await createClient();
  const { error } = await supabase.from("job_contacts").insert({
    job_id: jobId,
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    linkedin_url: String(formData.get("linkedin_url") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) return { message: error.message };

  revalidatePath(`/jobs/${jobId}`);
  return { message: "Contact added." };
}

export async function updateContact(
  contactId: string,
  jobId: string,
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const errors = validate(formData);
  if (errors) return { errors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("job_contacts")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      role: String(formData.get("role") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      linkedin_url: String(formData.get("linkedin_url") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", contactId);

  if (error) return { message: error.message };

  revalidatePath(`/jobs/${jobId}`);
  return { message: "Contact updated." };
}

export async function deleteContact(
  contactId: string,
  jobId: string,
  _prevState: { error?: string },
  _formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("job_contacts").delete().eq("id", contactId);

  if (error) return { error: error.message };

  revalidatePath(`/jobs/${jobId}`);
  return {};
}
