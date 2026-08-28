"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { disableTotp, regenerateBackupCodes } from "@/lib/auth/mfa-actions";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";

export function TotpPanel({ hasTotp }: { hasTotp: boolean }) {
  const router = useRouter();
  const [codes, setCodes] = React.useState<string[] | null>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  async function handleRegenerate() {
    setPending(true);
    setError(undefined);
    const result = await regenerateBackupCodes();
    setPending(false);
    if (result.error) setError(result.error);
    else setCodes(result.backupCodes ?? []);
  }

  async function handleDisable(
    _state: { error?: string },
    _formData: FormData
  ): Promise<{ error?: string }> {
    const result = await disableTotp();
    if (result.error) return { error: result.error };
    router.refresh();
    return {};
  }

  if (!hasTotp) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Two-factor authentication is off. Turn it on to require a code from
          an authenticator app at every sign-in.
        </p>
        <Button render={<Link href="/mfa/enroll" />} nativeButton={false} className="self-start">
          Enable two-factor authentication
        </Button>
      </div>
    );
  }

  if (codes) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Your old backup codes no longer work. Save these somewhere safe - they
          won&apos;t be shown again.
        </p>
        <div className="glass-surface grid grid-cols-2 gap-2 rounded-lg p-4 font-mono text-sm text-foreground">
          {codes.map((code) => (
            <span key={code}>{code}</span>
          ))}
        </div>
        <Button variant="outline" className="self-start" onClick={() => setCodes(null)}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        An authenticator app is enrolled and required at every sign-in.
      </p>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Backup codes let you sign in if you lose access to your authenticator.
          Regenerating invalidates any codes issued before.
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button variant="outline" className="self-start" onClick={handleRegenerate} disabled={pending}>
          {pending ? "Generating..." : "Regenerate backup codes"}
        </Button>
      </div>

      <div className="border-t border-white/10 pt-4">
        <ConfirmDeleteDialog
          title="Disable two-factor authentication?"
          description="You'll be able to sign in with just your password. Your backup codes will be deleted."
          confirmLabel="Disable"
          action={handleDisable}
          trigger={
            <Button variant="outline" className="border-destructive/40 text-destructive">
              Disable two-factor authentication
            </Button>
          }
        />
      </div>
    </div>
  );
}
