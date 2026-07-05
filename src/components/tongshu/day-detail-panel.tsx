"use client";

import { TongShuDayInfo, TongShuHour, PersonalResonance, ScoredHour } from "@/types/tongshu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PersonalResonancePanel } from "./personal-resonance-panel";
import { HoursView } from "./hours-view";

interface DayDetailPanelProps {
  info: TongShuDayInfo | null;
  hours: TongShuHour[];
  personalResonance?: PersonalResonance | null;
  scoredHours?: ScoredHour[];
}

const RATING_BADGES = {
  very_auspicious: { label: "มงคลมาก", className: "bg-green-700 text-white hover:bg-green-800" },
  auspicious: { label: "มงคล", className: "bg-green-500 text-white hover:bg-green-600" },
  neutral: { label: "ปานกลาง", className: "bg-gray-400 text-white hover:bg-gray-500" },
  inauspicious: { label: "อัปมงคล", className: "bg-orange-500 text-white hover:bg-orange-600" },
  very_inauspicious: { label: "อัปมงคลมาก", className: "bg-red-600 text-white hover:bg-red-700" }
};

export function DayDetailPanel({ info, hours, personalResonance, scoredHours }: DayDetailPanelProps) {
  if (!info) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full min-h-[400px]">
          <p className="text-muted-foreground text-center">
            เลือกวันจากปฏิทิน<br/>เพื่อดูรายละเอียด
          </p>
        </CardContent>
      </Card>
    );
  }

  const ratingBadge = RATING_BADGES[info.rating];

  return (
    <ScrollArea className="h-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {info.solarDate.day}/{info.solarDate.month}/{info.solarDate.year + 543}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>วันจันทรคติ: {info.lunarDate.monthName}{info.lunarDate.dayName}</span>
            <span>•</span>
            <span className="text-xs">{info.sixtyCycle}</span>
            {info.solarTerm && (
              <>
                <span>•</span>
                <Badge variant="outline" className="text-xs">节气: {info.solarTerm}</Badge>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Personal Resonance */}
          {personalResonance && (
            <>
              <PersonalResonancePanel resonance={personalResonance} />
              <Separator />
            </>
          )}

          {/* Power Score and Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">คะแนนพลัง:</span>
              <span className="text-2xl font-bold">{info.powerScore}</span>
            </div>
            <Badge className={cn("w-full justify-center py-2", ratingBadge.className)}>
              {ratingBadge.label}
            </Badge>
          </div>

          {/* Power Score Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">รายละเอียดคะแนน:</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>ประจำวัน:</span>
                <span className={cn(info.powerScoreBreakdown.dayOfficer >= 0 ? "text-green-600" : "text-red-600")}>
                  {info.powerScoreBreakdown.dayOfficer > 0 ? "+" : ""}{info.powerScoreBreakdown.dayOfficer}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ดาวเหลือง/ดำ:</span>
                <span className={cn(info.powerScoreBreakdown.yellowBlackStar >= 0 ? "text-green-600" : "text-red-600")}>
                  {info.powerScoreBreakdown.yellowBlackStar > 0 ? "+" : ""}{info.powerScoreBreakdown.yellowBlackStar}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ดาว 28:</span>
                <span className={cn(info.powerScoreBreakdown.constellation28 >= 0 ? "text-green-600" : "text-red-600")}>
                  {info.powerScoreBreakdown.constellation28 > 0 ? "+" : ""}{info.powerScoreBreakdown.constellation28}
                </span>
              </div>
              <div className="flex justify-between">
                <span>เทพเจ้า:</span>
                <span className={cn(info.powerScoreBreakdown.gods >= 0 ? "text-green-600" : "text-red-600")}>
                  {info.powerScoreBreakdown.gods > 0 ? "+" : ""}{info.powerScoreBreakdown.gods}
                </span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-medium">
                <span>รวม:</span>
                <span className={cn(info.powerScoreBreakdown.total >= 0 ? "text-green-600" : "text-red-600")}>
                  {info.powerScoreBreakdown.total > 0 ? "+" : ""}{info.powerScoreBreakdown.total}
                </span>
              </div>
            </div>
          </div>

          {/* XKDG Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">XKDG (玄空大卦):</h4>
            <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <div className="text-xs text-muted-foreground">วันหลัก</div>
              <div className="font-medium">{info.xkdg.sixtyCycle}</div>
              <div className="text-xs text-muted-foreground mt-1">
                ซำ{info.xkdg.periodGroupName} (Period {info.xkdg.periodGroup})
              </div>
            </div>
          </div>

          <Separator />

          {/* Main Auspicious/Inauspicious Indicators */}
          <div className="grid grid-cols-1 gap-3">
            <InfoCard
              title="ประจำวัน (Day Officer)"
              nameTh={info.dayOfficer.nameTh}
              auspicious={info.dayOfficer.auspicious}
              meaning={info.dayOfficer.meaning}
            />
            <InfoCard
              title="ดาวเหลือง/ดำ (Yellow/Black Star)"
              nameTh={info.yellowBlackStar.nameTh}
              auspicious={info.yellowBlackStar.auspicious}
            />
            <InfoCard
              title="ดาว 28 ประจำวัน"
              nameTh={info.constellation28.nameTh}
              auspicious={info.constellation28.auspicious}
            />
          </div>

          {/* Gods */}
          {info.gods.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">เทพเจ้าประจำวัน:</h4>
                <div className="flex flex-wrap gap-2">
                  {info.gods.map((god, idx) => (
                    <Badge
                      key={idx}
                      variant={god.auspicious ? "default" : "destructive"}
                      className={cn(
                        "text-xs",
                        god.auspicious
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      )}
                    >
                      {god.nameTh}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Recommends and Avoids */}
          {(info.recommends.length > 0 || info.avoids.length > 0) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 gap-4">
                {info.recommends.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-green-700 dark:text-green-400">
                      สิ่งที่ควรทำ (宜):
                    </h4>
                    <ul className="space-y-1">
                      {info.recommends.map((rec, idx) => (
                        <li key={idx} className="text-xs flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{rec.nameTh}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {info.avoids.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-red-700 dark:text-red-400">
                      สิ่งที่ควรหลีกเลี่ยง (忌):
                    </h4>
                    <ul className="space-y-1">
                      {info.avoids.map((avoid, idx) => (
                        <li key={idx} className="text-xs flex items-start gap-2">
                          <span className="text-red-600 mt-0.5">✗</span>
                          <span>{avoid.nameTh}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Hour Pillars */}
          {scoredHours && scoredHours.length > 0 ? (
            <>
              <Separator />
              <HoursView hours={scoredHours} />
            </>
          ) : hours.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">ช่วงเวลามงคล:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {hours.map((hour, idx) => (
                    <HourBadge key={idx} hour={hour} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Hint if no profile */}
          {!personalResonance && !scoredHours && (
            <>
              <Separator />
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-sm text-muted-foreground">
                  เลือก profile เพื่อดูความเข้ากันส่วนตัว + คะแนนช่วงเวลา
                </p>
              </div>
            </>
          )}

          {/* Summary */}
          {info.summary && (
            <>
              <Separator />
              <div className="text-sm text-muted-foreground">
                {info.summary}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ScrollArea>
  );
}

function InfoCard({
  title,
  nameTh,
  auspicious,
  meaning
}: {
  title: string;
  nameTh: string;
  auspicious: boolean;
  meaning?: string;
}) {
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      auspicious
        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
    )}>
      <div className="text-xs text-muted-foreground mb-1">{title}</div>
      <div className="font-medium">{nameTh}</div>
      {meaning && (
        <div className="text-xs text-muted-foreground mt-1">{meaning}</div>
      )}
    </div>
  );
}

function HourBadge({ hour }: { hour: TongShuHour }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "justify-start text-xs py-2 h-auto",
        hour.auspicious
          ? "border-green-500 text-green-700 dark:text-green-400"
          : "border-muted-foreground text-muted-foreground"
      )}
    >
      <div className="flex flex-col items-start gap-0.5">
        <span className="font-medium">{hour.nameTh}</span>
        <span className="text-[10px] opacity-75">{hour.timeRange}</span>
        <span className="text-[10px] opacity-75">{hour.sixtyCycle}</span>
      </div>
    </Badge>
  );
}
