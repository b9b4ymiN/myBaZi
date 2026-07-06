/**
 * Romance/Marriage Stars (神煞) - ดาวความรักและการแต่งงาน
 *
 * Classical 子平 (Ziping) ใช้ดาวเหล่านี้สำหรับการอ่านความสัมพันธ์:
 * - 红鸾 (Red Phoenix) — โอกาสความรัก/การแต่งงานดี
 * - 天喜 (Heavenly Joy) — ความสุขในวิวาห์
 * - 孤辰 (Solitary) — โอกาสแฝงตัวคนเดียว (กระทบชาย)
 * - 寡宿 (Widow) — โอกาสแฝงอยู่โดดเดี่ยว (กระทบหญิง)
 *
 * DERIVATION: ดาวทั้งหมด derived จาก YEAR BRANCH (年支) ตามตำรา 子ปัจจุบัน
 *              บางโรงเรียนใช้ DAY BRANCH — ที่นี่ใช้ YEAR BRANCH (orthodox 子平)
 *
 * GENDER RELEVANCE: 红鸾/天喜 มีผลทั้งสองเพศ | 孤辰 กระทบชาย | 寡宿 กระทบหญิง
 *
 * ⚠️ DUTY-OF-CARE: 孤辰/寡宿 present ≠ "จะอยู่คนเดียว" — แค่สัญญาณแฝง
 *    frame เป็น "โอกาสแฝง" (probabilistic tendency) ไม่ใช่ deterministic doom
 */

import type { BaZiChart } from "./types";
import type { Gender } from "../../types/profile";

/**
 * ชื่อ地支 (Earthly Branch) ทั้ง 12 ตัว
 */
type BranchName = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";

/**
 * ข้อมูลดาวความรัก/แต่งงานแต่ละตัว
 */
export interface RomanceStarInfo {
  /** ชื่อดาว (จีน) — 红鸾, 天喜, 孤辰, 寡宿 */
  name: string;
  /** ชื่อดาว (ไทย) */
  nameTh: string;
  /** ชื่อ branch ที่ดาวนี้ map ถึงสำหรับ year branch ของ chart นี้ */
  starBranch: string;
  /** true ถ้า starBranch ปรากฏใน chart (year/month/day/hour branches) */
  present: boolean;
  /** ตำแหน่งที่พบ (เมื่อ present === true) — อาจมีหลายตำแหน่ง */
  positions: Array<"year" | "month" | "day" | "hour">;
  /** เพศที่ดาวนี้กระทบตามตำรา — 红鸾/天喜=ทั้งคู่, 孤辰=ชาย, 寡宿=หญิง */
  affects: "both" | "male" | "female";
  /** ความหมายสั้นๆ (ไทย) — duty-of-care framing */
  meaning: string;
}

/**
 * ผลวิเคราห์ดาวความรัก/แต่งงานทั้งหมด
 */
export interface RomanceStarsAnalysis {
  /** ทั้ง 4 ดาว — present flag บอกว่าพบใน chart หรือไม่ */
  stars: RomanceStarInfo[];
  /** เฉพาะดาวที่เกี่ยวข้องกับเพศนี้ — 红鸾/天喜 always; 孤ช้า only male; 寡宿 only female */
  relevantForGender: RomanceStarInfo[];
  /** คำอ่านสรุป (ไทย) — probabilistic, duty-of-care */
  reading: string;
}

/**
 * TABLE 1: 红鸾 (Red Phoenix) — derived from YEAR branch
 *
 * Classical 子平 table: map แต่ละ year branch → 红鸾 star branch
 *
 * | 年支 | 子 | 丑 | 寅 | 卯 | 辰 | 巳 | 午 | 未 | 申 | 酉 | 戌 | 亥 |
 * | 红鸾 | 卯 | 寅 | 丑 | 子 | 亥 | 戌 | 酉 | 申 | 未 | 午 | 巳 | 辰 |
 */
