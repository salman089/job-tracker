import { createClient } from "@/lib/supabase/server";
import type { Contact, Job, JobNote } from "@/lib/types";

export async function getJobs(): Promise<Job[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("board_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load jobs: ${error.message}`);
  }

  return data as Job[];
}

export async function getJobsWithCv(): Promise<Job[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .not("cv_url", "is", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load CVs: ${error.message}`);
  }

  return data as Job[];
}

export async function getJob(id: string) {
  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !job) {
    return null;
  }

  const [{ data: interviews }, { data: notes }, { data: contacts }] = await Promise.all([
    supabase
      .from("interviews")
      .select("*")
      .eq("job_id", id)
      .order("scheduled_at", { ascending: true, nullsFirst: false }),
    supabase
      .from("job_notes")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("job_contacts")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: true }),
  ]);

  return {
    job: job as Job,
    interviews: interviews ?? [],
    notes: (notes as JobNote[]) ?? [],
    contacts: (contacts as Contact[]) ?? [],
  };
}
