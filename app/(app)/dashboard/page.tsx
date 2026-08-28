import { BriefcaseIcon, ClockIcon, MailQuestionIcon, TrophyIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDisplayName } from "@/lib/auth/display-name";
import {
  getDashboardStats,
  getUpcomingInterviews,
  getRecentJobs,
  getApplicationsByDay,
  getStaleJobs,
} from "@/lib/dashboard/queries";
import { StatCard } from "@/components/dashboard/stat-card";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { TipsPanel } from "@/components/dashboard/tips-panel";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { RecentActivityTable } from "@/components/dashboard/recent-activity-table";
import { StaleApplications } from "@/components/dashboard/stale-applications";
import { AddJobButton } from "@/components/jobs/add-job-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: userData }, stats, interviews, recentJobs, activity, staleJobs] = await Promise.all([
    supabase.auth.getUser(),
    getDashboardStats(),
    getUpcomingInterviews(),
    getRecentJobs(),
    getApplicationsByDay(7),
    getStaleJobs(),
  ]);

  const name = getDisplayName(userData.user);
  const markedDates = new Set(interviews.map((i) => i.scheduled_at.slice(0, 10)));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 flex flex-col items-start justify-between gap-4 duration-500 ease-[var(--ease-spring)] sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Welcome back, {name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is how your search is going.
          </p>
        </div>
        <AddJobButton />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={BriefcaseIcon} label="Total Applications" value={stats.totalApplications} />
        <StatCard icon={ClockIcon} label="Interviews Scheduled" value={stats.interviewsScheduled} />
        <StatCard icon={MailQuestionIcon} label="Awaiting Response" value={stats.awaitingResponse} />
        <StatCard icon={TrophyIcon} label="Offers" value={stats.offers} />
      </div>

      <StaleApplications jobs={staleJobs} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityChart data={activity} />
        </div>
        <MiniCalendar markedDates={markedDates} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivityTable jobs={recentJobs} />
        </div>
        <TipsPanel />
      </div>
    </div>
  );
}
