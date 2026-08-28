import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobFormDialog } from "@/components/jobs/job-form-dialog";

export function AddJobButton({ className }: { className?: string }) {
  return (
    <JobFormDialog
      trigger={
        <Button className={className}>
          <PlusIcon />
          Add New Job
        </Button>
      }
    />
  );
}
