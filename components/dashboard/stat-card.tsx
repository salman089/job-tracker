import type { LucideIcon } from "lucide-react";
import { CountUpNumber } from "@/components/dashboard/count-up-number";

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="glass-surface card-interactive flex items-center gap-3 rounded-2xl p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        {typeof value === "number" ? (
          <CountUpNumber value={value} />
        ) : (
          <p className="font-heading text-2xl font-semibold text-foreground">{value}</p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
