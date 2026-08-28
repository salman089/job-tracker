import Link from "next/link";
import { BriefcaseIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDisplayName } from "@/lib/auth/display-name";
import { getSoonInterviews } from "@/lib/interviews/queries";
import { getNotifications } from "@/lib/notifications/queries";
import { AddJobButton } from "@/components/jobs/add-job-button";
import { UserMenu } from "@/components/app/user-menu";
import { NavLinks } from "@/components/app/nav-links";
import { BottomTabBar } from "@/components/app/bottom-tab-bar";
import { InterviewReminderBanner } from "@/components/app/interview-reminder-banner";
import { NotificationBell } from "@/components/app/notification-bell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [{ data }, soonInterviews, notifications] = await Promise.all([
    supabase.auth.getUser(),
    getSoonInterviews(),
    getNotifications(),
  ]);

  return (
    <div className="flex min-h-screen">
      <nav className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-white/10 bg-background/80 p-4 backdrop-blur-lg md:flex">
        <Link href="/dashboard" className="flex items-center gap-2 px-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BriefcaseIcon className="size-4" />
          </span>
          <div>
            <p className="font-heading text-base font-bold text-primary">JobBase</p>
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              Executive Suite
            </p>
          </div>
        </Link>

        <NavLinks />

        <AddJobButton className="w-full" />
      </nav>

      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-background/50 px-4 backdrop-blur-md md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BriefcaseIcon className="size-4" />
            </span>
            <p className="font-heading text-base font-bold text-primary">JobBase</p>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <NotificationBell notifications={notifications} />
            <UserMenu name={getDisplayName(data.user)} email={data.user?.email ?? ""} />
          </div>
        </header>
        <InterviewReminderBanner interviews={soonInterviews} />
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</div>
      </main>

      <BottomTabBar />
    </div>
  );
}
