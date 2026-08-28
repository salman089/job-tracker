"use client";

import * as React from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INTERVIEW_ROUND_LABELS,
  INTERVIEW_ROUND_TYPES,
  type Interview,
  type InterviewFormState,
} from "@/lib/types";

interface InterviewFormDialogProps {
  jobId: string;
  interview?: Interview;
  action: (
    state: InterviewFormState,
    formData: FormData
  ) => Promise<InterviewFormState>;
  trigger: React.ReactNode;
}

/**
 * Add/Edit Interview - fills the gap left in the Stitch manifest (no
 * standalone interview screen was designed). Matches the JobBase
 * Professional tokens: Level 2 glass dialog, JetBrains Mono labels via the
 * shared Label component, inline field-level validation.
 */
export function InterviewFormDialog({
  jobId,
  interview,
  action,
  trigger,
}: InterviewFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(action, {});
  const isEdit = Boolean(interview);

  React.useEffect(() => {
    if (state.message && !state.errors) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="glass-surface-elevated sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEdit ? "Edit Interview" : "Add Interview"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this interview round."
              : "Schedule a new interview round for this application."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="job_id" value={jobId} />
          {interview && (
            <input type="hidden" name="interview_id" value={interview.id} />
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="round_type" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              Round Type
            </Label>
            <Select name="round_type" defaultValue={interview?.round_type}>
              <SelectTrigger
                id="round_type"
                aria-invalid={Boolean(state.errors?.round_type)}
                className="w-full"
              >
                <SelectValue placeholder="Select a round type">
                  {(value: string | null) =>
                    value ? INTERVIEW_ROUND_LABELS[value as keyof typeof INTERVIEW_ROUND_LABELS] : null
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_ROUND_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {INTERVIEW_ROUND_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.round_type && (
              <p className="text-xs text-destructive">
                {state.errors.round_type[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="scheduled_at" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              Scheduled Date &amp; Time
            </Label>
            <input
              id="scheduled_at"
              name="scheduled_at"
              type="datetime-local"
              defaultValue={interview?.scheduled_at?.slice(0, 16)}
              aria-invalid={Boolean(state.errors?.scheduled_at)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30"
            />
            {state.errors?.scheduled_at && (
              <p className="text-xs text-destructive">
                {state.errors.scheduled_at[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={interview?.notes ?? ""}
              placeholder="Interviewer, focus areas, prep notes..."
              aria-invalid={Boolean(state.errors?.notes)}
            />
            {state.errors?.notes && (
              <p className="text-xs text-destructive">{state.errors.notes[0]}</p>
            )}
          </div>

          {state.message && !state.errors && (
            <p className="text-xs text-muted-foreground">{state.message}</p>
          )}

          <DialogFooter className="glass-surface-elevated -mx-4 -mb-4 rounded-b-xl border-t border-white/10 bg-transparent p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Add Interview"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
