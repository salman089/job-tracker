import Link from "next/link";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/lib/types";

const STATUS_BORDER: Record<Job["status"], string> = {
  wishlist: "border-l-[var(--status-wishlist)]",
  applied: "border-l-[var(--status-applied)]",
  interviewing: "border-l-[var(--status-interviewing)]",
  offer: "border-l-[var(--status-offer)]",
  rejected: "border-l-[var(--status-rejected)]",
};

function daysAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export function JobCard({ job, style }: { job: Job; style?: React.CSSProperties }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      style={style}
      className={`group glass-surface card-interactive animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both block rounded-lg border-l-4 p-3 duration-500 ease-[var(--ease-spring)] hover:bg-white/5 ${STATUS_BORDER[job.status]} ${
        job.status === "rejected" ? "grayscale-[50%] hover:grayscale-0" : ""
      }`}
    >
      <h3 className="font-heading text-base text-foreground transition-colors group-hover:text-primary">
        {job.company}
      </h3>
      <p className="text-sm text-muted-foreground">{job.role}</p>

      {job.extracted_skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {job.extracted_skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" className="text-[10px]">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
        <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
          <CalendarIcon className="size-3" />
          Added {daysAgo(job.created_at)}
        </span>
        {job.salary_min && (
          <span className="font-mono text-[10px] text-muted-foreground">
            {job.currency} {job.salary_min.toLocaleString()}
            {job.salary_max ? `-${job.salary_max.toLocaleString()}` : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
