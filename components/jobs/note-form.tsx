"use client";

import * as React from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createNote } from "@/lib/jobs/notes-actions";
import type { NoteFormState } from "@/lib/types";

const initialState: NoteFormState = {};

export function NoteForm({ jobId }: { jobId: string }) {
  const action = createNote.bind(null, jobId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = React.useRef<HTMLFormElement>(null);
  const wasPending = React.useRef(false);

  React.useEffect(() => {
    if (wasPending.current && !pending && state.message && !state.errors) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <Textarea
        name="body"
        placeholder="Add a note - a call recap, a follow-up reminder, anything worth remembering..."
        rows={2}
        aria-invalid={Boolean(state.errors?.body)}
        required
      />
      {state.errors?.body && <p className="text-xs text-destructive">{state.errors.body[0]}</p>}
      <Button type="submit" size="sm" disabled={pending} className="self-end">
        {pending ? "Adding..." : "Add note"}
      </Button>
    </form>
  );
}
