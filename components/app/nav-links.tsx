"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Columns3Icon, LayoutDashboardIcon, LibraryIcon, SettingsIcon } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/pipeline", label: "Pipeline", icon: Columns3Icon },
  { href: "/cv-library", label: "CV Library", icon: LibraryIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-1 flex-col gap-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              className={`btn-press flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
