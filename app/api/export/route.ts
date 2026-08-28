import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [{ data: jobs }, { data: interviews }, { data: notes }] = await Promise.all([
    supabase.from("jobs").select("*").order("created_at", { ascending: true }),
    supabase.from("interviews").select("*").order("created_at", { ascending: true }),
    supabase.from("job_notes").select("*").order("created_at", { ascending: true }),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    account_email: userData.user.email,
    jobs: jobs ?? [],
    interviews: interviews ?? [],
    notes: notes ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="jobbase-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
