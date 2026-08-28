"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Columns3Icon, LayoutDashboardIcon, LibraryIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { JobFormDialog } from "@/components/jobs/job-form-dialog";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/pipeline", label: "Pipeline", icon: Columns3Icon },
  { href: "/cv-library", label: "CVs", icon: LibraryIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

/**
 * Bottom tab bar for mobile. The Add-Job action floats separately at the
 * bottom-right rather than sitting inside the bar, since three tabs don't
 * split evenly around a centered FAB the way two did.
 */
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <>
      <nav
        className="glass-surface-elevated fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl px-2 py-2 md:hidden"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`btn-press flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <JobFormDialog
        trigger={
          <button
            type="button"
            aria-label="Add new job"
            className="btn-press fixed right-4 bottom-20 z-40 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_24px_rgb(234_179_8/0.4)] md:hidden"
            style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
          >
            <PlusIcon className="size-6" />
          </button>
        }
      />
    </>
  );
}
