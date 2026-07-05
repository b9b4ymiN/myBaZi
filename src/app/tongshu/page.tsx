"use client";

import { useState, useMemo } from "react";
import { useTongShuMonth } from "@/lib/tongshu/use-tongshu-month";
import { CalendarGrid } from "@/components/tongshu/calendar-grid";
import { DayDetailPanel } from "@/components/tongshu/day-detail-panel";
import { ReferenceLibrary } from "@/components/tongshu/reference-library";
import { getTongShuDayInfo, getTongShuHours } from "@/lib/tongshu/day-info";
import { analyzePersonalResonance } from "@/lib/tongshu/personal-resonance";
import { scoreHours } from "@/lib/tongshu/hours-with-score";
import { useBaZiAnalysis } from "@/lib/bazi/use-bazi-analysis";
import { useActiveProfileSafe } from "@/lib/stores/use-hydrated";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { TongShuDayInfo } from "@/types/tongshu";
import { PageFrame, PageSection, RouteHeader } from "@/components/layout/page-patterns";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export default function TongShuPage() {
  // Get today's date
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // Get active profile
  const activeProfile = useActiveProfileSafe();

  // Get BaZi analysis for active profile
  const baziAnalysis = useBaZiAnalysis(activeProfile, currentYear);

  // Use Tong Shu month hook
  const { year, month, days, prevMonth, nextMonth, goToday } = useTongShuMonth(currentYear, currentMonth);

  // Selected day state
  const [selectedDay, setSelectedDay] = useState<Date | null>(today);
  const [selectedDayInfo, setSelectedDayInfo] = useState<TongShuDayInfo | null>(() => {
    // Initialize with today's info
    const initialInfo = getTongShuDayInfo(currentYear, currentMonth, today.getDate());
    return initialInfo;
  });

  // Compute hours for selected day
  const hours = useMemo(() => {
    if (!selectedDay) return [];
    return getTongShuHours(
      selectedDay.getFullYear(),
      selectedDay.getMonth() + 1,
      selectedDay.getDate()
    );
  }, [selectedDay]);

  // Compute personal resonance (if profile available)
  const personalResonance = useMemo(() => {
    if (!selectedDayInfo || !activeProfile || !baziAnalysis) return null;

    // Get user's day master from BaZi chart
    const userDayMaster = {
      stem: baziAnalysis.chart.dayMaster.name, // Stem character (丙, 丁, etc.)
      element: baziAnalysis.chart.dayMaster.element, // Element (火, 水, etc.)
    };

    // Get useful god element
    const usefulGodElement = baziAnalysis.usefulGod.primaryElement;

    return analyzePersonalResonance(
      selectedDayInfo,
      userDayMaster,
      usefulGodElement
    );
  }, [selectedDayInfo, activeProfile, baziAnalysis]);

  // Compute scored hours (if profile available)
  const scoredHours = useMemo(() => {
    if (!activeProfile || !baziAnalysis) return undefined;

    const usefulGodElement = baziAnalysis.usefulGod.primaryElement;
    return scoreHours(hours, usefulGodElement);
  }, [hours, activeProfile, baziAnalysis]);

  // Handle day selection
  const handleDaySelect = (date: Date, info: TongShuDayInfo | null) => {
    setSelectedDay(date);
    setSelectedDayInfo(info);
  };

  // Thai month name
  const thaiMonthName = THAI_MONTHS[month - 1];
  const thaiYear = year + 543;

  return (
    <PageFrame maxWidth="wide">
      <RouteHeader
        eyebrow="通勝"
        title="ปฏิทินมงคล"
        description="เลือกวันดี ชั่วโมงเหมาะสม และดู resonance กับโปรไฟล์ที่เลือก"
        meta={
          <span className="text-sm font-medium text-element-earth">
            {thaiMonthName} {thaiYear}
          </span>
        }
        actions={
          <>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToday}>
              <CalendarDays className="mr-2 h-4 w-4" />
              วันนี้
            </Button>
          </>
        }
      />

      {/* Main content - responsive layout */}
      <PageSection title={`${thaiMonthName} ${thaiYear}`} description="แตะวันที่เพื่อดูรายละเอียดเทพประจำวัน ฤกษ์ยาม และคะแนนส่วนตัว">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Calendar grid - 60% on desktop */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <CalendarGrid
                  days={days}
                  selectedDay={selectedDay}
                  onDaySelect={handleDaySelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* Day detail panel - 40% on desktop */}
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <DayDetailPanel
                info={selectedDayInfo}
                hours={hours}
                personalResonance={personalResonance}
                scoredHours={scoredHours}
              />
            </div>
          </div>
        </div>
      </PageSection>

      {/* Reference Library - full width below */}
      <PageSection title="คลังอ้างอิง">
        <ReferenceLibrary
          selectedDayOfficer={selectedDayInfo?.dayOfficer.name}
          selectedYellowBlackStar={selectedDayInfo?.yellowBlackStar.name}
          selectedConstellation28={selectedDayInfo?.constellation28.name}
        />
      </PageSection>
    </PageFrame>
  );
}
