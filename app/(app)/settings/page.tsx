import { DownloadIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { TotpPanel } from "@/components/settings/totp-panel";
import { DisplayNameForm } from "@/components/settings/display-name-form";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const factors = data.user?.factors ?? [];
  const hasTotp = factors.some((f) => f.factor_type === "totp" && f.status === "verified");
  const currentName =
    typeof data.user?.user_metadata?.full_name === "string"
      ? data.user.user_metadata.full_name
      : "";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 md:p-8">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Settings</h1>

      <section className="glass-surface flex flex-col gap-3 rounded-xl p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">Account</h2>
        <p className="text-sm text-muted-foreground">{data.user?.email}</p>
        <DisplayNameForm currentName={currentName} />
      </section>

      <section className="glass-surface flex flex-col gap-3 rounded-xl p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">Password</h2>
        <ChangePasswordForm />
      </section>

      <section className="glass-surface flex flex-col gap-3 rounded-xl p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Two-factor authentication
        </h2>
        <TotpPanel hasTotp={hasTotp} />
      </section>

      <section className="glass-surface flex flex-col gap-3 rounded-xl p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">Your data</h2>
        <p className="text-sm text-muted-foreground">
          Download every job, interview, and note as a JSON file.
        </p>
        <a href="/api/export" className={buttonVariants({ variant: "outline", className: "self-start" })}>
          <DownloadIcon />
          Export your data
        </a>
      </section>

      <section className="glass-surface flex flex-col gap-3 rounded-xl border-destructive/30 p-6">
        <h2 className="font-heading text-lg font-semibold text-destructive">Danger zone</h2>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and everything in it. This can&apos;t be undone.
        </p>
        <DeleteAccountDialog email={data.user?.email ?? ""} />
      </section>
    </div>
  );
}
