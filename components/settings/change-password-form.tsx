"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword, type AuthFormState } from "@/lib/auth/actions";

const initialState: AuthFormState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          New password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(state.errors?.password)}
          className="max-w-xs"
          required
        />
        {state.errors?.password && (
          <p className="text-xs text-destructive">{state.errors.password[0]}</p>
        )}
      </div>
      {state.message && !state.errors && (
        <p className="text-xs text-destructive">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
