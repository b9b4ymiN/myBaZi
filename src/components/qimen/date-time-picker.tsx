"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChartType } from "@/types/qimen";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  date: { year: number; month: number; day: number };
  hour: number;
  type: ChartType;
  onDateChange: (date: { year: number; month: number; day: number }) => void;
  onHourChange: (hour: number) => void;
  onTypeChange: (type: ChartType) => void;
  onGoNow: () => void;
}

/**
 * 12 ยาม (Earthly Branches with Chinese names)
 */
const EARTHLY_BRANCHES = [
  { value: 0, label: "子时 (23:00-00:59)" },
  { value: 1, label: "丑时 (01:00-02:59)" },
  { value: 2, label: "寅时 (03:00-04:59)" },
  { value: 3, label: "卯时 (05:00-06:59)" },
  { value: 4, label: "辰时 (07:00-08:59)" },
  { value: 5, label: "巳时 (09:00-10:59)" },
  { value: 6, label: "午时 (11:00-12:59)" },
  { value: 7, label: "未时 (13:00-14:59)" },
  { value: 8, label: "申时 (15:00-16:59)" },
  { value: 9, label: "酉时 (17:00-18:59)" },
  { value: 10, label: "戌时 (19:00-20:59)" },
  { value: 11, label: "亥时 (21:00-22:59)" },
];

/**
 * Chart type options
 */
const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "hour", label: "รายชั่วโมง (时家)" },
  { value: "day", label: "รายวัน (日家)" },
  { value: "month", label: "รายเดือน (月家)" },
  { value: "year", label: "รายปี (年家)" },
];

/**
 * Date, time, and chart type picker for Qi Men charts
 */
export function DateTimePicker({
  date,
  hour,
  type,
  onDateChange,
  onHourChange,
  onTypeChange,
  onGoNow,
}: DateTimePickerProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">วันที่ (Date)</label>
            <input
              type="date"
              value={`${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`}
              onChange={(e) => {
                const d = new Date(e.target.value);
                onDateChange({
                  year: d.getFullYear(),
                  month: d.getMonth() + 1,
                  day: d.getDate(),
                });
              }}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "text-sm ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />
          </div>

          {/* Hour Picker (12 ยาม) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">ยาม (Hour Branch)</label>
            <Select value={hour.toString()} onValueChange={(v) => onHourChange(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EARTHLY_BRANCHES.map((branch) => (
                  <SelectItem key={branch.value} value={branch.value.toString()}>
                    {branch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chart Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">ประเภทแผนผัง (Chart Type)</label>
            <Select value={type} onValueChange={(v) => onTypeChange(v as ChartType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPES.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value}>
                    {ct.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* "Current Time" Button */}
          <Button onClick={onGoNow} className="w-full" variant="outline">
            ปัจจุบัน (Now)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
