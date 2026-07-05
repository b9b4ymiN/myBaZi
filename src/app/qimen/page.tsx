"use client";

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

export default function QiMenPage() {
  const { date, hour, type, chart, setDate, setHour, setType, goNow } = useQiMenChart();
  const activeProfile = useActiveProfileSafe();

  return (
    <PageFrame maxWidth="wide">
      <RouteHeader
        eyebrow="奇門遁甲"
        title="ฉีเหมือน"
        description="คำนวณแผนผังฉีเหมือน 9 ปราสาท พร้อมสรุปเทพ ประตู ดาว และการทำนายตามเวลา"
        meta={
          <Badge variant="outline">
            {type === "hour"
              ? "รายชั่วโมง"
              : type === "day"
                ? "รายวัน"
                : type === "month"
                  ? "รายเดือน"
                  : "รายปี"}
          </Badge>
        }
      />

      <PageSection>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Controls + Summary */}
          <div className="space-y-6 lg:col-span-1">
            <DateTimePicker
              date={date}
              hour={hour}
              type={type}
              onDateChange={setDate}
              onHourChange={setHour}
              onTypeChange={setType}
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
      </PageSection>
    </PageFrame>
  );
}
