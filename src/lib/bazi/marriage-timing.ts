/**
 * Marriage Timing Analysis (วิเคราะห์ช่วงเวลาการแต่งงาน)
 *
 * สแกน大运 (10-year luck pillars) เพื่อหาช่วงเวลาที่มีแนวโน้มสูงสำหรับการแต่งงาน
 * โดยดูจากการปรากฏตัวของดาวคู่ (spouse star) และปฏิสัมพันธ์กับคู่สมรส (spouse palace)
 *
 * ⚠️ หมายเหตุสำคัญ - ความแม่นยำของช่วงเวลา:
 * - ช่วงอายุของ大运 คำนวณจากชั่วโมงเกิด (birth hour)
 * - ถ้าไม่ทราบเวลาเกิด → startAge อาจคลาดเคลื่อน ~10 ปี
 * - ในกรณีนี้ จะ mark เป็น "best-effort" และแจ้งให้ผู้ใช้ทราบ
 *
 * ⚠️ หมายเหตุสำคัญ - ขอบเขต:
 * - v2: สแกนทั้ง大运 (decade pillars) และ流年 (annual pillars)
 * - 流年 scan range: currentYear - 3 ถึง currentYear + 8 (12 ปี)
 * - การอ่านเป็นแนวโน้มความน่าจะเป็น ไม่ใช่การฟันธง
 *
 * หลักการตามตำรา:
 * - 大运 stem เป็นดาวคู่ (财 สำหรับชาย / 官杀 สำหรับหญิง) → โอกาสเจอคู่สูง
 * - 大运 branch = day branch (spouse palace) → ความสัมพันธ์เข้ามา
 * - 大运 branch หกธรรม (六合) กับ day branch → ดึงดูดคู่
 * - 大运 branch ชง (冲) กับ day branch → การเปลี่ยนแปลง/ไม่สงบ (trigger แต่ง/หย่า)
 * - 大运 branch สามธรรม (三合) กับ day branch → ความกลมกลืน
 */

import type { Profile } from "../../types/profile";
import type { BaZiChart } from "./types";
import type { LuckAnalysis } from "../../types/bazi-luck";
import type { TenGodName } from "../../types/bazi-gods-stars";
import type { BranchName } from "./three-harmony";
import { getSpouseStar } from "./six-relatives";
import { detectInteractionBetween } from "./interactions";
import { detectThreeHarmony } from "./three-harmony";
import { getTenGod } from "./ten-gods";
import { SolarDay } from "tyme4ts";

/**
 * ประเภทของช่วงเวลาการแต่งงาน (Marriage Window Type)
 */
export type MarriageWindowType =
  | "spouse_star_stem"       // stem เป็นดาวคู่
  | "spouse_palace_branch"   // branch = day branch (spouse palace)
  | "spouse_palace_combined" // branch หกธรรม/สามธรรม กับ day branch
  | "spouse_palace_clashed"; // branch ชง กับ day branch

/**
 * ช่วงเวลาการแต่งงาน (Marriage Window)
 */
export interface MarriageWindow {
  /** ประเภทของสัญญาณ */
  type: MarriageWindowType;
  /** ที่มาของช่วงเวลา */
  source: "decade" | "annual";
  /** index ของ luck pillar (0-7) — มีค่าเฉพาะ decade windows */
  pillarIndex?: number;
  /** ปี ค.ศ. — มีค่าเฉพาะ annual windows */
  year?: number;
  /** ช่วงอายุ เช่น "25-34" — มีค่าเฉพาะ decade windows */
  ageRange?: string;
  /** คำอธิบายสัญญาณภาษาไทย */
  signal: string;
}

/**
 * ระดับความน่าเชื่อถือของ timing
 */
export type TimingReliability = "reliable" | "best-effort";

/**
 * ผลวิเคราะห์ช่วงเวลาการแต่งงาน
 */
export interface MarriageTimingAnalysis {
  /** ช่วงเวลาที่พบ (จาก大运 + 流年) */
  windows: MarriageWindow[];
  /** ช่วงเวลาจาก大运เท่านั้น (subset ของ windows) — convenience สำหรับ callers ที่ต้องการ只要大运 */
  decadeWindows: MarriageWindow[];
  /** ช่วงเวลาจาก流年เท่านั้น (subset ของ windows) — NEW */
  annualWindows: MarriageWindow[];
  /** ทราบเวลาเกิดหรือไม่ */
  birthTimeKnown: boolean;
  /** ระดับความน่าเชื่อถือของ timing */
  timingReliability: TimingReliability;
  /** หมายเหตุเกี่ยวกับความน่าเชื่อถือ (ภาษาไทย) */
  reliabilityNote: string;
  /** การอ่านแบบรวม (ภาษาไทย) — ครอบคลุมทั้ง decade และ annual */
  reading: string;
}

