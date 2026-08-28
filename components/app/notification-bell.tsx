"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRightCircleIcon,
  BellIcon,
  BriefcaseIcon,
  CheckCheckIcon,
  InboxIcon,
  MicVocalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { markAllNotificationsRead } from "@/lib/notifications/actions";
import type { AppNotification, NotificationType } from "@/lib/types";

const TYPE_ICON: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  job_created: BriefcaseIcon,
  status_changed: ArrowRightCircleIcon,
  interview_scheduled: MicVocalIcon,
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
}

export function NotificationBell({ notifications }: { notifications: AppNotification[] }) {
  const [items, setItems] = React.useState(notifications);
  const [prevNotifications, setPrevNotifications] = React.useState(notifications);
  if (notifications !== prevNotifications) {
    setPrevNotifications(notifications);
    setItems(notifications);
  }
  const unread = items.filter((n) => !n.read_at).length;

  async function handleOpenChange(open: boolean) {
    if (open && unread > 0) {
      setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })));
      await markAllNotificationsRead();
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <BellIcon className="size-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive-solid text-[10px] font-medium text-destructive-solid-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="font-heading text-sm font-semibold text-foreground">Notifications</p>
          {unread > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CheckCheckIcon className="size-3" />
              marked read
            </span>
          )}
        </div>

        <div className="scrollbar-hide max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <InboxIcon className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nothing here yet.</p>
            </div>
          ) : (
            items.map((notification) => {
              const Icon = TYPE_ICON[notification.type];
              return (
                <Link
                  key={notification.id}
                  href={notification.job_id ? `/jobs/${notification.job_id}` : "/pipeline"}
                  className={`flex items-start gap-3 border-b border-white/5 px-4 py-3 last:border-b-0 hover:bg-white/5 ${
                    notification.read_at ? "" : "bg-primary/5"
                  }`}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {notification.title}
                    </span>
                    {notification.body && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {notification.body}
                      </span>
                    )}
                    <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                      {timeAgo(notification.created_at)}
                    </span>
                  </span>
                  {!notification.read_at && (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
