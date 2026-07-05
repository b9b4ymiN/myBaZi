/**
 * Luck Pillars (大运) + Annual (流年) + Transit Calculator
 *
 * คำนวณ大运 (10-year luck pillars) และ流年 (annual fortune) จาก BaZi chart
 * ใช้ tyme4ts ChildLimit API
 */

import type { Profile } from "@/types/profile";
import type { BaZiChart } from "./types";
import type { LuckAnalysis, LuckPillar, AnnualFortune } from "../../types/bazi-luck";
import { toBaZiTime, toBaZiTimeUnknown } from "./time";
import { getTenGod } from "./ten-gods";
import { SolarTime, ChildLimit, SolarDay } from 'tyme4ts';

/**
 * Map ชื่อ天干 → ธาตุ (五行)
 */
const STEM_ELEMENT: Record<string, "木" | "火" | "土" | "金" | "水"> = {
  "甲": "木", "乙": "木",
  "丙": "火", "丁": "火",
  "戊": "土", "己": "土",
  "庚": "金", "辛": "金",
  "壬": "水", "癸": "水",
};

/**
 * Map ชื่อ地支 → ธาตุ (五行)
 */
const BRANCH_ELEMENT: Record<string, "木" | "火" | "土" | "金" | "水"> = {
  "寅": "木", "卯": "木",
  "巳": "火", "午": "火",
  "辰": "土", "戌": "土", "丑": "土", "未": "土",
  "申": "金", "酉": "金",
  "亥": "水", "子": "水",
};

/**
 * แปลง SixtyCycle name → stem + branch elements
 *
 * @param sixtyCycleName - เช่น "甲午"
 * @returns { stem: { name, element }, branch: { name, element } }
 */
function parseSixtyCycle(sixtyCycleName: string): {
  stem: { name: string; element: "木" | "火" | "土" | "金" | "水"; };
  branch: { name: string; element: "木" | "火" | "土" | "金" | "水"; };
} {
  const stemName = sixtyCycleName[0];
  const branchName = sixtyCycleName[1];

  const stemElement = STEM_ELEMENT[stemName];
  const branchElement = BRANCH_ELEMENT[branchName];

  return {
    stem: { name: stemName, element: stemElement },
    branch: { name: branchName, element: branchElement },
  };
}

/**
 * คำนวณ Luck Pillars (大运) + Annual (流年) + Transit
 *
 * @param profile - ข้อมูลผู้ใช้ (gender, birthDate, birthTime, timezone)
 * @param chart - BaZi chart (จาก calculateBaZi)
 * @param currentYear - ปีปัจจุบัน (ค.ศ.) - required for SSR safety
 * @returns LuckAnalysis - luck pillars + current pillar + annual fortune + transitions
 *
 * @example
 * const luck = analyzeLuck(profile, chart, 2026);
 * console.log(luck.direction); // "forward"
 * console.log(luck.startAge); // 3
 * console.log(luck.pillars[0].sixtyCycleName); // "甲午"
 */
