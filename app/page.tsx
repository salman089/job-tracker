import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlarmClockIcon,
  ArrowRightIcon,
  BellIcon,
  BrainIcon,
  BriefcaseIcon,
  CalendarPlusIcon,
  ChevronDownIcon,
  ClockAlertIcon,
  ContactIcon,
  CopyIcon,
  FileTextIcon,
  FileWarningIcon,
  GaugeIcon,
  QuoteIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { StaggerReveal } from "@/components/landing/stagger-reveal";
import { HeroReveal } from "@/components/landing/hero-reveal";
import { StarfieldBackground } from "@/components/landing/starfield-background";

const PROBLEMS = [
  {
    icon: FileWarningIcon,
    title: "Scattered across spreadsheets",
    description: "A tab here, a notes app there. Nothing lines up, and nothing's ever up to date.",
  },
  {
    icon: ClockAlertIcon,
    title: "Follow-ups slip through",
    description: "An interview happens, life gets busy, and the thank-you note never goes out.",
  },
  {
    icon: UsersIcon,
    title: "Contacts get lost",
    description: "You spoke to a recruiter three weeks ago. Their name, email, everything is gone.",
  },
  {
    icon: CopyIcon,
    title: "Every CV looks the same",
    description: "You send the same resume everywhere instead of tailoring it to what's actually asked for.",
  },
];

const SOLUTIONS = [
  {
    icon: BriefcaseIcon,
    title: "Visual Pipeline",
    description: "Drag applications across wishlist, applied, interviewing, offer, rejected.",
  },
  {
    icon: BrainIcon,
    title: "AI JD Parsing",
    description: "Paste a job description, get the required skills extracted in seconds.",
  },
  {
    icon: FileTextIcon,
    title: "CV Library",
    description: "Every CV lives in one place, linked back to the job it was sent for.",
  },
  {
    icon: GaugeIcon,
    title: "CV Match Score",
    description: "See how well a CV covers a job's required skills before you hit send.",
  },
  {
    icon: SearchIcon,
    title: "Search & Filter",
    description: "Find any application instantly by company, role, or skill.",
  },
  {
    icon: BellIcon,
    title: "Interview Reminders",
    description: "A live banner surfaces every interview coming up in the next 48 hours.",
  },
  {
    icon: ContactIcon,
    title: "Contacts Tracker",
    description: "Recruiter names, emails, and notes saved against every application.",
  },
  {
    icon: AlarmClockIcon,
    title: "Stale-Application Nudges",
    description: "Applications sitting quiet for two weeks get flagged on your dashboard.",
  },
  {
    icon: CalendarPlusIcon,
    title: "Calendar Sync",
    description: "One click adds any interview straight to Google, Apple, or Outlook calendar.",
  },
];

const STEPS = [
  {
    title: "Add a job",
    description: "Paste the listing URL or job description as you find it.",
  },
  {
    title: "Let AI parse it",
    description: "Skills and requirements are extracted automatically in seconds.",
  },
  {
    title: "Track it to the offer",
    description: "Drag it through your pipeline and never miss a follow-up.",
  },
];

