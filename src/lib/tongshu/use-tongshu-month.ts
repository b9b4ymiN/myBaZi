"use client";

import { useMemo, useState, useCallback } from "react";
import { getTongShuDayInfo } from "./day-info";
import type { TongShuDayInfo } from "@/types/tongshu";

export interface CalendarDay {
  date: Date;
  info: TongShuDayInfo | null; // null = padding day from other month
  isToday: boolean;
}

export function useTongShuMonth(initialYear: number, initialMonth: number) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth); // 1-12

  const days = useMemo(() => {
    const calendarDays: CalendarDay[] = [];

    // Get first day of month and its weekday
    const firstDay = new Date(year, month - 1, 1);
    const firstDayWeekday = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

    // Get number of days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Get today for highlighting
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

    // Add padding days from previous month
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 2, prevMonthDays - i);
      calendarDays.push({
        date: prevDate,
        info: null, // Don't compute for padding days
        isToday: false
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const isToday = isCurrentMonth && today.getDate() === day;

      // Compute Tong Shu info for this day
      const info = getTongShuDayInfo(year, month, day);

      calendarDays.push({
        date,
        info,
        isToday
      });
    }

    // Add padding days from next month to complete 6 weeks (42 days)
    const remainingDays = 42 - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month, day);
      calendarDays.push({
        date: nextDate,
        info: null,
        isToday: false
      });
    }

    return calendarDays;
  }, [year, month]);

  const prevMonth = useCallback(() => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  }, [year, month]);

  const nextMonth = useCallback(() => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  }, [year, month]);

  const goToday = useCallback(() => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  }, []);

  return {
    year,
    month,
    days,
    setYear,
    setMonth,
    prevMonth,
    nextMonth,
    goToday
  };
}
