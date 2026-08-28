import { createClient } from "@/lib/supabase/server";

export interface SoonInterview {
  id: string;
  job_id: string;
  scheduled_at: string;
  round_type: string;
  company: string;
}

/**
 * Interviews scheduled between now and `hoursAhead` from now - the reminder
 * window shown in the app-wide notification banner. Deliberately separate
 * from the dashboard's getUpcomingInterviews, which also includes past
 * interviews (it feeds the calendar's marked-date dots, not a reminder).
 */
export async function getSoonInterviews(hoursAhead = 48): Promise<SoonInterview[]> {
  const supabase = await createClient();
  const now = new Date();
  const cutoff = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

  const { data } = await supabase
    .from("interviews")
    .select("id, job_id, scheduled_at, round_type, jobs(company)")
    .not("scheduled_at", "is", null)
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", cutoff.toISOString())
    .order("scheduled_at", { ascending: true });

  if (!data) return [];

  return data
    .filter((row): row is typeof row & { scheduled_at: string } => Boolean(row.scheduled_at))
    .map((row) => ({
      id: row.id,
      job_id: row.job_id,
      scheduled_at: row.scheduled_at,
      round_type: row.round_type,
      company: (row.jobs as unknown as { company: string } | null)?.company ?? "Unknown",
    }));
}