const HONG_LUAN_MAP: Record<BranchName, BranchName> = {
  子: "卯",  // 子 → 卯
  丑: "寅",  // 丑 → 寅
  寅: "丑",  // 寅 → 丑
  卯: "子",  // 卯 → 子
  辰: "亥",  // 辰 → 亥
  巳: "戌",  // 巳 → 戌
  午: "酉",  // 午 → 酉
  未: "申",  // 未 → 申
  申: "未",  // 申 → 未
  酉: "午",  // 酉 → 午
  戌: "巳",  // 戌 → 巳
  亥: "辰",  // 亥 → 辰
};

/**
 * TABLE 2: 天喜 (Heavenly Joy) = ตำแหน่ง OPPOSITE 红鸾 (冲)
 *
 * 天喜 = 红鸾 + 6 positions (opposite branch in 12-cycle)
 *
 * | 年支 | 子 | 丑 | 寅 | 卯 | 辰 | 巳 | 午 | 未 | 申 | 酉 | 戌 | 亥 |
 * | 天喜 | 酉 | 申 | 未 | 午 | 巳 | 辰 | 卯 | 寅 | 丑 | 子 | 亥 | 戌 |
 *
 * Verification: for 子 year, 红鸾=卯, 天喜=酉 — 卯 and 酉 are opposites (冲). ✓
 */
const TIAN_XI_MAP: Record<BranchName, BranchName> = {
  子: "酉",  // 子 → 酉 (opposite 卯)
  丑: "申",  // 丑 → 申 (opposite 寅)
  寅: "未",  // 寅 → 未 (opposite 丑)
  卯: "午",  // 卯 → 午 (opposite 子)
  辰: "巳",  // 辰 → 巳 (opposite 亥)
  巳: "辰",  // 巳 → 辰 (opposite 戌)
  午: "卯",  // 午 → 卯 (opposite 酉)
  未: "寅",  // 未 → 寅 (opposite 申)
  申: "丑",  // 申 → 丑 (opposite 未)
  酉: "子",  // 酉 → 子 (opposite 午)
  戌: "亥",  // 戌 → 亥 (opposite 巳)
  亥: "戌",  // 亥 → 戌 (opposite 辰)
};

/**
 * TABLE 3: 孤辰寡宿 (Solitary & Widow) — derived from YEAR branch's seasonal group (三合 season)
 *
 * แบ่งตามกลุ่ม 三合 (3-way harmony) 4 แบบ:
 * - 寅午戌 (Fire/Water) = spring/Wood season
 * - 巳酉丑 (Metal) = autumn/Metal season
 * - 申子辰 (Water) = winter/Water season
 * - 亥卯未 (Wood) = spring/Wood season
 *
 * | Year branch group | 孤辰 (affects male) | 寡宿 (affects female) |
 * |-------------------|---------------------|------------------------|
 * | 寅 卯 辰 (spring/Wood) | 巳 | 丑 |
 * | 巳 午 未 (summer/Fire) | 申 | 辰 |
 * | 申 酉 戌 (autumn/Metal) | 亥 | 未 |
 * | 亥 子 丑 (winter/Water) | 寅 | 戌 |
 */
const GU_CHEN_MAP: Record<BranchName, BranchName> = {
  // Spring group (寅卯辰)
  寅: "巳",
  卯: "巳",
  辰: "巳",
  // Summer group (巳午未)
  巳: "申",
  午: "申",
  未: "申",
  // Autumn group (申酉戌)
  申: "亥",
  酉: "亥",
  戌: "亥",
  // Winter group (亥子丑)
  亥: "寅",
  子: "寅",
  丑: "寅",
};

const GUA_SU_MAP: Record<BranchName, BranchName> = {
  // Spring group (寅卯辰)
  寅: "丑",
  卯: "丑",
  辰: "丑",
  // Summer group (巳午未)
  巳: "辰",
  午: "辰",
  未: "辰",
  // Autumn group (申酉戌)
  申: "未",
  酉: "未",
  戌: "未",
  // Winter group (亥子丑)
  亥: "戌",
  子: "戌",
  丑: "戌",
};