/**
 * แปลง TenGodName → ชื่อไทย
 */
function getTenGodThai(name: TenGodName): string {
  const tenGodThai: Record<string, string> = {
    "偏财": "ปาฬะเงินรอง",
    "正财": "เงินหลัก",
    "七杀": "ดาวฆ่า",
    "正官": "ดาวอำมาตย์",
  };
  return tenGodThai[name] || name;
}

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
 * คำนวณ annual pillar (流年) สำหรับปีที่กำหนด
 *
 * @param year - ค.ศ. (เช่น 2026)
 * @param chart - BaZi chart (ต้องมี dayMaster)
 * @returns { year, sixtyCycleName, stem: {name, element, yinYang}, branch: {name, element}, tenGod }
 */
function computeAnnualPillar(year: number, chart: BaZiChart): {
  year: number;
  sixtyCycleName: string;
  stem: { name: string; element: "木" | "火" | "土" | "金" | "水"; yinYang: "阳" | "阴"; };
  branch: { name: string; element: "木" | "火" | "土" | "金" | "水"; };
  tenGod: string;
} {
  // คำนวณ sixty cycle ของปี (ใช้ month=6 day=15 เพื่อหลีกเลี่ยง edge case ของ Li Chun)
  const yearCycle = SolarDay.fromYmd(year, 6, 15)
    .getLunarDay()
    .getLunarMonth()
    .getLunarYear()
    .getSixtyCycle();

  const yearCycleName = yearCycle.getName();
  const { stem, branch } = parseSixtyCycle(yearCycleName);

  // คำนวณ polarity ของ year stem
  const yinYang: "阳" | "阴" = (["甲", "丙", "戊", "庚", "壬"].includes(stem.name)) ? "阳" : "阴";

  // คำนวณ 10 God ของ year stem เทียบ day master
  const tenGod = getTenGod(
    { element: chart.dayMaster.element, yinYang: chart.dayMaster.yinYang },
    { element: stem.element, yinYang }
  );

  return {
    year,
    sixtyCycleName: yearCycleName,
    stem: { name: stem.name, element: stem.element, yinYang },
    branch: { name: branch.name, element: branch.element },
    tenGod,
  };
}

/**
 * สแกน大运และ流年เพื่อหาช่วงเวลาการแต่งงาน
 *
 * @param luck - ผลวิเคราะห์ luck pillars
 * @param profile - ข้อมูลผู้ใช้
 * @param chart - BaZi chart
 * @param currentYear - ปีปัจจุบัน (ค.ศ.) สำหรับ scan 流年
 * @returns MarriageTimingAnalysis
 *
 * @example
 * const luck = analyzeLuck(profile, chart, 2026);
 * const marriageTiming = scanMarriageWindows(luck, profile, chart, 2026);
 * console.log(marriageTiming.windows); // [{ type: "spouse_star_stem", source: "decade", pillarIndex: 2, ageRange: "33-42", signal: "..." }, { type: "...", source: "annual", year: 2025, signal: "..." }]
 */