const FAQS = [
  {
    question: "Is my data private?",
    answer:
      "Yes. Every table is protected by row-level security in Postgres, gated on your session, so only you can ever read or write your own applications, interviews, and notes.",
  },
  {
    question: "Does JobBase cost anything?",
    answer:
      "No. It's a personal project, free to use. There's no paid tier, no upsell, nothing to unlock.",
  },
  {
    question: "What AI model parses job descriptions?",
    answer:
      "JobBase uses Groq's hosted models to extract required skills from a pasted job description and to score how well an uploaded CV matches those skills. Nothing is sent anywhere until you click Parse.",
  },
  {
    question: "Can I get my data out?",
    answer:
      "Yes, any time. Settings has a one-click export that downloads every job, interview, and note as a JSON file.",
  },
  {
    question: "Do I need to turn on two-factor authentication?",
    answer:
      "It's optional but supported end to end, TOTP with backup codes, enforced at the database level once enrolled, not just in the UI.",
  },
  {
    question: "What happens if I delete my account?",
    answer:
      "Everything goes: every job, interview, note, contact, and uploaded CV. It's permanent and irreversible, which is why it asks you to type your email to confirm first.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex flex-1 flex-col">
      <StarfieldBackground />

      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-background/50 px-4 backdrop-blur-md md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BriefcaseIcon className="size-4" />
          </span>
          <span className="font-heading text-lg font-semibold text-foreground">JobBase</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="#features"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:inline"
          >
            Features
          </Link>
          <Button render={<Link href="/login" />} nativeButton={false} variant="ghost" size="sm">
            Log in
          </Button>
          <Button render={<Link href="/signup" />} nativeButton={false} size="sm">
            Get Started
          </Button>
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 pt-16 pb-16 md:grid-cols-[1fr_1.1fr] md:gap-8 md:pt-20 lg:px-8">
        <HeroReveal className="flex flex-col items-start text-left">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            One place to track <span className="text-primary">every application</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
            Track applications, parse job descriptions with AI, and never miss a follow-up again.
          </p>
          <div className="mt-8">
            <Button render={<Link href="/signup" />} nativeButton={false} size="lg">
              Get Started for Free
            </Button>
          </div>
        </HeroReveal>

        <ScrollReveal className="relative">
          <div className="glass-surface-elevated overflow-hidden rounded-2xl p-1.5">
            <div className="overflow-hidden rounded-xl">
              <Image
                src="/screenshots/pipeline-preview.png"
                alt="JobBase pipeline board showing applications across wishlist, applied, interviewing, offer, and rejected columns"
                width={1567}
                height={275}
                className="w-full"
                priority
              />
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-16">
        <ScrollReveal className="glass-surface flex flex-col gap-4 rounded-2xl p-8 text-center sm:p-10">
          <QuoteIcon className="mx-auto size-6 text-primary" />
          <p className="font-heading text-xl leading-relaxed text-foreground sm:text-2xl">
            &ldquo;I built this after losing track of forty-plus applications in a spreadsheet.
            Now it&apos;s automatic.&rdquo;
          </p>
          <p className="text-sm text-muted-foreground">The person who built JobBase</p>
        </ScrollReveal>

        <ScrollReveal className="mt-10 flex flex-col divide-y divide-white/10 sm:flex-row sm:divide-x sm:divide-y-0">
          <div className="flex flex-1 flex-col gap-1 px-0 py-4 text-center sm:px-6 sm:py-0">
            <p className="font-heading text-lg font-semibold text-foreground">Row-level security</p>
            <p className="text-xs text-muted-foreground">Enforced in Postgres, not just the UI.</p>
          </div>
          <div className="flex flex-1 flex-col gap-1 px-0 py-4 text-center sm:px-6 sm:py-0">
            <p className="font-heading text-lg font-semibold text-foreground">AI in seconds</p>
            <p className="text-xs text-muted-foreground">Skills extracted the moment you paste a JD.</p>
          </div>
          <div className="flex flex-1 flex-col gap-1 px-0 py-4 text-center sm:px-6 sm:py-0">
            <p className="font-heading text-lg font-semibold text-foreground">Always free</p>
            <p className="text-xs text-muted-foreground">No tier, no upsell, nothing to unlock.</p>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <ScrollReveal className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-semibold text-foreground">
            Job hunting shouldn&apos;t feel like a second job.
          </h2>
          <p className="mt-3 text-muted-foreground">
            The same problems show up in every spreadsheet-and-sticky-notes system.
          </p>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 gap-4 sm:grid-cols-2" staggerDelay={90}>
          {PROBLEMS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="glass-surface flex items-start gap-4 rounded-xl p-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-heading mb-1 text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </StaggerReveal>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-16">
        <ScrollReveal className="flex flex-col items-stretch gap-0 sm:flex-row sm:items-start">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.title}>
              <div className="flex flex-1 flex-col gap-2">
                <h3 className="font-heading text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden shrink-0 items-center justify-center px-4 pt-1 sm:flex" aria-hidden>
                  <ArrowRightIcon className="size-5 text-primary/50" />
                </div>
              )}
            </React.Fragment>
          ))}
        </ScrollReveal>
      </section>

      <section id="features" className="mx-auto w-full max-w-5xl px-4 py-16">
        <ScrollReveal className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-semibold text-foreground">Built for performance.</h2>
          <p className="mt-3 text-muted-foreground">Everything above, solved by one feature each.</p>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 gap-4 sm:grid-cols-3" staggerDelay={70}>
          {SOLUTIONS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="glass-surface card-interactive rounded-xl p-6">
              <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="font-heading mb-2 text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </StaggerReveal>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16">
        <ScrollReveal className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-semibold text-foreground">Questions</h2>
        </ScrollReveal>

        <StaggerReveal className="flex flex-col gap-2" staggerDelay={60}>
          {FAQS.map((faq) => (
            <details key={faq.question} className="glass-surface group rounded-xl p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-foreground">
                {faq.question}
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </StaggerReveal>
      </section>

      <ScrollReveal className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Ready to organize your job search?
        </h2>
        <Button render={<Link href="/signup" />} nativeButton={false} size="lg">
          Get Started for Free
        </Button>
      </ScrollReveal>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-muted-foreground">
        JobBase, a personal job application tracker.
      </footer>
    </div>
  );
}
