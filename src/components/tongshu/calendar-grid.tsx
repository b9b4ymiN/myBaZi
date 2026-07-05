"use client";

import { CalendarDay } from "@/lib/tongshu/use-tongshu-month";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CalendarGridProps {
  days: CalendarDay[];
  selectedDay: Date | null;
  onDaySelect: (date: Date, info: CalendarDay["info"]) => void;
}

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const RATING_COLORS = {
  very_auspicious: "bg-green-700 text-white border-green-800",
  auspicious: "bg-green-600 text-white border-green-700",
  neutral: "bg-gray-400 text-white border-gray-500",
  inauspicious: "bg-orange-500 text-white border-orange-600",
  very_inauspicious: "bg-red-600 text-white border-red-700"
};

export function CalendarGrid({ days, selectedDay, onDaySelect }: CalendarGridProps) {
  return (
    <div className="space-y-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((calendarDay, index) => {
          const isSelected = selectedDay && calendarDay.date.toDateString() === selectedDay.toDateString();
          const isPadding = !calendarDay.info;

          return (
            <button
              key={index}
              onClick={() => !isPadding && onDaySelect(calendarDay.date, calendarDay.info)}
              disabled={isPadding}
              className={cn(
                "aspect-square p-2 rounded-lg border-2 transition-all hover:shadow-md min-h-[80px]",
                "flex flex-col items-start justify-between",
                isPadding
                  ? "bg-muted/30 border-muted text-muted-foreground cursor-not-allowed"
                  : "bg-card border-border hover:border-jade/50 cursor-pointer",
                isSelected && "border-jade ring-2 ring-jade/20"
              )}
              aria-label={
                isPadding
                  ? "ไม่มีข้อมูล"
                  : `${calendarDay.date.getDate()} ${calendarDay.info?.dayOfficer.nameTh} คะแนน ${calendarDay.info?.powerScore}`
              }
            >
              {/* Day number and today indicator */}
              <div className="flex items-center justify-between w-full">
                <span className={cn(
                  "text-sm font-medium",
                  isPadding && "text-muted-foreground",
                  calendarDay.isToday && "text-primary font-bold"
                )}>
                  {calendarDay.date.getDate()}
                </span>
                {calendarDay.isToday && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>

              {/* Tong Shu info */}
              {calendarDay.info && (
                <div className="flex flex-col gap-1 w-full">
                  {/* Lunar day */}
                  <div className="text-xs text-muted-foreground truncate">
                    {calendarDay.info.lunarDate.dayName}
                  </div>

                  {/* Power score badge */}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-1 py-0 h-5 w-full justify-center",
                      RATING_COLORS[calendarDay.info.rating]
                    )}
                  >
                    {calendarDay.info.powerScore}
                  </Badge>

                  {/* Day officer (truncated) */}
                  <div className="text-xs truncate text-muted-foreground" title={calendarDay.info.dayOfficer.nameTh}>
                    {calendarDay.info.dayOfficer.nameTh.slice(0, 4)}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