/**
 * หาดาวความรัก/แต่งงานทั้ง 4 ดวงสำหรับ chart หนึ่ง
 *
 * @param chart - BaZiChart ที่ต้องการวิเคราะห์
 * @param gender - เพศของคนเจ้าของดวง ("male" หรือ "female")
 * @returns RomanceStarsAnalysis - ข้อมูลทั้ง 4 ดาว + การอ่าน
 *
 * @example
 * const chart = calculateBaZi(profile);
 * const result = analyzeRomanceStars(chart, "male");
 * console.log(result.relevantForGender); // ดาวที่เกี่ยวข้องกับชาย (红鸾+天喜+孤辰)
 * console.log(result.reading); // คำอ่านสรุป
 */
export function analyzeRomanceStars(
  chart: BaZiChart,
  gender: Gender
): RomanceStarsAnalysis {
  const yearBranch = chart.year.branch.name as BranchName;

  // รวบรวม branches ทั้งหมดใน chart
  const chartBranches: Array<{ name: string; position: "year" | "month" | "day" | "hour" }> = [
    { name: chart.year.branch.name, position: "year" },
    { name: chart.month.branch.name, position: "month" },
    { name: chart.day.branch.name, position: "day" },
  ];

  if (chart.hour) {
    chartBranches.push({ name: chart.hour.branch.name, position: "hour" });
  }

  // Helper: ตรวจว่า starBranch ปรากฏใน chart ที่ตำแหน่งไหนบ้าง
  function findStarBranchPositions(starBranch: string): Array<"year" | "month" | "day" | "hour"> {
    const positions: Array<"year" | "month" | "day" | "hour"> = [];
    for (const b of chartBranches) {
      if (b.name === starBranch) {
        positions.push(b.position);
      }
    }
    return positions;
  }

  // 1. 红鸾 (Red Phoenix)
  const hongLuanBranch = HONG_LUAN_MAP[yearBranch];
  const hongLuanPositions = findStarBranchPositions(hongLuanBranch);

  // 2. 天喜 (Heavenly Joy)
  const tianXiBranch = TIAN_XI_MAP[yearBranch];
  const tianXiPositions = findStarBranchPositions(tianXiBranch);

  // 3. 孤辰 (Solitary — affects male)
  const guChenBranch = GU_CHEN_MAP[yearBranch];
  const guChenPositions = findStarBranchPositions(guChenBranch);

  // 4. 寡宿 (Widow — affects female)
  const guaSuBranch = GUA_SU_MAP[yearBranch];
  const guaSuPositions = findStarBranchPositions(guaSuBranch);

  // สร้าง star info ทั้ง 4 ดวง
  const stars: RomanceStarInfo[] = [
    {
      name: "红鸾",
      nameTh: "红鸾 (นกฟ้าแดง)",
      starBranch: hongLuanBranch,
      present: hongLuanPositions.length > 0,
      positions: hongLuanPositions,
      affects: "both",
      meaning: "ดาวแต่งงาน/โอกาสความรักดี — เมื่อปรากฏบ่งชี้จังหวะความสัมพันธ์ที่ดี",
    },
    {
      name: "天喜",
      nameTh: "天喜 (ความปีติยินดี)",
      starBranch: tianXiBranch,
      present: tianXiPositions.length > 0,
      positions: tianXiPositions,
      affects: "both",
      meaning: "ดาวมงคลวิวาห์/ความสุข — เมื่อปรากฏบ่งชี้ความสุขในความสัมพันธ์",
    },
    {
      name: "孤辰",
      nameTh: "孤辰 (ดาวเดียวดาย)",
      starBranch: guChenBranch,
      present: guChenPositions.length > 0,
      positions: guChenPositions,
      affects: "male",
      meaning: "โอกาสแฝงตัวคนเดียว (กระทบชาย) — ไม่ใช่ doom sentence",
    },
    {
      name: "寡宿",
      nameTh: "寡宿 (ดาวอยู่โดดเดี่ยว)",
      starBranch: guaSuBranch,
      present: guaSuPositions.length > 0,
      positions: guaSuPositions,
      affects: "female",
      meaning: "โอกาสแฝงอยู่โดดเดี่ยว (กระทบหญิง) — ไม่ใช่ doom sentence",
    },
  ];

  // Filter: เฉพาะดาวที่เกี่ยวข้องกับเพศนี้
  const relevantForGender = stars.filter((star) => {
    if (star.affects === "both") return true;
    if (gender === "male" && star.affects === "male") return true;
    if (gender === "female" && star.affects === "female") return true;
    return false;
  });

  // สร้างคำอ่านสรุป (Thai, duty-of-care)
  const reading = buildReading(relevantForGender);

  return {
    stars,
    relevantForGender,
    reading,
  };
}

