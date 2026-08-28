import { TotpEnrollFlow } from "@/components/auth/totp-enroll-flow";

export default function MfaEnrollPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="glass-surface rounded-xl p-6">
          <TotpEnrollFlow />
        </div>
      </div>
    </div>
  );
}
