"use client";

import {
  CalendarPlusIcon,
  ContactIcon,
  ExternalLinkIcon,
  MailIcon,
  MessageSquareTextIcon,
  MicVocalIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobFormDialog } from "@/components/jobs/job-form-dialog";
import { InterviewFormDialog } from "@/components/interviews/interview-form-dialog";
import { ContactFormDialog } from "@/components/jobs/contact-form-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { CvUpload } from "@/components/jobs/cv-upload";
import { CvMatchScore } from "@/components/jobs/cv-match-score";
import { NoteForm } from "@/components/jobs/note-form";
import { deleteJob } from "@/lib/jobs/actions";
import { deleteNote } from "@/lib/jobs/notes-actions";
import { deleteContact } from "@/lib/jobs/contacts-actions";
import { createInterview, updateInterview, deleteInterview } from "@/lib/interviews/actions";
import {
  INTERVIEW_ROUND_LABELS,
  JOB_STATUS_LABELS,
  type Contact,
  type Interview,
  type Job,
  type JobNote,
} from "@/lib/types";
import { useRouter } from "next/navigation";

function formatDate(iso: string | null) {
  if (!iso) return "Not scheduled";
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-primary" />
      <h2 className="font-heading text-lg font-semibold text-foreground">{children}</h2>
    </div>
  );
}

