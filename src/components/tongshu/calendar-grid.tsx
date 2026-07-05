"use client";

import { CalendarDay } from "@/lib/tongshu/use-tongshu-month";
import type { CellTone } from "@/lib/tongshu/day-bazi";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  days: CalendarDay[];
  selectedDay: Date | null;
  onDaySelect: (date: Date, info: CalendarDay["info"]) => void;
  /** Per-day visual tone keyed by date.toDateString() (profile-aware). Optional. */
  dayTones?: Map<string, CellTone>;
}

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const TONE_STYLE: Record<CellTone, { dot: string; label: string }> = {
  clash: { dot: "bg-destructive", label: "冲 สาดวง — เลี่ยงเรื่องใหญ่" },
  good: { dot: "bg-jade", label: "เข้ากันดี/มงคล" },
  neutral: { dot: "bg-gold", label: "ปานกลาง" },
  caution: { dot: "bg-orange-500", label: "ท้าทาย" },
  bad: { dot: "bg-red-700", label: "ท้าทายมาก" },
  muted: { dot: "bg-muted-foreground/40", label: "" },
};

export function CalendarGrid({
  days,
  selectedDay,
  onDaySelect,
  dayTones,
}: CalendarGridProps) {
  return (
    <div className="space-y-2">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-xs font-semibold text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((calendarDay, index) => {
          const isSelected =
            selectedDay &&
            calendarDay.date.toDateString() === selectedDay.toDateString();
          const isPadding = !calendarDay.info;
          const tone = !isPadding
            ? (dayTones?.get(calendarDay.date.toDateString()) ?? "muted")
            : "muted";
          const toneStyle = TONE_STYLE[tone];

          return (
            <button
              key={index}
              onClick={() => !isPadding && onDaySelect(calendarDay.date, calendarDay.info)}
              disabled={isPadding}
              className={cn(
                "flex aspect-square min-h-[48px] flex-col justify-between rounded-lg border p-1.5 transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isPadding
                  ? "cursor-not-allowed border-transparent bg-transparent text-muted-foreground/40"
                  : "cursor-pointer border-border bg-card hover:border-jade/50 hover:shadow-sm",
                isSelected && "border-jade ring-2 ring-jade/25",
              )}
              aria-label={
                isPadding
                  ? "ไม่มีข้อมูล"
                  : `${calendarDay.date.getDate()} ${calendarDay.info?.lunarDate.dayName ?? ""}${toneStyle.label ? " · " + toneStyle.label : ""}`
              }
            >
              {/* Day number + today mark */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-sm font-medium leading-none",
                    calendarDay.isToday && "text-jade font-bold",
                  )}
                >
                  {calendarDay.date.getDate()}
                </span>
                {calendarDay.isToday && (
                  <span className="h-1.5 w-1.5 rounded-full bg-jade" aria-hidden="true" />
                )}
              </div>

              {/* Lunar day (tiny) + tone dot */}
              {!isPadding && (
                <div className="flex items-center justify-between gap-0.5">
                  <span className="truncate text-[0.6rem] leading-none text-muted-foreground">
                    {calendarDay.info?.lunarDate.dayName}
                  </span>
                  <span
                    className={cn("h-2 w-2 shrink-0 rounded-full", toneStyle.dot)}
                    aria-hidden="true"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[0.65rem] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-jade" /> ดี</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gold" /> ปานกลาง</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> ท้าทาย</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> 冲 สาดวง</span>
      </div>
    </div>
  );
}
