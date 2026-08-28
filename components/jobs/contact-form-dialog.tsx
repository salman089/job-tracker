"use client";

import * as React from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createContact, updateContact } from "@/lib/jobs/contacts-actions";
import type { Contact, ContactFormState } from "@/lib/types";

interface ContactFormDialogProps {
  jobId: string;
  contact?: Contact;
  trigger: React.ReactNode;
}

const initialState: ContactFormState = {};

export function ContactFormDialog({ jobId, contact, trigger }: ContactFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isEdit = Boolean(contact);
  const action = isEdit
    ? updateContact.bind(null, contact!.id, jobId)
    : createContact.bind(null, jobId);
  const [state, formAction, pending] = useActionState(action, initialState);

  React.useEffect(() => {
    if (state.message && !state.errors) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="glass-surface-elevated sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEdit ? "Edit Contact" : "Add Contact"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={contact?.name}
                aria-invalid={Boolean(state.errors?.name)}
                required
              />
              {state.errors?.name && (
                <p className="text-xs text-destructive">{state.errors.name[0]}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Role
              </Label>
              <Input id="role" name="role" placeholder="Recruiter" defaultValue={contact?.role ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={contact?.email ?? ""}
                aria-invalid={Boolean(state.errors?.email)}
              />
              {state.errors?.email && (
                <p className="text-xs text-destructive">{state.errors.email[0]}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Phone
              </Label>
              <Input id="phone" name="phone" type="tel" defaultValue={contact?.phone ?? ""} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="linkedin_url" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              LinkedIn URL
            </Label>
            <Input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              placeholder="https://linkedin.com/in/..."
              defaultValue={contact?.linkedin_url ?? ""}
              aria-invalid={Boolean(state.errors?.linkedin_url)}
            />
            {state.errors?.linkedin_url && (
              <p className="text-xs text-destructive">{state.errors.linkedin_url[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="How you know them, last contacted, follow-up plan..."
              defaultValue={contact?.notes ?? ""}
            />
          </div>

          {state.message && !state.errors && (
            <p className="text-xs text-muted-foreground">{state.message}</p>
          )}

          <DialogFooter className="glass-surface-elevated -mx-4 -mb-4 rounded-b-xl border-t border-white/10 bg-transparent p-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
