"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDisplayName, type DisplayNameFormState } from "@/lib/auth/actions";

const initialState: DisplayNameFormState = {};

export function DisplayNameForm({ currentName }: { currentName: string }) {
  const [state, formAction, pending] = useActionState(updateDisplayName, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Display name
        </Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          defaultValue={currentName}
          aria-invalid={Boolean(state.errors?.fullName)}
          className="max-w-xs"
          required
        />
        {state.errors?.fullName && (
          <p className="text-xs text-destructive">{state.errors.fullName[0]}</p>
        )}
      </div>
      {state.message && (
        <p className={`text-xs ${state.errors ? "text-destructive" : "text-muted-foreground"}`}>
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save name"}
      </Button>
    </form>
  );
}
