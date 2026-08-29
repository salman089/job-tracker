"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function MiniCalendar({ markedDates }: { markedDates: Set<string> }) {
  const [cursor, setCursor] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = toKey(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  // Monday-first offset
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div className="glass-surface rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-heading text-sm font-semibold text-foreground">
          {cursor.toLocaleString("en-GB", { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="btn-press flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="btn-press flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((day, i) => (
          <span key={i} className="font-mono text-[10px] text-muted-foreground">
            {day}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={i} />;
          const key = toKey(date);
          const isToday = key === today;
          const hasEvent = markedDates.has(key);
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 py-0.5">
              <span
                className={`flex size-6 items-center justify-center rounded-md text-xs ${
                  isToday
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-foreground"
                }`}
              >
                {date.getDate()}
              </span>
              <span className={`size-1 rounded-[1px] ${hasEvent ? "bg-primary" : "bg-transparent"}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
