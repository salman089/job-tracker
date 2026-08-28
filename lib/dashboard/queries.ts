import { createClient } from "@/lib/supabase/server";
import type { Job, JobStatus } from "@/lib/types";

export interface DashboardStats {
  totalApplications: number;
  interviewsScheduled: number;
  awaitingResponse: number;
  offers: number;
}

export interface UpcomingInterview {
  id: string;
  scheduled_at: string;
  round_type: string;
  company: string;
}

export interface DayCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [{ count: totalApplications }, { count: awaitingResponse }, { count: offers }, { count: interviewsScheduled }] =
    await Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "applied" satisfies JobStatus),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "offer" satisfies JobStatus),
      supabase
        .from("interviews")
        .select("*", { count: "exact", head: true })
        .gte("scheduled_at", new Date().toISOString()),
    ]);

  return {
    totalApplications: totalApplications ?? 0,
    interviewsScheduled: interviewsScheduled ?? 0,
    awaitingResponse: awaitingResponse ?? 0,
    offers: offers ?? 0,
  };
}

export async function getUpcomingInterviews(): Promise<UpcomingInterview[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("interviews")
    .select("id, scheduled_at, round_type, jobs(company)")
    .not("scheduled_at", "is", null)
    .order("scheduled_at", { ascending: true });

  if (!data) return [];

  return data
    .filter((row): row is typeof row & { scheduled_at: string } => Boolean(row.scheduled_at))
    .map((row) => ({
      id: row.id,
      scheduled_at: row.scheduled_at,
      round_type: row.round_type,
      company: (row.jobs as unknown as { company: string } | null)?.company ?? "Unknown",
    }));
}

export interface StaleJob {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  updated_at: string;
}

/**
 * Jobs stuck in "applied" or "interviewing" with no status change in
 * `days` — a proxy for "needs a follow-up." Doesn't account for notes or
 * interviews added since the last status change (those don't touch
 * jobs.updated_at), just the job record itself.
 */
export async function getStaleJobs(days = 14): Promise<StaleJob[]> {
  const supabase = await createClient();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const { data } = await supabase
    .from("jobs")
    .select("id, company, role, status, updated_at")
    .in("status", ["applied", "interviewing"] satisfies JobStatus[])
    .lt("updated_at", cutoff.toISOString())
    .order("updated_at", { ascending: true });

  return (data as StaleJob[]) ?? [];
}

export async function getRecentJobs(limit = 5): Promise<Job[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as Job[]) ?? [];
}

export async function getApplicationsByDay(days = 7): Promise<DayCount[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("jobs")
    .select("created_at")
    .gte("created_at", since.toISOString());

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of data ?? []) {
    const key = new Date(row.created_at).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}
