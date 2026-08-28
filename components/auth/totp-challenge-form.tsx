"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyTotpChallenge, type TotpVerifyState } from "@/lib/auth/mfa-actions";

const initialState: TotpVerifyState = {};

export function TotpChallengeForm() {
  const [state, formAction, pending] = useActionState(verifyTotpChallenge, initialState);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Two-factor verification
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            Authentication code
          </Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className="text-center font-mono text-lg tracking-[0.4em]"
            aria-invalid={Boolean(state.error)}
            required
          />
          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Verifying..." : "Verify"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Lost access to your authenticator?{" "}
        <Link href="/login/recover" className="text-primary hover:underline">
          Use a backup code
        </Link>
      </p>

    </div>
  );
}
