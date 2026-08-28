"use client";

import { useEffect } from "react";
import Link from "next/link";
import { OctagonAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <span className="flex size-16 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <OctagonAlertIcon className="size-8" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred. You can try again, or head back to
          your dashboard.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => reset()}>Try Again</Button>
        <Button variant="outline" render={<Link href="/dashboard" />} nativeButton={false}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
