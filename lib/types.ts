export type JobStatus =
  | "wishlist"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export const JOB_STATUSES: JobStatus[] = [
  "wishlist",
  "applied",
  "interviewing",
  "offer",
  "rejected",
];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

export type InterviewRoundType =
  | "phone"
  | "technical"
  | "onsite"
  | "hr"
  | "final";

export const INTERVIEW_ROUND_TYPES: InterviewRoundType[] = [
  "phone",
  "technical",
  "onsite",
  "hr",
  "final",
];

export const INTERVIEW_ROUND_LABELS: Record<InterviewRoundType, string> = {
  phone: "Phone Screen",
  technical: "Technical",
  onsite: "Onsite",
  hr: "HR",
  final: "Final",
};

export interface Job {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: JobStatus;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  jd_text: string | null;
  extracted_skills: string[];
  cv_url: string | null;
  board_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  job_id: string;
  round_type: InterviewRoundType;
  scheduled_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface JobNote {
  id: string;
  job_id: string;
  body: string;
  created_at: string;
}

export interface NoteFormState {
  errors?: {
    body?: string[];
  };
  message?: string;
}

export interface Contact {
  id: string;
  job_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface ContactFormState {
  errors?: {
    name?: string[];
    email?: string[];
    linkedin_url?: string[];
  };
  message?: string;
}

export interface InterviewFormState {
  errors?: {
    round_type?: string[];
    scheduled_at?: string[];
    notes?: string[];
  };
  message?: string;
}

export interface JobFormState {
  errors?: {
    company?: string[];
    role?: string[];
    salary_min?: string[];
    salary_max?: string[];
  };
  message?: string;
}

export type JdParseStatus = "idle" | "parsing" | "parsed" | "error";

export interface JdParseResult {
  status: JdParseStatus;
  skills?: string[];
  error?: string;
}

export type NotificationType = "job_created" | "status_changed" | "interview_scheduled";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  job_id: string | null;
  read_at: string | null;
  created_at: string;
}
