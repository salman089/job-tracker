import { createClient } from "@/lib/supabase/server";
import type { AppNotification } from "@/lib/types";

export async function getNotifications(limit = 20): Promise<AppNotification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as AppNotification[]) ?? [];
}
