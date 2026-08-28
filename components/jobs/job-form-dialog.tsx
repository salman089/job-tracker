"use client";

import * as React from "react";
import { useActionState } from "react";
import { SparklesIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createJob, updateJob } from "@/lib/jobs/actions";
import { parseJobDescription } from "@/lib/jobs/parse-jd";
import {
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  type Job,
  type JdParseStatus,
  type JobFormState,
} from "@/lib/types";

interface JobFormDialogProps {
  job?: Job;
  defaultStatus?: Job["status"];
  trigger: React.ReactNode;
}

const initialState: JobFormState = {};

export function JobFormDialog({ job, defaultStatus, trigger }: JobFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isEdit = Boolean(job);
  const action = isEdit ? updateJob.bind(null, job!.id) : createJob;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [jdText, setJdText] = React.useState(job?.jd_text ?? "");
  const [skills, setSkills] = React.useState<string[]>(job?.extracted_skills ?? []);
  const [parseStatus, setParseStatus] = React.useState<JdParseStatus>(
    skills.length > 0 ? "parsed" : "idle"
  );
  const [parseError, setParseError] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (state.message && !state.errors) setOpen(false);
  }, [state]);

  async function handleParse() {
    setParseStatus("parsing");
    setParseError(undefined);
    const result = await parseJobDescription(jdText);
    if (result.status === "parsed") {
      setSkills(result.skills ?? []);
      setParseStatus("parsed");
    } else {
      setParseStatus("error");
      setParseError(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="glass-surface-elevated sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{isEdit ? "Edit Job" : "Add Job"}</DialogTitle>
        </DialogHeader>

        <form
          action={formAction}
          className="scrollbar-hide flex max-h-[70vh] flex-col gap-4 overflow-x-hidden overflow-y-auto pr-1"
        >
          <input type="hidden" name="extracted_skills" value={JSON.stringify(skills)} />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Company
              </Label>
              <Input
                id="company"
                name="company"
                defaultValue={job?.company}
                aria-invalid={Boolean(state.errors?.company)}
                required
              />
              {state.errors?.company && (
                <p className="text-xs text-destructive">{state.errors.company[0]}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Role
              </Label>
              <Input
                id="role"
                name="role"
                defaultValue={job?.role}
                aria-invalid={Boolean(state.errors?.role)}
                required
              />
              {state.errors?.role && (
                <p className="text-xs text-destructive">{state.errors.role[0]}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              Status
            </Label>
            <Select name="status" defaultValue={job?.status ?? defaultStatus ?? "wishlist"}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue>
                  {(value: string) => JOB_STATUS_LABELS[value as keyof typeof JOB_STATUS_LABELS]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {JOB_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {JOB_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="salary_min" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Salary Min
              </Label>
              <Input id="salary_min" name="salary_min" type="number" defaultValue={job?.salary_min ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="salary_max" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Salary Max
              </Label>
              <Input id="salary_max" name="salary_max" type="number" defaultValue={job?.salary_max ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currency" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Currency
              </Label>
              <Input id="currency" name="currency" defaultValue={job?.currency ?? "USD"} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jd_text" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              Job Description
            </Label>
            <Textarea
              id="jd_text"
              name="jd_text"
              rows={6}
              placeholder="Paste the job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={parseStatus === "parsing" || !jdText.trim()}
              onClick={handleParse}
              className="self-start"
            >
              <SparklesIcon />
              {parseStatus === "parsing" ? "Parsing..." : "Parse with AI"}
            </Button>

            {parseStatus === "error" && parseError && (
              <p className="text-xs text-destructive">{parseError}</p>
            )}

            {parseStatus === "parsed" && skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setSkills((s) => s.filter((x) => x !== skill))}
                      aria-label={`Remove ${skill}`}
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {state.message && !state.errors && (
            <p className="text-xs text-muted-foreground">{state.message}</p>
          )}

          <DialogFooter className="glass-surface-elevated -mx-4 -mb-4 rounded-b-xl border-t border-white/10 bg-transparent p-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Add Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
