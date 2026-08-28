import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INTERVIEW_ROUND_LABELS, type InterviewRoundType } from "@/lib/types";

function escapeIcsText(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function toIcsDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: interview, error } = await supabase
    .from("interviews")
    .select("*, jobs(company, role)")
    .eq("id", id)
    .single();

  if (error || !interview || !interview.scheduled_at) {
    return NextResponse.json({ error: "Interview not found or not scheduled" }, { status: 404 });
  }

  const job = interview.jobs as unknown as { company: string; role: string } | null;
  const start = new Date(interview.scheduled_at);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const roundLabel =
    INTERVIEW_ROUND_LABELS[interview.round_type as InterviewRoundType] ?? interview.round_type;
  const summary = `${roundLabel} interview - ${job?.company ?? "Interview"}`;
  const description = [job?.role, interview.notes].filter(Boolean).join("\n\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JobBase//Interview//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${interview.id}@jobbase`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(start.toISOString())}`,
    `DTEND:${toIcsDate(end.toISOString())}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    description ? `DESCRIPTION:${escapeIcsText(description)}` : undefined,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => Boolean(line));

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="interview-${id}.ics"`,
    },
  });
}
