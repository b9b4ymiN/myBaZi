"use client";

import { useState, useMemo } from "react";
import { useTongShuMonth } from "@/lib/tongshu/use-tongshu-month";
import { getTongShuDayInfo, getTongShuHours } from "@/lib/tongshu/day-info";
import { analyzePersonalResonance } from "@/lib/tongshu/personal-resonance";
import { scoreHours } from "@/lib/tongshu/hours-with-score";
import {
  extractNatalBranches,
  checkDayVsNatal,
  getPersonalizedRecommends,
  getCellTone,
  rankDay,
  type NatalBranch,
  type RankedDay,
} from "@/lib/tongshu/day-bazi";
import { useBaZiAnalysis } from "@/lib/bazi/use-bazi-analysis";
import { useActiveProfileSafe } from "@/lib/stores/use-hydrated";
import { TodayHero } from "@/components/tongshu/today-hero";
import { CalendarGrid } from "@/components/tongshu/calendar-grid";
import { DayDetailPanel } from "@/components/tongshu/day-detail-panel";
import { MonthGoodDays } from "@/components/tongshu/month-good-days";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { TongShuDayInfo, PersonalResonance } from "@/types/tongshu";
import type { DayNatalInteraction, PersonalizedRecommend, CellTone } from "@/lib/tongshu/day-bazi";
import type { RelationshipType } from "@/types/bazi-useful-god";
import type { ElementName } from "@/lib/bazi/types";
import { PageFrame, PageSection, RouteHeader } from "@/components/layout/page-patterns";
import Image from "next/image";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

interface DayBaziData {
  resonance: PersonalResonance | null;
  interactions: DayNatalInteraction[];
  recommends: PersonalizedRecommend[];
}

interface BaziInputs {
  natalBranches: NatalBranch[];
  userDayMaster: { stem: string; element: ElementName };
  usefulGodElement: ElementName;
  usefulGodRelationship: RelationshipType;
  currentLuck: { sixtyCycleName: string } | null;
  currentAnnual: { year: number; sixtyCycleName: string } | null;
}

/** Per-day BaZi link data (resonance + 冲/合 + personalized宜) for a given day. */
function computeDayData(info: TongShuDayInfo | null, bi: BaziInputs | null): DayBaziData {
  if (!info || !bi) {
    return { resonance: null, interactions: [], recommends: [] };
  }
  const dayBranch = info.sixtyCycle[1];
  return {
    resonance: analyzePersonalResonance(info, bi.userDayMaster, bi.usefulGodElement),
    interactions: checkDayVsNatal(dayBranch, bi.natalBranches),
    recommends: getPersonalizedRecommends(info, bi.usefulGodRelationship),
  };
}

