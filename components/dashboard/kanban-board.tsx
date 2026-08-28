"use client";

import * as React from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { JOB_STATUSES, JOB_STATUS_LABELS, type Job, type JobStatus } from "@/lib/types";
import { JobCard } from "@/components/dashboard/job-card";
import { JobFormDialog } from "@/components/jobs/job-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateJobStatus } from "@/lib/jobs/actions";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";

const STATUS_DOT: Record<JobStatus, string> = {
  wishlist: "bg-[var(--status-wishlist)]",
  applied: "bg-[var(--status-applied)]",
  interviewing: "bg-[var(--status-interviewing)]",
  offer: "bg-[var(--status-offer)]",
  rejected: "bg-[var(--status-rejected)]",
};

function DraggableJobCard({ job, index }: { job: Job; index: number }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: job.id,
    data: { status: job.status },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`transition-opacity duration-150 ${isDragging ? "opacity-40" : ""}`}
    >
      <JobCard job={job} style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }} />
    </div>
  );
}

function KanbanColumn({ status, jobs }: { status: JobStatus; jobs: Job[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex h-full w-[86vw] shrink-0 snap-center flex-col sm:w-72 md:snap-align-none">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-[3px] ${STATUS_DOT[status]}`} />
          <h2 className="font-heading text-sm font-semibold text-foreground">
            {JOB_STATUS_LABELS[status]}
          </h2>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {jobs.length}
          </span>
        </div>
        <JobFormDialog
          defaultStatus={status}
          trigger={
            <Button variant="ghost" size="icon-xs" aria-label={`Add job to ${JOB_STATUS_LABELS[status]}`}>
              <PlusIcon className="size-3.5" />
            </Button>
          }
        />
      </div>

      <div
        ref={setNodeRef}
        className={`scrollbar-hide flex-1 space-y-3 overflow-y-auto rounded-lg p-1 pb-8 transition-colors ${
          isOver ? "bg-primary/5" : ""
        }`}
      >
        {jobs.map((job, index) => (
          <DraggableJobCard key={job.id} job={job} index={index} />
        ))}
        {jobs.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-muted-foreground">
            No jobs here yet
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ jobs: initialJobs }: { jobs: Job[] }) {
  const [jobs, setJobs] = React.useState(initialJobs);
  React.useEffect(() => setJobs(initialJobs), [initialJobs]);

  const [search, setSearch] = React.useState("");
  const query = search.trim().toLowerCase();
  const filteredJobs = query
    ? jobs.filter(
        (j) =>
          j.company.toLowerCase().includes(query) ||
          j.role.toLowerCase().includes(query) ||
          j.extracted_skills.some((skill) => skill.toLowerCase().includes(query))
      )
    : jobs;

  // Separate mouse/touch sensors (not the unified PointerSensor) so touch
  // gets its own forgiving activation constraint. Distance-based activation
  // on touch would hijack any scroll gesture on this horizontally- AND
  // vertically-scrollable board into starting a drag; a short press-and-hold
  // delay lets a normal touch-scroll pass through untouched.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const jobId = String(active.id);
    const newStatus = over.id as JobStatus;
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) return;

    const columnJobs = jobs.filter((j) => j.status === newStatus);
    const newOrder = columnJobs.length > 0 ? Math.max(...columnJobs.map((j) => j.board_order ?? 0)) + 1 : 0;

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus, board_order: newOrder } : j))
    );

    updateJobStatus(jobId, newStatus, newOrder);
  }

  if (jobs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="font-heading text-lg font-semibold text-foreground">
          No applications yet
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add your first job application to start tracking it through your pipeline.
        </p>
        <JobFormDialog trigger={<Button><PlusIcon />Add New Job</Button>} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-white/10 p-4 md:px-6 md:py-3">
        <div className="relative max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, or skill..."
            className="pl-9"
            aria-label="Search jobs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {query && filteredJobs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 p-8 text-center">
          <p className="text-sm font-medium text-foreground">No jobs match &ldquo;{search}&rdquo;</p>
          <p className="text-xs text-muted-foreground">Try a different company, role, or skill.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="scrollbar-hide flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto p-4 md:snap-none md:p-6">
            {JOB_STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                jobs={filteredJobs.filter((j) => j.status === status)}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
