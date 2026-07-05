"use client";

import type { Profile } from "@/types/profile";
import type { QiMenChart } from "@/types/qimen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateBaZi } from "@/lib/bazi/calculate";
import { ELEMENT_THAI } from "@/lib/bazi/types";
import { Info, MapPin } from "lucide-react";

interface DestinyViewProps {
  profile: Profile | null;
  chart: QiMenChart;
}

/**
 * Destiny View component showing how the chart relates to the user's destiny
 */
export function DestinyView({ profile, chart }: DestinyViewProps) {
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            ทำนายด้วยโปรไฟล์ (Destiny Palace)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
            <Info className="w-12 h-12 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium">เลือกโปรไฟล์เพื่อดู Destiny Palace</p>
              <p className="text-sm text-muted-foreground">
                เลือกโปรไฟล์ของคุณเพื่อดูว่า palace ใดในแผนผัง Qi Men ที่ตรงกับ Day Master
                ของคุณ และส่งผลต่อชะตากรรมของคุณอย่างไร
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate BaZi to get Day Master
  const baZi = calculateBaZi(profile);
  const dayMaster = baZi.dayMaster;

  // Find palace with matching heaven stem (simplified Destiny Palace logic)
  // Destiny Palace = palace where heaven stem matches day master element
  const destinyPalace = chart.palaces.find((p) => p.heavenStem === dayMaster.name);

  // Alternative: Find palace with matching element
  const elementMatchPalaces = chart.palaces.filter((p) => {
    const stemElement = getStemElement(p.heavenStem);
    return stemElement === dayMaster.element;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          ทำนายด้วยโปรไฟล์ (Destiny Palace)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">ชื่อ (Name):</span>
            <span className="font-semibold">{profile.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Day Master (日主):</span>
            <Badge variant="outline" className="font-semibold">
              {dayMaster.name} ({ELEMENT_THAI[dayMaster.element]})
            </Badge>
          </div>
        </div>

        {/* Destiny Palace */}
        {destinyPalace ? (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Destiny Palace (ปราสาทชะตา)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Palace ที่天盘 (เส้นท้องฟ้า) ตรงกับ Day Master ของคุณ
                </p>
              </div>
              <Badge className="bg-primary text-primary-foreground">
                Palace {destinyPalace.palaceNumber}
              </Badge>
            </div>

            {/* Palace details */}
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">八卦 (Bagua):</span>
                <span className="font-medium">{destinyPalace.bagua}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">天盘 (Heaven):</span>
                <span className="font-medium">{destinyPalace.heavenStem}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">九星 (Star):</span>
                <span className="font-medium">{destinyPalace.star}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">八门 (Door):</span>
                <span className="font-medium">{destinyPalace.door}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">八神 (Deity):</span>
                <span className="font-medium">{destinyPalace.deity}</span>
              </div>
            </div>

            {/* Interpretation */}
            {destinyPalace.isZhiFu && (
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <span className="font-semibold">值符 (Zhi Fu)</span> — Palace
                  นี้เป็นจุดศูนย์กลางของแผนผัง และตรงกับ Day Master ของคุณ
                  หมายถึงคุณมีความเป็นผู้นำและโชคลาภที่แข็งแกร่ง
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <p className="text-sm text-muted-foreground">
              ไม่พบ palace ที่天盘ตรงกับ Day Master ของคุณในแผนผังนี้
            </p>
            <p className="text-xs text-muted-foreground">
              ลองเปลี่ยนเวลาในแผนผัง หรือดู palace ที่มีธาตุเดียวกัน:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {elementMatchPalaces.map((p) => (
                <Badge key={p.palaceNumber} variant="outline">
                  Palace {p.palaceNumber}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 4 Pillars Summary */}
        <div className="mt-4 pt-4 border-t space-y-2">
          <p className="text-sm font-medium">4 Pillars ของคุณ:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ปี (Year):</span>
              <span className="font-medium">{baZi.year.sixtyCycleName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">เดือน (Month):</span>
              <span className="font-medium">{baZi.month.sixtyCycleName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">วัน (Day):</span>
              <span className="font-medium">{baZi.day.sixtyCycleName}</span>
            </div>
            {baZi.hour && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ชั่วโมง (Hour):</span>
                <span className="font-medium">{baZi.hour.sixtyCycleName}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Get element from stem name (甲=木, 乙=木, 丙=火, 丁=火, 戊=土, 己=土, 庚=金, 辛=金, 壬=水, 癸=水)
 */
function getStemElement(stem: string): "木" | "火" | "土" | "金" | "水" {
  const elementMap: Record<string, "木" | "火" | "土" | "金" | "水"> = {
    甲: "木",
    乙: "木",
    丙: "火",
    丁: "火",
    戊: "土",
    己: "土",
    庚: "金",
    辛: "金",
    壬: "水",
    癸: "水",
  };
  return elementMap[stem] || "木";
}
