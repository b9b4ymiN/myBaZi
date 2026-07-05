"use client";

import { useState } from "react";
import { useQiMenChart } from "@/lib/qimen/use-qimen-chart";
import { useActiveProfileSafe } from "@/lib/stores/use-hydrated";
import { PalaceGrid } from "@/components/qimen/palace-grid";
import { DateTimePicker } from "@/components/qimen/date-time-picker";
import { ChartSummary } from "@/components/qimen/chart-summary";
import { DeityInsight } from "@/components/qimen/deity-insight";
import { DestinyView } from "@/components/qimen/destiny-view";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageFrame, PageSection, RouteHeader } from "@/components/layout/page-patterns";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartType } from "@/types/qimen";

export default function QiMenPage() {
  const { date, hour, type, chart, setDate, setHour, setType, goNow } = useQiMenChart();
  const activeProfile = useActiveProfileSafe();

  // Add loading state for better UX
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (newDate: { year: number; month: number; day: number }) => {
    setIsLoading(true);
    setError(null);
    setDate(newDate);
    setTimeout(() => setIsLoading(false), 300); // Brief loading state for UX
  };

  const handleHourChange = (newHour: number) => {
    setIsLoading(true);
    setError(null);
    setHour(newHour);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleTypeChange = (newType: ChartType) => {
    setIsLoading(true);
    setError(null);
    setType(newType);
    setTimeout(() => setIsLoading(false), 300);
  };

  return (
    <PageFrame maxWidth="wide">
      <RouteHeader
        eyebrow="奇門遁甲"
        title="ฉีเหมือน"
        description="คำนวณแผนผังฉีเหมือน 9 ปราสาท พร้อมสรุปเทพ ประตู ดาว และการทำนายตามเวลา"
        meta={
          <div className="flex items-center gap-3">
            <Image
              src="/assets/brand/tool-compass-qimen.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              aria-hidden="true"
            />
            <Badge variant="outline">
              {type === "hour"
                ? "รายชั่วโมง"
                : type === "day"
                  ? "รายวัน"
                  : type === "month"
                    ? "รายเดือน"
                    : "รายปี"}
            </Badge>
          </div>
        }
      />

      <PageSection>
        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Loading skeleton */}
            <div className="space-y-6 lg:col-span-1">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-96 w-full" />
              <Separator className="my-8" />
              <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
            <Image
              src="/assets/brand/tool-compass-qimen.png"
              alt=""
              width={80}
              height={80}
              className="w-20 h-20 object-contain opacity-50"
              aria-hidden="true"
            />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">เกิดข้อผิดพลาดในการคำนวณ</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Controls + Summary */}
            <div className="space-y-6 lg:col-span-1">
              <DateTimePicker
                date={date}
                hour={hour}
                type={type}
                onDateChange={handleDateChange}
                onHourChange={handleHourChange}
                onTypeChange={handleTypeChange}
                onGoNow={goNow}
              />
              <ChartSummary chart={chart} chartType={type} />
            </div>

            {/* Center Column: Palace Grid (Main) */}
            <div className="space-y-6 lg:col-span-2">
              <PalaceGrid chart={chart} />

              <Separator className="my-8" />

              <div className="grid gap-6 md:grid-cols-2">
                <DeityInsight chart={chart} />
                <DestinyView profile={activeProfile} chart={chart} />
              </div>
            </div>
          </div>
        )}
      </PageSection>
    </PageFrame>
  );
}
