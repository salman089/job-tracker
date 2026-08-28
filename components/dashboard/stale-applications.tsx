import Link from "next/link";
import { AlarmClockIcon } from "lucide-react";
import { JOB_STATUS_LABELS } from "@/lib/types";
import type { StaleJob } from "@/lib/dashboard/queries";

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function StaleApplications({ jobs }: { jobs: StaleJob[] }) {
  if (jobs.length === 0) return null;

  return (
    <div className="glass-surface flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <AlarmClockIcon className="size-4 text-primary" />
        <p className="font-heading text-sm font-semibold text-foreground">Needs a follow-up</p>
      </div>
      <div className="flex flex-col gap-2">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="card-interactive flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm hover:bg-primary/10"
          >
            <span className="min-w-0 truncate">
              <span className="font-medium text-foreground">{job.company}</span>{" "}
              <span className="text-muted-foreground">- {job.role}</span>
            </span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              {JOB_STATUS_LABELS[job.status]}, {daysSince(job.updated_at)}d quiet
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
