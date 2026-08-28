"use client";

import * as React from "react";
import { useActionState } from "react";
import { FileTextIcon, TrashIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { uploadCv, deleteCv, getCvSignedUrl, type CvActionState } from "@/lib/jobs/cv-actions";

const initialState: CvActionState = {};

function fileNameFromPath(path: string) {
  const last = path.split("/").pop() ?? path;
  // strip the `${timestamp}-` prefix we add on upload
  return last.replace(/^\d+-/, "");
}

export function CvUpload({ jobId, cvUrl }: { jobId: string; cvUrl: string | null }) {
  const uploadAction = uploadCv.bind(null, jobId);
  const [state, formAction, pending] = useActionState(uploadAction, initialState);
  const [opening, setOpening] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleView() {
    if (!cvUrl) return;
    setOpening(true);
    const url = await getCvSignedUrl(cvUrl);
    setOpening(false);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  if (cvUrl) {
    return (
      <div className="glass-surface flex items-center justify-between gap-3 rounded-lg p-3">
        <button
          type="button"
          onClick={handleView}
          disabled={opening}
          className="flex min-w-0 items-center gap-2 text-left text-sm text-foreground hover:text-primary"
        >
          <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{opening ? "Opening..." : fileNameFromPath(cvUrl)}</span>
        </button>
        <ConfirmDeleteDialog
          title="Remove this CV?"
          description="This deletes the uploaded file. You can upload a new one afterward."
          confirmLabel="Remove"
          action={deleteCv.bind(null, jobId, cvUrl)}
          trigger={
            <Button variant="outline" size="icon-sm" aria-label="Remove CV">
              <TrashIcon className="size-3.5" />
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="glass-surface flex flex-col items-start gap-2 rounded-lg p-3"
    >
      <input
        ref={inputRef}
        type="file"
        name="cv"
        accept="application/pdf"
        onChange={() => formRef.current?.requestSubmit()}
        className="sr-only"
        id={`cv-input-${jobId}`}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon />
        {pending ? "Uploading..." : "Upload CV (PDF)"}
      </Button>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
