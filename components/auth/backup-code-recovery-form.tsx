"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recoverWithBackupCode, type TotpVerifyState } from "@/lib/auth/mfa-actions";

const initialState: TotpVerifyState = {};

export function BackupCodeRecoveryForm() {
  const [state, formAction, pending] = useActionState(recoverWithBackupCode, initialState);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Use a backup code
        </h1>
        <p className="text-sm text-muted-foreground">
          A valid code removes your current authenticator so you can enroll a
          new one. Your other backup codes will be replaced too.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            Backup code
          </Label>
          <Input
            id="code"
            name="code"
            placeholder="XXXXX-XXXXX"
            className="text-center font-mono uppercase"
            aria-invalid={Boolean(state.error)}
            required
          />
          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Verifying..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
