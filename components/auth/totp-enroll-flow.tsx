"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  enrollTotp,
  verifyTotpEnrollment,
  type TotpEnrollState,
  type TotpVerifyState,
} from "@/lib/auth/mfa-actions";

const initialVerifyState: TotpVerifyState = {};

export function TotpEnrollFlow() {
  const router = useRouter();
  const [enroll, setEnroll] = React.useState<TotpEnrollState | { error: string } | null>(null);
  const [state, formAction, pending] = useActionState(verifyTotpEnrollment, initialVerifyState);
  const [acknowledged, setAcknowledged] = React.useState(false);
  const enrollStarted = React.useRef(false);

  React.useEffect(() => {
    if (enrollStarted.current) return;
    enrollStarted.current = true;
    enrollTotp().then(setEnroll);
  }, []);

  if (state.backupCodes) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Save your backup codes
          </h1>
          <p className="text-sm text-muted-foreground">
            Each code can be used once if you lose access to your authenticator.
            This is the only time they&apos;ll be shown.
          </p>
        </div>

        <div className="glass-surface grid grid-cols-2 gap-2 rounded-lg p-4 font-mono text-sm text-foreground">
          {state.backupCodes.map((code) => (
            <span key={code}>{code}</span>
          ))}
        </div>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5"
          />
          I&apos;ve saved these codes somewhere safe.
        </label>

        <Button
          disabled={!acknowledged}
          className="w-full"
          onClick={() => router.push("/dashboard")}
        >
          Continue to dashboard
        </Button>
      </div>
    );
  }

  if (!enroll) {
    return <p className="text-center text-sm text-muted-foreground">Setting up two-factor authentication...</p>;
  }

  if ("error" in enroll) {
    return <p className="text-center text-sm text-destructive">{enroll.error}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Set up two-factor authentication
        </h1>
        <p className="text-sm text-muted-foreground">
          Scan this QR code with your authenticator app (1Password, Authy, Google
          Authenticator).
        </p>
      </div>

      <img
        src={enroll.qrCode}
        alt="Scan with your authenticator app"
        className="mx-auto size-40 rounded-lg bg-white p-2"
      />

      <div className="flex flex-col gap-1 text-center">
        <p className="text-xs text-muted-foreground">Can&apos;t scan? Enter this code manually:</p>
        <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">
          {enroll.secret}
        </code>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="factor_id" value={enroll.factorId} />
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
          {pending ? "Verifying..." : "Verify and enable"}
        </Button>
      </form>
    </div>
  );
}
