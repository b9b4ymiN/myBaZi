/**
 * XKDG (玄空大卦 / Xuan Kong Da Gua) - Simplified implementation
 * Phase 1.8 - ใช้ period groups (6 ซำ) จาก tyme4ts getTen() API
 *
 * Approach: Simplified (ปลอดภัย 100%)
 * - ใช้ getTen() API ของ tyme4ts เพื่อหา period group (1-6)
 * - ไม่คำนวณ lookup table 60 jiazi → 64 hexagrams เอง (risk ผิดสูง)
 * - Full hexagram support จะเพิ่มใน Phase ถัดไปเมื่อมี reference verified
 */

import type { Profile } from "@/types/profile";
import type { BaZiChart, Pillar } from "./types";
import type { XkdgInfo, XkdgAnalysis } from "@/types/bazi-xkdg";
import { SolarTime, type EightChar } from 'tyme4ts';
import { toBaZiTime, toBaZiTimeUnknown } from './time';

/**
 * Map 6 ซำ (10 stems) → period group (1-6)
 * 甲子=1, 甲戌=2, 甲申=3, 甲午=4, 甲辰=5, 甲寅=6
 */
const TEN_STEMS_TO_PERIOD_GROUP: Record<string, number> = {
  '甲子': 1,
  '甲戌': 2,
  '甲申': 3,
  '甲午': 4,
  '甲辰': 5,
  '甲寅': 6,
};

/**
 * วิเคราะห์ XKDG จาก profile และ BaZi chart
 *
 * @param profile - ข้อมูลผู้ใช้
 * @param chart - BaZi chart ที่คำนวณได้แล้ว
 * @returns XkdgAnalysis - ข้อมูล XKDG ทั้ง 4 pillars
 */
export function analyzeXkdg(profile: Profile, chart: BaZiChart): XkdgAnalysis {
  // สร้าง EightChar ใหม่เพื่อเข้าถึง getTen() API
  const ec = getRawEightChar(profile);

  const year = toXkdgInfo('year', ec.getYear(), chart.year);
  const month = toXkdgInfo('month', ec.getMonth(), chart.month);
  const day = toXkdgInfo('day', ec.getDay(), chart.day);
  const hour = profile.birthTimeKnown === 'known' && profile.birthTime !== null && chart.hour !== null
    ? toXkdgInfo('hour', ec.getHour(), chart.hour)
    : null;

  return {
    year,
    month,
    day,
    hour,
    note: 'Simplified XKDG: ใช้ period groups (6 ซำ) จาก tyme4ts getTen() API ที่แม่นยำ 100% ' +
          'Full hexagram lookup (64 ก้าว) จะเพิ่มใน Phase ถัดไปเมื่อมี reference verified จากตำรา classic XKDG',
  };
}

/**
 * แปลง Pillar + EightChar position → XkdgInfo
 * ใช้ getTen() API เพื่อหา period group ที่แม่นยำ
 *
 * @param position - "year" | "month" | "day" | "hour"
 * @param sixtyCycle - ผลลัพธ์จาก ec.getYear()/getMonth()/getDay()/getHour()
 * @param pillar - Pillar ที่คำนวณไว้แล้ว
 * @returns XkdgInfo
 */
function toXkdgInfo(
  position: "year" | "month" | "day" | "hour",
  sixtyCycle: { getTen(): { getName(): string } }, // tyme4ts getTen() API
  pillar: Pillar
): XkdgInfo {
  // ใช้ getTen() API เพื่อหา 6 ซำ (period group)
  const ten = sixtyCycle.getTen();
  const tenName = ten.getName();

  // Map ซำ → period group (1-6)
  const periodGroup = TEN_STEMS_TO_PERIOD_GROUP[tenName] ?? 1;

  const positionThai = getPositionThai(position);

  return {
    sixtyCycleName: pillar.sixtyCycleName,
    periodGroup,
    periodGroupName: tenName,
    stemElement: pillar.stem.element,
    branchElement: pillar.branch.element,
    description: `${positionThai} ${pillar.sixtyCycleName} (ซำ${tenName}, period ${periodGroup}, ` +
                `stem ${pillar.stem.element}, branch ${pillar.branch.element})`,
  };
}

/**
 * แปลง position เป็นภาษาไทย
 */
function getPositionThai(position: "year" | "month" | "day" | "hour"): string {
  const map = {
    year: "ปีหลัก",
    month: "เดือนหลัก",
    day: "วันหลัก",
    hour: "ชั่วโมงหลัก",
  };
  return map[position];
}

/**
 * ดึง raw EightChar object จาก profile (เหมือนใน calculate.ts)
 * ใช้สำหรับเข้าถึง getTen() API ของ tyme4ts
 *
 * @param profile - ข้อมูลผู้ใช้
 * @returns EightChar - raw object จาก tyme4ts
 */
function getRawEightChar(profile: Profile): EightChar {
  let baZiTime: { year: number; month: number; day: number; hour: number; minute: number };

  if (profile.birthTimeKnown === 'unknown' || profile.birthTime === null) {
    baZiTime = toBaZiTimeUnknown(profile.birthDate, profile.timezone);
  } else {
    baZiTime = toBaZiTime(profile.birthDate, profile.birthTime, profile.timezone);
  }

  const solarTime = SolarTime.fromYmdHms(
    baZiTime.year,
    baZiTime.month,
    baZiTime.day,
    baZiTime.hour,
    baZiTime.minute,
    0
  );

  const lunarHour = solarTime.getLunarHour();
  return lunarHour.getEightChar();
}
