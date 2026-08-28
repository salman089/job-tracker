"use client";

import * as React from "react";
import { useActionState } from "react";
import { TriangleAlertIcon } from "lucide-react";
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

interface ConfirmDeleteDialogProps {
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  /** Server action bound to the record id, e.g. `deleteJob.bind(null, job.id)`. */
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  trigger: React.ReactNode;
}

/**
 * Destructive confirmation for deleting a Job or an Interview - neither had
 * a screen in the Stitch manifest, so this is hand-coded against the same
 * Level 2 glass-modal tokens as the rest of the app.
 */
export function ConfirmDeleteDialog({
  title,
  description,
  confirmLabel = "Delete",
  action,
  trigger,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(action, {});
  const wasPending = React.useRef(false);

  React.useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="glass-surface-elevated sm:max-w-sm" showCloseButton={false}>
        <DialogHeader className="flex-row items-start gap-3 space-y-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
            <TriangleAlertIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <DialogTitle className="font-heading">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>

        {state.error && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}

        <form action={formAction}>
          <DialogFooter className="glass-surface-elevated -mx-4 -mb-4 rounded-b-xl border-t border-white/10 bg-transparent p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-destructive-solid text-destructive-solid-foreground hover:bg-destructive-solid/90"
              disabled={pending}
            >
              {pending ? "Deleting..." : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