export default function TongShuPage() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const activeProfile = useActiveProfileSafe();
  const baziAnalysis = useBaZiAnalysis(activeProfile, currentYear);
  const { year, month, days, prevMonth, nextMonth, goToday } = useTongShuMonth(currentYear, currentMonth);

  const [selectedDay, setSelectedDay] = useState<Date | null>(today);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Today's info (for hero) — independent of viewed month
  const todayInfo = useMemo(
    () => getTongShuDayInfo(currentYear, currentMonth, today.getDate()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentYear, currentMonth]
  );

  // Stable BaZi inputs (reused for every day)
  const baziInputs = useMemo(() => {
    if (!baziAnalysis) return null;
    return {
      natalBranches: extractNatalBranches(baziAnalysis.chart),
      userDayMaster: {
        stem: baziAnalysis.chart.dayMaster.name,
        element: baziAnalysis.chart.dayMaster.element,
      },
      usefulGodElement: baziAnalysis.usefulGod.primaryElement,
      usefulGodRelationship: baziAnalysis.usefulGod.primaryRelationship as RelationshipType,
      currentLuck: baziAnalysis.luck.currentPillar,
      currentAnnual: baziAnalysis.luck.currentAnnual,
    };
  }, [baziAnalysis]);

  // Selected-day info + derived data
  const selectedDayInfo = useMemo(() => {
    if (!selectedDay) return null;
    return getTongShuDayInfo(selectedDay.getFullYear(), selectedDay.getMonth() + 1, selectedDay.getDate());
  }, [selectedDay]);

  const selectedHours = useMemo(() => {
    if (!selectedDay) return [];
    return getTongShuHours(selectedDay.getFullYear(), selectedDay.getMonth() + 1, selectedDay.getDate());
  }, [selectedDay]);

  const selectedScoredHours = useMemo(() => {
    if (!baziInputs) return undefined;
    return scoreHours(selectedHours, baziInputs.usefulGodElement);
  }, [selectedHours, baziInputs]);

  const selectedData = useMemo(() => computeDayData(selectedDayInfo, baziInputs), [selectedDayInfo, baziInputs]);
  const todayData = useMemo(() => computeDayData(todayInfo, baziInputs), [todayInfo, baziInputs]);

  // Per-day computed BaZi link (tone + goodness rank) — computed once,
  // derived into both the calendar tone map and the "good days" list.
  interface DayComputed {
    date: Date;
    info: TongShuDayInfo;
    tone: CellTone;
    rank: RankedDay;
  }
  const dayComputed = useMemo<DayComputed[]>(() => {
    const out: DayComputed[] = [];
    for (const cd of days) {
      if (!cd.info) continue;
      const resonance = baziInputs
        ? analyzePersonalResonance(cd.info, baziInputs.userDayMaster, baziInputs.usefulGodElement)
        : null;
      const interactions = baziInputs
        ? checkDayVsNatal(cd.info.sixtyCycle[1], baziInputs.natalBranches)
        : [];
      out.push({
        date: cd.date,
        info: cd.info,
        tone: getCellTone(cd.info, resonance, interactions),
        rank: rankDay(cd.info, resonance, interactions),
      });
    }
    return out;
  }, [days, baziInputs]);

  const dayTones = useMemo(() => {
    const m = new Map<string, CellTone>();
    for (const d of dayComputed) m.set(d.date.toDateString(), d.tone);
    return m;
  }, [dayComputed]);

  // Top good days of the month: no 冲, positive goodness, top 5
  const topGoodDays = useMemo(
    () =>
      dayComputed
        .filter((d) => !d.rank.hasClash && d.rank.goodness > 0)
        .sort((a, b) => b.rank.goodness - a.rank.goodness)
        .slice(0, 5)
        .map((d) => ({ date: d.date, info: d.info, rank: d.rank })),
    [dayComputed],
  );

  const handleDaySelect = (date: Date) => {
    setSelectedDay(date); // selectedDayInfo derived via memo on selectedDay
    setSheetOpen(true); // open mobile bottom-sheet on tap
  };

  const thaiMonthName = THAI_MONTHS[month - 1];
  const thaiYear = year + 543;
  const detailTitle = selectedDay
    ? `${selectedDay.getDate()}/${selectedDay.getMonth() + 1}/${selectedDay.getFullYear() + 543}`
    : "รายละเอียดวัน";

  return (
    <PageFrame maxWidth="wide">
      {/* Header + month nav */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative h-12 w-12 flex-shrink-0">
          <Image src="/assets/brand/tool-calendar.png" alt="" aria-hidden="true" fill className="object-contain" priority />
        </div>
        <div className="flex-1">
          <RouteHeader
            eyebrow="通勝"
            title="ปฏิทินมงคล"
            description="วันนี้เป็นยังไงสำหรับคุณ · เลือกวันดีตามดวง · ตรวจ冲/合 สาดวง"
            meta={<span className="text-sm font-medium text-element-earth">{thaiMonthName} {thaiYear}</span>}
            actions={
              <>
                <Button variant="outline" size="icon" onClick={prevMonth} aria-label="เดือนก่อนหน้า">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} aria-label="เดือนถัดไป">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={goToday}>
                  <CalendarDays className="mr-2 h-4 w-4" aria-hidden="true" />
                  วันนี้
                </Button>
              </>
            }
          />
        </div>
      </div>

      {/* TODAY HERO */}
      {todayInfo ? (
        <div className="mb-4">
          <TodayHero
            todayInfo={todayInfo}
            resonance={todayData.resonance}
            dayInteractions={todayData.interactions}
            recommends={todayData.recommends}
            currentLuck={baziInputs?.currentLuck ?? null}
            currentAnnual={baziInputs?.currentAnnual ?? null}
            profileName={activeProfile?.name}
          />
        </div>
      ) : (
        <Skeleton className="mb-4 h-48 w-full rounded-2xl" />
      )}

      {/* MONTH GOOD DAYS — proactive best-days recommendation */}
      {days.length > 0 && (
        <div className="mb-4">
          <MonthGoodDays days={topGoodDays} onSelect={handleDaySelect} hasProfile={!!baziInputs} />
        </div>
      )}

      {/* Calendar + desktop side detail */}
      <PageSection title={`${thaiMonthName} ${thaiYear}`} description="แตะวันเพื่อดูรายละเอียด · สีจุด = ความเข้ากันกับดวงคุณ">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-3 sm:p-4">
                {days.length === 0 ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 35 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square w-full" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <CalendarGrid
                    days={days}
                    selectedDay={selectedDay}
                    onDaySelect={handleDaySelect}
                    dayTones={dayTones}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Desktop sticky side panel (hidden on mobile — uses BottomSheet) */}
          <div className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-20">
              <Card>
                <CardContent className="p-4">
                  <DayDetailPanel
                    info={selectedDayInfo}
                    hours={selectedHours}
                    personalResonance={selectedData.resonance}
                    scoredHours={selectedScoredHours}
                    dayInteractions={selectedData.interactions}
                    currentLuck={baziInputs?.currentLuck ?? null}
                    currentAnnual={baziInputs?.currentAnnual ?? null}
                    personalizedRecommends={selectedData.recommends}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageSection>

      {/* Mobile bottom-sheet day detail */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={detailTitle}>
        <DayDetailPanel
          info={selectedDayInfo}
          hours={selectedHours}
          personalResonance={selectedData.resonance}
          scoredHours={selectedScoredHours}
          dayInteractions={selectedData.interactions}
          currentLuck={baziInputs?.currentLuck ?? null}
          currentAnnual={baziInputs?.currentAnnual ?? null}
          personalizedRecommends={selectedData.recommends}
        />
      </BottomSheet>
    </PageFrame>
  );
}