export function JobDetail({
  job,
  interviews,
  contacts,
  notes,
}: {
  job: Job;
  interviews: Interview[];
  contacts: Contact[];
  notes: JobNote[];
}) {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-8">
      <div className="glass-surface animate-in fade-in-0 slide-in-from-bottom-2 flex flex-col gap-4 rounded-xl p-6 duration-500 ease-[var(--ease-spring)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-semibold break-words text-foreground">
              {job.company}
            </h1>
            <p className="break-words text-muted-foreground">{job.role}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <JobFormDialog
              job={job}
              trigger={
                <Button variant="outline" size="icon-sm" aria-label="Edit job">
                  <PencilIcon className="size-3.5" />
                </Button>
              }
            />
            <ConfirmDeleteDialog
              title="Delete this job application?"
              description={`This permanently removes ${job.company} (${job.role}) and all of its interviews. This can't be undone.`}
              action={deleteJob.bind(null, job.id)}
              trigger={
                <Button variant="outline" size="icon-sm" aria-label="Delete job">
                  <TrashIcon className="size-3.5" />
                </Button>
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge>{JOB_STATUS_LABELS[job.status]}</Badge>
          {job.salary_min && (
            <Badge variant="outline" className="font-mono">
              {job.currency} {job.salary_min.toLocaleString()}
              {job.salary_max ? `-${job.salary_max.toLocaleString()}` : ""}
            </Badge>
          )}
        </div>

        {job.extracted_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.extracted_skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {job.jd_text && (
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">Job description</summary>
            <p className="mt-2 whitespace-pre-wrap">{job.jd_text}</p>
          </details>
        )}

        <div className="flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            CV
          </p>
          <CvUpload jobId={job.id} cvUrl={job.cv_url} />
          <CvMatchScore
            jobId={job.id}
            hasCv={Boolean(job.cv_url)}
            hasSkills={job.extracted_skills.length > 0}
          />
        </div>
      </div>

      <div
        className="animate-in fade-in-0 slide-in-from-bottom-2 flex flex-col gap-3 duration-500 ease-[var(--ease-spring)]"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-center justify-between">
          <SectionHeading icon={MicVocalIcon}>Interviews</SectionHeading>
          <InterviewFormDialog
            jobId={job.id}
            action={createInterview}
            trigger={
              <Button size="sm">
                <PlusIcon />
                Add Interview
              </Button>
            }
          />
        </div>

        {interviews.length === 0 ? (
          <div className="glass-surface rounded-lg p-6 text-center text-sm text-muted-foreground">
            No interviews scheduled yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="glass-surface flex flex-col items-start gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {INTERVIEW_ROUND_LABELS[interview.round_type]}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatDate(interview.scheduled_at)}
                  </p>
                  {interview.notes && (
                    <p className="mt-1 text-sm break-words text-muted-foreground">
                      {interview.notes}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {interview.scheduled_at && (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Add to calendar"
                      render={
                        <a href={`/api/interviews/${interview.id}/ics`} download />
                      }
                    >
                      <CalendarPlusIcon className="size-3.5" />
                    </Button>
                  )}
                  <InterviewFormDialog
                    jobId={job.id}
                    interview={interview}
                    action={updateInterview.bind(null, interview.id)}
                    trigger={
                      <Button variant="outline" size="icon-sm" aria-label="Edit interview">
                        <PencilIcon className="size-3.5" />
                      </Button>
                    }
                  />
                  <ConfirmDeleteDialog
                    title="Delete this interview?"
                    description="This permanently removes this interview round. This can't be undone."
                    action={deleteInterview.bind(null, interview.id, job.id)}
                    trigger={
                      <Button variant="outline" size="icon-sm" aria-label="Delete interview">
                        <TrashIcon className="size-3.5" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="animate-in fade-in-0 slide-in-from-bottom-2 flex flex-col gap-3 duration-500 ease-[var(--ease-spring)]"
        style={{ animationDelay: "140ms" }}
      >
        <div className="flex items-center justify-between">
          <SectionHeading icon={ContactIcon}>Contacts</SectionHeading>
          <ContactFormDialog
            jobId={job.id}
            trigger={
              <Button size="sm">
                <PlusIcon />
                Add Contact
              </Button>
            }
          />
        </div>

        {contacts.length === 0 ? (
          <div className="glass-surface rounded-lg p-6 text-center text-sm text-muted-foreground">
            No contacts saved yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="glass-surface flex flex-col items-start gap-3 rounded-lg p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {contact.name}
                    {contact.role && (
                      <span className="ml-1.5 font-normal text-muted-foreground">
                        - {contact.role}
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-primary">
                        <MailIcon className="size-3" />
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-primary">
                        <PhoneIcon className="size-3" />
                        {contact.phone}
                      </a>
                    )}
                    {contact.linkedin_url && (
                      <a
                        href={contact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <ExternalLinkIcon className="size-3" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                  {contact.notes && (
                    <p className="mt-1.5 flex items-start gap-1 text-sm break-words text-muted-foreground">
                      <MessageSquareTextIcon className="mt-0.5 size-3 shrink-0" />
                      {contact.notes}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <ContactFormDialog
                    jobId={job.id}
                    contact={contact}
                    trigger={
                      <Button variant="outline" size="icon-sm" aria-label="Edit contact">
                        <PencilIcon className="size-3.5" />
                      </Button>
                    }
                  />
                  <ConfirmDeleteDialog
                    title="Delete this contact?"
                    description="This permanently removes this contact. This can't be undone."
                    action={deleteContact.bind(null, contact.id, job.id)}
                    trigger={
                      <Button variant="outline" size="icon-sm" aria-label="Delete contact">
                        <TrashIcon className="size-3.5" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="animate-in fade-in-0 slide-in-from-bottom-2 flex flex-col gap-3 duration-500 ease-[var(--ease-spring)]"
        style={{ animationDelay: "200ms" }}
      >
        <SectionHeading icon={MessageSquareTextIcon}>Notes</SectionHeading>

        <div className="glass-surface rounded-lg p-4">
          <NoteForm jobId={job.id} />
        </div>

        {notes.length === 0 ? (
          <div className="glass-surface rounded-lg p-6 text-center text-sm text-muted-foreground">
            No notes yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="glass-surface flex items-start justify-between gap-3 rounded-lg p-4"
              >
                <div className="min-w-0">
                  <p className="whitespace-pre-wrap break-words text-sm text-foreground">
                    {note.body}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {formatDate(note.created_at)}
                  </p>
                </div>
                <ConfirmDeleteDialog
                  title="Delete this note?"
                  description="This permanently removes this note. This can't be undone."
                  action={deleteNote.bind(null, note.id, job.id)}
                  trigger={
                    <Button variant="outline" size="icon-sm" aria-label="Delete note" className="shrink-0">
                      <TrashIcon className="size-3.5" />
                    </Button>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Button variant="ghost" className="self-start" onClick={() => router.push("/pipeline")}>
        Back to pipeline
      </Button>
    </div>
  );
}
