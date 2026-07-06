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
 * - v1: สแกนเฉพาะ大运 (decade pillars) เท่านั้น
 * - 流年 (annual pillars) triggers ยังไม่รวม → เป็น enhancement ในอนาคต
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

/**
 * ประเภทของช่วงเวลาการแต่งงาน (Marriage Window Type)
 */
export type MarriageWindowType =
  | "spouse_star_stem"       // 大运 stem เป็นดาวคู่
  | "spouse_palace_branch"   // 大运 branch = day branch (spouse palace)
  | "spouse_palace_combined" // 大运 branch หกธรรม/สามธรรม กับ day branch
  | "spouse_palace_clashed"; // 大运 branch ชง กับ day branch

/**
 * ช่วงเวลาการแต่งงาน (Marriage Window)
 */
export interface MarriageWindow {
  /** ประเภทของสัญญาณ */
  type: MarriageWindowType;
  /** index ของ luck pillar (0-7) */
  pillarIndex: number;
  /** ช่วงอายุ เช่น "25-34" */
  ageRange: string;
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
  /** ช่วงเวลาที่พบ (จาก大运) */
  windows: MarriageWindow[];
  /** ทราบเวลาเกิดหรือไม่ */
  birthTimeKnown: boolean;
  /** ระดับความน่าเชื่อถือของ timing */
  timingReliability: TimingReliability;
  /** หมายเหตุเกี่ยวกับความน่าเชื่อถือ (ภาษาไทย) */
  reliabilityNote: string;
  /** การอ่านแบบรวม (ภาษาไทย) */
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
 * สแกน大运เพื่อหาช่วงเวลาการแต่งงาน
 *
 * @param luck - ผลวิเคราะห์ luck pillars
 * @param profile - ข้อมูลผู้ใช้
 * @param chart - BaZi chart
 * @returns MarriageTimingAnalysis
 *
 * @example
 * const luck = analyzeLuck(profile, chart, 2026);
 * const marriageTiming = scanMarriageWindows(luck, profile, chart);
 * console.log(marriageTiming.windows); // [{ type: "spouse_star_stem", pillarIndex: 2, ageRange: "33-42", signal: "..." }]
 */
export function scanMarriageWindows(
  luck: LuckAnalysis,
  profile: Profile,
  chart: BaZiChart
): MarriageTimingAnalysis {
  const windows: MarriageWindow[] = [];
  const gender = profile.gender;
  const spousePalaceBranch = chart.day.branch.name;

  // 1. หาดาวคู่ตามเพศ
  const spouseStars = getSpouseStar(gender);

  // 2. สแกนทุก luck pillar
  for (const pillar of luck.pillars) {
    if (!pillar) continue;

    const pillarIndex = pillar.index;
    const ageRange = `${pillar.startAge}-${pillar.endAge}`;

    // 2.1 ตรวจสอบ spouse star stem
    if (pillar.tenGod && spouseStars.includes(pillar.tenGod as TenGodName)) {
      windows.push({
        type: "spouse_star_stem",
        pillarIndex,
        ageRange,
        signal: `大运 stem เป็น${getTenGodThai(pillar.tenGod as TenGodName)} (ดาวคู่) - ช่วงอายุ ${ageRange} มีแนวโน้มเจอคู่สูง`,
      });
    }

    // 2.2 ตรวจสอบ spouse palace branch (ตรงกัน)
    if (pillar.branch.name === spousePalaceBranch) {
      windows.push({
        type: "spouse_palace_branch",
        pillarIndex,
        ageRange,
        signal: `大运 branch = คู่สมรส (${spousePalaceBranch}) - ช่วงอายุ ${ageRange} ความสัมพันธ์เข้ามาแรง`,
      });
    }

    // 2.3 ตรวจสอบ interaction ระหว่าง pillar branch กับ spouse palace
    const interaction = detectInteractionBetween(pillar.branch.name, spousePalaceBranch);

    if (interaction === "冲") {
      // Clash - การเปลี่ยนแปลง/ไม่สงบ (trigger แต่ง/หย่า)
      windows.push({
        type: "spouse_palace_clashed",
        pillarIndex,
        ageRange,
        signal: `大运 branch (${pillar.branch.name}) ชงกับคู่สมรส (${spousePalaceBranch}) - ช่วงอายุ ${ageRange} มีการเปลี่ยนแปลงในชีวิตคู่`,
      });
    } else if (interaction === "合") {
      // Six Harmony - ดึงดูด
      windows.push({
        type: "spouse_palace_combined",
        pillarIndex,
        ageRange,
        signal: `大运 branch (${pillar.branch.name}) หกธรรมกับคู่สมรส (${spousePalaceBranch}) - ช่วงอายุ ${ageRange} ถูกดึงดูดคู่`,
      });
    }

    // 2.4 ตรวจสอบ Three Harmony (สามธรรม)
    const threeHarmonyResult = detectThreeHarmony([pillar.branch.name as BranchName, spousePalaceBranch as BranchName]);
    if (threeHarmonyResult.found && threeHarmonyResult.frame) {
      windows.push({
        type: "spouse_palace_combined",
        pillarIndex,
        ageRange,
        signal: `大运 branch (${pillar.branch.name}) + คู่สมรส (${spousePalaceBranch}) สามธรรม (${threeHarmonyResult.frame}) - ช่วงอายุ ${ageRange} ความกลมกลืนในความสัมพันธ์`,
      });
    }
  }

  // 3. กำหนด timing reliability
  const birthTimeKnown = profile.birthTimeKnown === "known";
  const timingReliability: TimingReliability = birthTimeKnown ? "reliable" : "best-effort";

  // 4. เขียน reliability note
  let reliabilityNote = "";
  if (timingReliability === "reliable") {
    reliabilityNote = "ช่วงเวลาอายุ大运คำนวณจากวันเวลาเกิดที่ระบุ - ความแม่นยำสูง";
  } else {
    reliabilityNote = "ช่วงเวลาอายุ大运อาจคลาดเคลื่อน ~10 ปี เนื่องจากไม่ทราบเวลาเกิด - ใช้เป็นแนวทางโดยประมาณ";
  }

  // 5. เขียน reading (แบบ probabilistic ไม่ฟันธง)
  let reading = "";

  if (windows.length === 0) {
    reading = "ไม่พบสัญญาณชัดเจนจาก大运 (decade luck pillars) ที่บ่งชี้การแต่งงาน แต่อาจมี trigger จาก流年 (annual pillars) ที่ยังไม่รวมในการวิเคราะห์ v1";
  } else {
    const sortedWindows = [...windows].sort((a, b) => a.pillarIndex - b.pillarIndex);

    const windowDescriptions = sortedWindows.map((w) => {
      const ageText = `อายุ ${w.ageRange}`;
      return `- ${ageText}: ${w.signal}`;
    });

    reading = `พบสัญญาณจาก大运 (decade luck pillars) ${sortedWindows.length} ช่วงที่มีแนวโน้มความสัมพันธ์/การแต่งงาน:\n${windowDescriptions.join("\n")}\n\nหมายเหตุ: นี่คือสัญญาณระดับ大运เท่านั้น ยังไม่รวม流年 (annual pillars) ซึ่งเป็น trigger ที่แม่นยำกว่า และการอ่านเป็นแนวโน้มความน่าจะเป็น ไม่ใช่การบอกชัดแน่นอน`;
  }

  return {
    windows,
    birthTimeKnown,
    timingReliability,
    reliabilityNote,
    reading,
  };
}
