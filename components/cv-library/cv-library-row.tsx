"use client";

import * as React from "react";
import Link from "next/link";
import { FileTextIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCvSignedUrl } from "@/lib/jobs/cv-actions";
import { JOB_STATUS_LABELS, type Job } from "@/lib/types";

function fileNameFromPath(path: string) {
  const last = path.split("/").pop() ?? path;
  return last.replace(/^\d+-/, "");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function CvLibraryRow({ job }: { job: Job }) {
  const [opening, setOpening] = React.useState(false);

  async function handleView() {
    if (!job.cv_url) return;
    setOpening(true);
    const url = await getCvSignedUrl(job.cv_url);
    setOpening(false);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!job.cv_url) return null;

  return (
    <div className="glass-surface card-interactive flex flex-col items-start gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={handleView}
        disabled={opening}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileTextIcon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">
            {opening ? "Opening..." : fileNameFromPath(job.cv_url)}
          </span>
          <span className="block font-mono text-[11px] text-muted-foreground">
            Uploaded {formatDate(job.updated_at)}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary">{JOB_STATUS_LABELS[job.status]}</Badge>
        <Link
          href={`/jobs/${job.id}`}
          className="text-xs font-medium text-primary hover:underline"
        >
          {job.company} - {job.role}
        </Link>
      </div>
    </div>
  );
}
