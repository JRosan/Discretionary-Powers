"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DecisionCalendarProps {
  decisions: Array<{
    id: string;
    title: string;
    referenceNumber: string;
    deadline: string | null;
    status: string;
    ministryName: string | null;
  }>;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  // 0 = Sunday, convert so Monday = 0
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type DotColor = "red" | "amber" | "green";

function getDotColor(deadline: Date, now: Date): DotColor {
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "red";
  if (diffDays <= 3) return "amber";
  return "green";
}

const dotClasses: Record<DotColor, string> = {
  red: "bg-error",
  amber: "bg-warning",
  green: "bg-accent",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function DecisionCalendar({ decisions }: DecisionCalendarProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Group decisions by deadline date
  const deadlineMap = useMemo(() => {
    const map = new Map<string, Array<{ id: string; title: string; referenceNumber: string; dotColor: DotColor }>>();
    for (const d of decisions) {
      if (!d.deadline) continue;
      const dl = new Date(d.deadline);
      const key = dateKey(dl);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({
        id: d.id,
        title: d.title,
        referenceNumber: d.referenceNumber,
        dotColor: getDotColor(dl, now),
      });
    }
    return map;
  }, [decisions, now.toDateString()]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const todayKey = dateKey(now);

  // Previous month days to fill the first row
  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const calendarCells: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> = [];

  // Fill preceding days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
  }

  // Fill remaining cells to complete the grid (always 6 rows)
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
  }

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  return (
    <div className="select-none">
      {/* Month/year header with navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPrevMonth}
          className="p-1 rounded hover:bg-surface transition-colors text-text-secondary hover:text-text"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-text">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-1 rounded hover:bg-surface transition-colors text-text-secondary hover:text-text"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-[10px] font-medium text-text-muted py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarCells.map((cell, idx) => {
          const key = `${cell.year}-${String(cell.month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
          const isToday = key === todayKey;
          const items = deadlineMap.get(key);
          const hasItems = items && items.length > 0;

          // Pick the most urgent dot color
          let dotColor: DotColor | null = null;
          if (hasItems) {
            if (items.some((i) => i.dotColor === "red")) dotColor = "red";
            else if (items.some((i) => i.dotColor === "amber")) dotColor = "amber";
            else dotColor = "green";
          }

          return (
            <div
              key={idx}
              className={`relative flex flex-col items-center py-1.5 text-xs cursor-default ${
                isToday ? "border border-accent rounded" : ""
              } ${!cell.isCurrentMonth ? "text-text-muted/40" : "text-text-secondary"}`}
              onMouseEnter={() => hasItems ? setHoveredDay(key) : setHoveredDay(null)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <span className={isToday ? "font-bold text-accent" : ""}>{cell.day}</span>
              {dotColor && (
                <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${dotClasses[dotColor]}`} />
              )}

              {/* Tooltip */}
              {hoveredDay === key && hasItems && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-1 w-48 rounded-md border border-border bg-white shadow-lg p-2 text-left">
                  {items!.map((item) => (
                    <Link
                      key={item.id}
                      href={`/decisions/${item.id}`}
                      className="block py-1 px-1 rounded hover:bg-surface transition-colors"
                    >
                      <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${dotClasses[item.dotColor]}`} />
                      <span className="text-[11px] font-medium text-text truncate">
                        {item.title}
                      </span>
                      <span className="block text-[10px] font-mono text-text-muted ml-3.5">
                        {item.referenceNumber}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