export function scanMarriageWindows(
  luck: LuckAnalysis,
  profile: Profile,
  chart: BaZiChart,
  currentYear: number
): MarriageTimingAnalysis {
  const decadeWindows: MarriageWindow[] = [];
  const annualWindows: MarriageWindow[] = [];
  const gender = profile.gender;
  const spousePalaceBranch = chart.day.branch.name;

  // 1. หาดาวคู่ตามเพศ
  const spouseStars = getSpouseStar(gender);

  // 2. สแกน大运 (decade pillars)
  for (const pillar of luck.pillars) {
    if (!pillar) continue;

    const pillarIndex = pillar.index;
    const ageRange = `${pillar.startAge}-${pillar.endAge}`;

    // 2.1 ตรวจสอบ spouse star stem
    if (pillar.tenGod && spouseStars.includes(pillar.tenGod as TenGodName)) {
      decadeWindows.push({
        type: "spouse_star_stem",
        source: "decade",
        pillarIndex,
        ageRange,
        signal: `大运 stem เป็น${getTenGodThai(pillar.tenGod as TenGodName)} (ดาวคู่) - ช่วงอายุ ${ageRange} มีแนวโน้มเจอคู่สูง`,
      });
    }

    // 2.2 ตรวจสอบ spouse palace branch (ตรงกัน)
    if (pillar.branch.name === spousePalaceBranch) {
      decadeWindows.push({
        type: "spouse_palace_branch",
        source: "decade",
        pillarIndex,
        ageRange,
        signal: `大运 branch = คู่สมรส (${spousePalaceBranch}) - ช่วงอายุ ${ageRange} ความสัมพันธ์เข้ามาแรง`,
      });
    }

    // 2.3 ตรวจสอบ interaction ระหว่าง pillar branch กับ spouse palace
    const interaction = detectInteractionBetween(pillar.branch.name, spousePalaceBranch);

    if (interaction === "冲") {
      // Clash - การเปลี่ยนแปลง/ไม่สงบ (trigger แต่ง/หย่า)
      decadeWindows.push({
        type: "spouse_palace_clashed",
        source: "decade",
        pillarIndex,
        ageRange,
        signal: `大运 branch (${pillar.branch.name}) ชงกับคู่สมรส (${spousePalaceBranch}) - ช่วงอายุ ${ageRange} มีการเปลี่ยนแปลงในชีวิตคู่`,
      });
    } else if (interaction === "合") {
      // Six Harmony - ดึงดูด
      decadeWindows.push({
        type: "spouse_palace_combined",
        source: "decade",
        pillarIndex,
        ageRange,
        signal: `大运 branch (${pillar.branch.name}) หกธรรมกับคู่สมรส (${spousePalaceBranch}) - ช่วงอายุ ${ageRange} ถูกดึงดูดคู่`,
      });
    }

    // 2.4 ตรวจสอบ Three Harmony (สามธรรม)
    const threeHarmonyResult = detectThreeHarmony([pillar.branch.name as BranchName, spousePalaceBranch as BranchName]);
    if (threeHarmonyResult.found && threeHarmonyResult.frame) {
      decadeWindows.push({
        type: "spouse_palace_combined",
        source: "decade",
        pillarIndex,
        ageRange,
        signal: `大运 branch (${pillar.branch.name}) + คู่สมรส (${spousePalaceBranch}) สามธรรม (${threeHarmonyResult.frame}) - ช่วงอายุ ${ageRange} ความกลมกลืนในความสัมพันธ์`,
      });
    }
  }

  // 3. สแกน流年 (annual pillars) - 12 ปี (currentYear - 3 ถึง currentYear + 8)
  const startYear = currentYear - 3;
  const endYear = currentYear + 8;

  for (let year = startYear; year <= endYear; year++) {
    const annualPillar = computeAnnualPillar(year, chart);

    // 3.1 ตรวจสอบ spouse star stem
    if (spouseStars.includes(annualPillar.tenGod as TenGodName)) {
      annualWindows.push({
        type: "spouse_star_stem",
        source: "annual",
        year,
        signal: `流年 ${year} stem เป็น${getTenGodThai(annualPillar.tenGod as TenGodName)} (ดาวคู่) - มีแนวโน้มเจอคู่สูง`,
      });
    }

    // 3.2 ตรวจสอบ spouse palace branch (ตรงกัน)
    if (annualPillar.branch.name === spousePalaceBranch) {
      annualWindows.push({
        type: "spouse_palace_branch",
        source: "annual",
        year,
        signal: `流年 ${year} branch = คู่สมรส (${spousePalaceBranch}) - ความสัมพันธ์เข้ามาแรง`,
      });
    }

    // 3.3 ตรวจสอบ interaction ระหว่าง annual branch กับ spouse palace
    const interaction = detectInteractionBetween(annualPillar.branch.name, spousePalaceBranch);

    if (interaction === "冲") {
      // Clash - การเปลี่ยนแปลง/ไม่สงบ (trigger แต่ง/หย่า)
      annualWindows.push({
        type: "spouse_palace_clashed",
        source: "annual",
        year,
        signal: `流年 ${year} branch (${annualPillar.branch.name}) ชงกับคู่สมรส (${spousePalaceBranch}) - มีการเปลี่ยนแปลงในชีวิตคู่`,
      });
    } else if (interaction === "合") {
      // Six Harmony - ดึงดูด
      annualWindows.push({
        type: "spouse_palace_combined",
        source: "annual",
        year,
        signal: `流年 ${year} branch (${annualPillar.branch.name}) หกธรรมกับคู่สมรส (${spousePalaceBranch}) - ถูกดึงดูดคู่`,
      });
    }

    // 3.4 ตรวจสอบ Three Harmony (สามธรรม)
    const threeHarmonyResult = detectThreeHarmony([annualPillar.branch.name as BranchName, spousePalaceBranch as BranchName]);
    if (threeHarmonyResult.found && threeHarmonyResult.frame) {
      annualWindows.push({
        type: "spouse_palace_combined",
        source: "annual",
        year,
        signal: `流年 ${year} branch (${annualPillar.branch.name}) + คู่สมรส (${spousePalaceBranch}) สามธรรม (${threeHarmonyResult.frame}) - ความกลมกลืนในความสัมพันธ์`,
      });
    }
  }

  // 4. รวม windows (decade + annual)
  const windows: MarriageWindow[] = [...decadeWindows, ...annualWindows];

  // 5. กำหนด timing reliability
  const birthTimeKnown = profile.birthTimeKnown === "known";
  const timingReliability: TimingReliability = birthTimeKnown ? "reliable" : "best-effort";

  // 6. เขียน reliability note
  let reliabilityNote = "";
  if (timingReliability === "reliable") {
    reliabilityNote = "ช่วงเวลาอายุ大运คำนวณจากวันเวลาเกิดที่ระบุ - ความแม่นยำสูง";
  } else {
    reliabilityNote = "ช่วงเวลาอายุ大运อาจคลาดเคลื่อน ~10 ปี เนื่องจากไม่ทราบเวลาเกิด - ใช้เป็นแนวทางโดยประมาณ";
  }

  // 7. เขียน reading (แบบ probabilistic ไม่ฟันธง) - ครอบคลุมทั้ง decade และ annual
  let reading = "";

  const hasDecadeWindows = decadeWindows.length > 0;
  const hasAnnualWindows = annualWindows.length > 0;

  if (!hasDecadeWindows && !hasAnnualWindows) {
    reading = "ไม่พบสัญญาณชัดเจนจาก大运 (decade luck pillars) หรือ流年 (annual luck pillars) ที่บ่งชี้การแต่งงานในช่วงที่ตรวจสอบ";
  } else {
    const parts: string[] = [];

    // เรียงลำดับ decade windows ตาม pillar index
    if (hasDecadeWindows) {
      const sortedDecadeWindows = [...decadeWindows].sort((a, b) => (a.pillarIndex || 0) - (b.pillarIndex || 0));

      const decadeDescriptions = sortedDecadeWindows.map((w) => {
        const ageText = `อายุ ${w.ageRange}`;
        return `- ${ageText}: ${w.signal}`;
      });

      parts.push(`พบสัญญาณจาก大运 (decade luck pillars) ${sortedDecadeWindows.length} ช่วง:\n${decadeDescriptions.join("\n")}`);
    }

    // เรียงลำดับ annual windows ตามปี
    if (hasAnnualWindows) {
      const sortedAnnualWindows = [...annualWindows].sort((a, b) => (a.year || 0) - (b.year || 0));

      // Highlight ปีที่ใกล้ currentYear พิเศษ
      const currentYearWindows = sortedAnnualWindows.filter(w => w.year === currentYear);
      const nearCurrentYearWindows = sortedAnnualWindows.filter(w => w.year && w.year >= currentYear - 1 && w.year <= currentYear + 2);
      const otherAnnualWindows = sortedAnnualWindows.filter(w => w.year && w.year < currentYear - 1 || w.year && w.year > currentYear + 2);

      const annualDescriptions: string[] = [];

      if (currentYearWindows.length > 0) {
        const currentYearDescriptions = currentYearWindows.map((w) => {
          return `- ปี ${w.year}: ${w.signal}`;
        });
        annualDescriptions.push(`ปีปัจจุบัน (${currentYear}):\n${currentYearDescriptions.join("\n")}`);
      }

      if (nearCurrentYearWindows.length > 0) {
        const nearDescriptions = nearCurrentYearWindows.map((w) => {
          return `- ปี ${w.year}: ${w.signal}`;
        });
        annualDescriptions.push(`ใกล้ปีปัจจุบัน:\n${nearDescriptions.join("\n")}`);
      }

      if (otherAnnualWindows.length > 0) {
        const otherDescriptions = otherAnnualWindows.map((w) => {
          return `- ปี ${w.year}: ${w.signal}`;
        });
        annualDescriptions.push(`ปีอื่นๆ ในช่วงที่ตรวจสอบ:\n${otherDescriptions.join("\n")}`);
      }

      parts.push(`พบสัญญาณจาก流年 (annual luck pillars) ${sortedAnnualWindows.length} ปี:\n${annualDescriptions.join("\n\n")}`);
    }

    reading = parts.join("\n\n");
    reading += "\n\nหมายเหตุ: การอ่านเป็นแนวโน้มความน่าจะเป็น ใช้เป็นแนวทางพิจารณาเท่านั้น และยังไม่รวมเดือน (月运) ซึ่งเป็น trigger ที่แม่นยำกว่า";
  }

  return {
    windows,
    decadeWindows,
    annualWindows,
    birthTimeKnown,
    timingReliability,
    reliabilityNote,
    reading,
  };
}
