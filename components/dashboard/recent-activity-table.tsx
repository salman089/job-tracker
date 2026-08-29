import Link from "next/link";
import { JOB_STATUS_LABELS, type Job } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function RecentActivityTable({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="glass-surface rounded-2xl p-6 text-center text-sm text-muted-foreground">
        No applications yet. Add your first one to see activity here.
      </div>
    );
  }

  return (
    <div className="glass-surface overflow-hidden rounded-2xl">
      <p className="p-4 pb-0 font-heading text-sm font-semibold text-foreground">
        Recent activity
      </p>
      <div className="scrollbar-hide overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="px-4 py-3 font-normal">Company</th>
              <th className="px-4 py-3 font-normal">Role</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Date</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-white/5">
                <td className="px-4 py-3">
                  <Link href={`/jobs/${job.id}`} className="font-medium text-foreground hover:text-primary">
                    {job.company}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{job.role}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-[10px]">
                    {JOB_STATUS_LABELS[job.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {formatDate(job.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
