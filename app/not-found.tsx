import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <span className="flex size-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <CompassIcon className="size-8" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="font-heading text-6xl font-bold tracking-tight text-foreground">
          404
        </p>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          This page drifted off your roadmap
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />} nativeButton={false}>Back to Dashboard</Button>
    </div>
  );
}
