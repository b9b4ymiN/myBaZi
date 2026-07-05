"use client";

import { useState, useMemo, useEffect } from "react";
import { generateQiMenChart } from "@/lib/qimen/chart";
import type { ChartType } from "@/types/qimen";

interface DateState {
  year: number;
  month: number;
  day: number;
}

interface UseQiMenChartState {
  date: DateState;
  hour: number;
  minute: number;
  type: ChartType;
  chart: ReturnType<typeof generateQiMenChart>;
  setDate: (date: DateState) => void;
  setHour: (hour: number) => void;
  setType: (type: ChartType) => void;
  goNow: () => void;
}

/**
 * Hook to manage Qi Men chart state and generation
 * SSR-safe: only uses current time on client after hydration
 */
export function useQiMenChart(
  initial?: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    type: ChartType;
  }
): UseQiMenChartState {
  // Helper to get current client time
  const getNow = (): { date: DateState; hour: number } => {
    const now = new Date();
    return {
      date: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      },
      hour: now.getHours(),
    };
  };

  // Default to a fixed placeholder so server and client render identically;
  // jump to "now" in an effect below (client-only, after hydration).
  const [date, setDate] = useState<DateState>(() =>
    initial
      ? { year: initial.year, month: initial.month, day: initial.day }
      : { year: 2024, month: 1, day: 1 }
  );

  const [hour, setHour] = useState<number>(() => initial?.hour ?? 12);
  const [minute] = useState(initial?.minute ?? 0);
  const [type, setType] = useState<ChartType>(initial?.type ?? "hour");

  useEffect(() => {
    if (initial) return;
    const now = getNow();
    /* eslint-disable react-hooks/set-state-in-effect */
    setDate(now.date);
    setHour(now.hour);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate chart
  const chart = useMemo(
    () =>
      generateQiMenChart(date.year, date.month, date.day, hour, minute, type),
    [date, hour, minute, type]
  );

  // Function to set to current time
  const goNow = () => {
    const now = getNow();
    setDate(now.date);
    setHour(now.hour);
  };

  return {
    date,
    hour,
    minute,
    type,
    chart,
    setDate,
    setHour,
    setType,
    goNow,
  };
}
