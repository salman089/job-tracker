"use client";

import * as React from "react";
import Link from "next/link";
import { BellIcon, XIcon } from "lucide-react";
import { INTERVIEW_ROUND_LABELS, type InterviewRoundType } from "@/lib/types";
import type { SoonInterview } from "@/lib/interviews/queries";

function formatRelative(iso: string) {
  const diffHours = Math.round((new Date(iso).getTime() - Date.now()) / 3_600_000);
  if (diffHours <= 0) return "starting now";
  if (diffHours < 1) return "in under an hour";
  if (diffHours < 24) return `in ${diffHours}h`;
  const days = Math.round(diffHours / 24);
  return days === 1 ? "tomorrow" : `in ${days}d`;
}

function roundLabel(roundType: string) {
  return INTERVIEW_ROUND_LABELS[roundType as InterviewRoundType] ?? roundType;
}

export function InterviewReminderBanner({ interviews }: { interviews: SoonInterview[] }) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed || interviews.length === 0) return null;

  const [soonest, ...rest] = interviews;

  return (
    <div className="glass-surface mx-4 mt-3 flex shrink-0 items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 md:mx-6">
      <BellIcon className="size-4 shrink-0 text-primary" />
      <p className="min-w-0 flex-1 truncate text-sm">
        <Link href={`/jobs/${soonest.job_id}`} className="font-medium text-foreground hover:underline">
          {soonest.company}
        </Link>{" "}
        <span className="text-muted-foreground">
          {roundLabel(soonest.round_type)} interview {formatRelative(soonest.scheduled_at)}
        </span>
        {rest.length > 0 && (
          <span className="text-muted-foreground"> · {rest.length} more coming up</span>
        )}
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss reminder"
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}
