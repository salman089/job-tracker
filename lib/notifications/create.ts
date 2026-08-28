import { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/lib/types";

/**
 * Internal helper for logging an inbox notification — called from other
 * server actions (job/interview create + status change), never directly
 * from the client. Deliberately not a "use server" export.
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  jobId?: string | null;
}) {
  const supabase = await createClient();
  await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    job_id: params.jobId ?? null,
  });
}