export function analyzeLuck(
  profile: Profile,
  chart: BaZiChart,
  currentYear: number
): LuckAnalysis {
  // 1. Validate currentYear (SSR safety - ห้ามใช้ new Date() ใน server scope)
  if (!currentYear || currentYear < 1900 || currentYear > 2100) {
    throw new Error(`Invalid currentYear: ${currentYear}. Must provide current year (1900-2100) for SSR safety.`);
  }

  // 2. แปลง timezone → Beijing time
  let baZiTime: { year: number; month: number; day: number; hour: number; minute: number };

  if (profile.birthTimeKnown === 'unknown' || profile.birthTime === null) {
    // ไม่ทราบเวลา → ใช้ 12:00 น.
    baZiTime = toBaZiTimeUnknown(profile.birthDate, profile.timezone);
  } else {
    // ทราบเวลา → แปลง timezone อย่างแม่นยำ
    baZiTime = toBaZiTime(profile.birthDate, profile.birthTime, profile.timezone);
  }

  // 3. ส่ง gender ให้ tyme4ts (1=male, 0=female) — tyme4ts คำนวณ forward/backward
  // เองจาก gender + year-polarity (阴年男/阳年女 = backward, 阳年男/阴年女 = forward)
  // ⚠️ ห้ามส่ง "direction" ที่คำนวณเอง เพราะ fromSolarTime รับ gender ไม่ใช่ direction
  const genderParam = profile.gender === "male" ? 1 : 0;

  // 4. สร้าง SolarTime และ ChildLimit
  const solarTime = SolarTime.fromYmdHms(
    baZiTime.year,
    baZiTime.month,
    baZiTime.day,
    baZiTime.hour,
    baZiTime.minute,
    0
  );
  const childLimit = ChildLimit.fromSolarTime(solarTime, genderParam);

  // 5. หา startAge ของ luck pillar แรก
  const startAge = childLimit.getEndAge();

  // 6. วนลูป 8 luck pillars (10 ปีต่อ pillar)
  const firstDecade = childLimit.getStartDecadeFortune();
  const pillars: LuckPillar[] = [];

  for (let i = 0; i < 8; i++) {
    const sixtyCycle = i === 0 ? firstDecade : firstDecade.next(i);
    const sixtyCycleName = sixtyCycle.getName();
    const { stem, branch } = parseSixtyCycle(sixtyCycleName);
    const pillarStartAge = startAge + (i * 10);
    const pillarEndAge = pillarStartAge + 9;

    // คำนวณ polarity ของ pillar stem จากชื่อ stem (甲丙戊庚壬=阳, 乙丁己辛癸=阴)
    const stemYinYang: "阳" | "阴" = (["甲", "丙", "戊", "庚", "壬"].includes(stem.name)) ? "阳" : "阴";

    // คำนวณ 10 God ของ pillar stem เทียบ day master
    const tenGod = getTenGod(
      { element: chart.dayMaster.element, yinYang: chart.dayMaster.yinYang },
      { element: stem.element, yinYang: stemYinYang }
    );

    pillars.push({
      index: i,
      sixtyCycleName,
      startAge: pillarStartAge,
      endAge: pillarEndAge,
      stem: { name: stem.name, element: stem.element },
      branch: { name: branch.name, element: branch.element },
      tenGod,
      isCurrent: false, // จะ set ภายหลัง
    });
  }

  // 7. หา currentPillar (จาก currentYear)
  const birthYear = parseInt(profile.birthDate.substring(0, 4));
  const currentAge = currentYear - birthYear;
  let currentPillar: LuckPillar | null = null;

  for (const pillar of pillars) {
    if (currentAge >= pillar.startAge && currentAge <= pillar.endAge) {
      pillar.isCurrent = true;
      currentPillar = pillar;
      break;
    }
  }

  // 8. หา currentAnnual (流年 ปีปัจจุบัน)
  const yearCycle = SolarDay.fromYmd(currentYear, 6, 15)
    .getLunarDay()
    .getLunarMonth()
    .getLunarYear()
    .getSixtyCycle();

  const yearCycleName = yearCycle.getName();
  const { stem: yearStem } = parseSixtyCycle(yearCycleName);

  // คำนวณ polarity ของ year stem จากชื่อ stem
  const yearStemYinYang: "阳" | "阴" = (["甲", "丙", "戊", "庚", "壬"].includes(yearStem.name)) ? "阳" : "阴";

  // คำนวณ 10 God ของ year stem เทียบ day master
  const yearTenGod = getTenGod(
    { element: chart.dayMaster.element, yinYang: chart.dayMaster.yinYang },
    { element: yearStem.element, yinYang: yearStemYinYang }
  );

  const currentAnnual: AnnualFortune = {
    year: currentYear,
    sixtyCycleName: yearCycleName,
    tenGod: yearTenGod,
  };

  // 9. หา upcomingTransitions (เสาเปลี่ยน - 3 ครั้งถัดไป)
  const upcomingTransitions: { age: number; pillar: string; yearsAway: number; }[] = [];

  if (currentPillar) {
    // หา pillar ถัดไป 3 อัน
    for (let i = currentPillar.index + 1; i < Math.min(currentPillar.index + 4, 8); i++) {
      const nextPillar = pillars[i];
      const transitionAge = nextPillar.startAge;
      const yearsAway = transitionAge - currentAge;

      upcomingTransitions.push({
        age: transitionAge,
        pillar: nextPillar.sixtyCycleName,
        yearsAway,
      });
    }
  } else if (currentAge < startAge) {
    // ยังไม่ถึง luck pillar แรก - แสดง 3 pillars แรก
    for (let i = 0; i < Math.min(3, 8); i++) {
      const pillar = pillars[i];
      const transitionAge = pillar.startAge;
      const yearsAway = transitionAge - currentAge;

      upcomingTransitions.push({
        age: transitionAge,
        pillar: pillar.sixtyCycleName,
        yearsAway,
      });
    }
  }
  // else: currentAge > endAge ของ pillar สุดท้าย - ไม่มี upcoming transitions

  return {
    direction: childLimit.isForward() ? "forward" : "backward",
    startAge,
    pillars,
    currentPillar,
    currentAnnual,
    upcomingTransitions,
  };
}