/**
 * สร้างคำอ่านสรุป (duty-of-care, probabilistic)
 */
function buildReading(stars: RomanceStarInfo[]): string {
  const presentStars = stars.filter((s) => s.present);
  const absentStars = stars.filter((s) => !s.present);

  // กรณีไม่มีดาวเลย
  if (presentStars.length === 0) {
    return (
      `ไม่พบดาวความรัก/แต่งงานหลักในดวง (红鸾/天喜) ` +
      `— ความสัมพันธ์ไม่ได้ขึ้นอยู่กับดาวเหล่านี้เท่านั้น`
    );
  }

  // หาดาวมงคล vs ดาวที่ควรระวัง
  const auspiciousStars = presentStars.filter((s) => s.name === "红鸾" || s.name === "天喜");
  const cautiousStars = presentStars.filter((s) => s.name === "孤辰" || s.name === "寡宿");

  let reading = "";

  // ดาวมงคล
  if (auspiciousStars.length > 0) {
    reading += "ดาวมงคล: ";
    reading += auspiciousStars.map((s) => s.nameTh).join("、");
    reading += "\n\n";
    reading += "มีสัญญาณบวกเรื่องความสัมพันธ์ — ";
    reading += "红鸾 และ 天喜 เป็นดาวที่ช่วยสนับสนุนความสุขในวิวาห์";
    if (auspiciousStars.some((s) => s.positions.includes("day"))) {
      reading += " โดยเฉพาะถ้าปรากฏที่ Day Pillar ถือว่าเด่น";
    }
  }

  // ดาวที่ควรระวัง (孤辰/寡宿)
  if (cautiousStars.length > 0) {
    if (reading) reading += "\n\n";
    reading += "สัญญาณที่ควรระวัง: ";
    reading += cautiousStars.map((s) => s.nameTh).join("、");
    reading += "\n\n";
    reading += "มีสัญญาณแฝงของการอยู่เป็นคนเดียว — แต่ไม่ใช่ doom sentence";
    reading += "\n";
    reading += "แนะนำ: สร้างความสัมพันธ์โดยสมัครใจ ลงทุนในการเชื่อมต่อกับผู้อื่น";
    reading += "\n";
    reading += "ดาวเหล่านี้คือแนวโน้ม ไม่ใช่ชะตากรรมที่พ้นมิได้";
  }

  // เติมดาวที่ไม่ปรากฏ (ถ้ามี)
  if (absentStars.length > 0 && absentStars.some((s) => s.name === "红鸾" || s.name === "天喜")) {
    if (reading) reading += "\n\n";
    reading += "หมายเหตุ: ";
    reading += absentStars
      .filter((s) => s.name === "红鸾" || s.name === "天喜")
      .map((s) => s.nameTh)
      .join("、");
    reading += " ไม่ปรากฏในดวง — แต่ไม่ได้แปลว่าจะไม่มีความสุขในความสัมพันธ์";
  }

  return reading;
}
