"use client";

import * as React from "react";
import { useActionState } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteAccount } from "@/lib/auth/actions";

export function DeleteAccountDialog({ email }: { email: string }) {
  const [open, setOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const [state, formAction, pending] = useActionState(deleteAccount, {});
  const canDelete = confirmText.trim() === email;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmText("");
      }}
    >
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            Delete account
          </Button>
        }
      />
      <DialogContent className="glass-surface-elevated sm:max-w-sm" showCloseButton={false}>
        <DialogHeader className="flex-row items-start gap-3 space-y-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
            <TriangleAlertIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <DialogTitle className="font-heading">Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently deletes your account, every job application, interview, note, and
              uploaded CV. This can&apos;t be undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-email" className="text-xs text-muted-foreground">
            Type <span className="font-medium text-foreground">{email}</span> to confirm
          </Label>
          <Input
            id="confirm-email"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>

        {state.error && <p className="text-xs text-destructive">{state.error}</p>}

        <form action={formAction}>
          <DialogFooter className="glass-surface-elevated -mx-4 -mb-4 rounded-b-xl border-t border-white/10 bg-transparent p-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || !canDelete}
              className="bg-destructive-solid text-destructive-solid-foreground hover:bg-destructive-solid/90"
            >
              {pending ? "Deleting..." : "Permanently delete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
