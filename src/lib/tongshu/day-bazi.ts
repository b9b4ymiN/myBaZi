/**
 * Day ↔ BaZi linking helpers (TongShu × natal chart)
 *
 * Pure derived helpers that connect a TongShu day (almanac) to the user's
 * natal BaZi pillars. This is the "ลิงค์ปาจื้อกับข้อมูล" layer:
 *   - checkDayVsNatal: ตรวจ 冲/合/害/刑 ของ branch ของวัน กับ 4 สาของดวง
 *     (日冲 = the classic almanac-personal check)
 *   - getPersonalizedRecommends: ไฮไลต์กิจกรรมใน 宜 ที่ตรง goal ของดวง
 *
 * ZERO ENGINE CHANGE: only reads dayInfo + natal branches and reuses the
 * existing (already-validated) `detectInteractionBetween` from interactions.ts.
 * No new calculation; no mutation.
 */

import type { TongShuDayInfo, PersonalResonance } from "@/types/tongshu";
import type { BaZiChart } from "@/lib/bazi/types";
import {
  detectInteractionBetween,
  type BranchInteractionType,
} from "@/lib/bazi/interactions";
import type { RelationshipType } from "@/types/bazi-useful-god";

export type NatalPillarPosition = "year" | "month" | "day" | "hour";

export interface NatalBranch {
  position: NatalPillarPosition;
  branch: string; // 地支 char e.g. "酉"
}

export interface DayNatalInteraction {
  /** which natal pillar is affected */
  position: NatalPillarPosition;
  /** the natal branch char */
  natalBranch: string;
  /** the day's branch char */
  dayBranch: string;
  /** interaction type (clash/combine/harm/punishment) */
  type: BranchInteractionType;
  /** Thai meaning, specific to (type × position) */
  meaningThai: string;
  /** position label in Thai, e.g. "สาปี" */
  positionThai: string;
}

const POSITION_THAI: Record<NatalPillarPosition, string> = {
  year: "สาปี",
  month: "สาเดือน",
  day: "สาวัน",
  hour: "สาเวลา",
};

/**
 * Meaning of an interaction between the day and a given natal pillar.
 * Standard almanac interpretation (日冲生肖 / pillar-clash meanings).
 */
const MEANING_BY_TYPE_POSITION: Record<
  BranchInteractionType,
  Record<NatalPillarPosition, string>
> = {
  冲: {
    year: "กระทบผู้ใหญ่/ครอบครัว — งดริเริ่มเรื่องใหญ่กับผู้ใหญ่",
    month: "กระทบพ่อแม่/หัวหน้า/อาชีพ — เลี่ยงตัดสินใจเรื่องงานสำคัญ",
    day: "กระทบตัวเอง/สุขภาพ/ความสงบ — งดเริ่มงานใหญ่ ระวังอุบัติเหตุ",
    hour: "กระทบลูก/ใต้บังคับ/การลงทุน — เลี่ยงความเสี่ยงระยะสั้น",
  },
  合: {
    year: "มีพลังสนับสนุนจากผู้ใหญ่/ครอบครัว",
    month: "มีพลังสนับสนุนจากงาน/หัวหน้า/วงการ",
    day: "มีพลังสนับสนุนตัวเอง/ความสัมพันธ์ใกล้ตัว",
    hour: "มีพลังสนับสนุนลูก/ทีม/การลงทุน",
  },
  害: {
    year: "ปัญหาซ่อนเร้นจากผู้ใหญ่/ครอบครัว",
    month: "ปัญหาซ่อนเร้นจากงาน/หัวหน้า",
    day: "ปัญหาซ่อนเร้นในตัว/สุขภาพ/ความสัมพันธ์",
    hour: "ปัญหาซ่อนเร้นเรื่องลูก/การลงทุน",
  },
  刑: {
    year: "ความขัดแย้ง/ความเครียดจากผู้ใหญ่/ครอบครัว",
    month: "ความขัดแย้ง/ความเครียดจากงาน/หัวหน้า",
    day: "ความขัดแย้ง/ความเครียดในตัวเอง ระวังสุขภาพ",
    hour: "ความขัดแย้ง/ความเครียดเรื่องลูก/การลงทุน",
  },
};

const PRIORITY: Record<BranchInteractionType, number> = {
  冲: 0,
  刑: 1,
  害: 2,
  合: 3,
};

/**
 * Extract natal branches from a BaZi chart (year/month/day + hour if known).
 */
export function extractNatalBranches(chart: BaZiChart): NatalBranch[] {
  const out: NatalBranch[] = [
    { position: "year", branch: chart.year.branch.name },
    { position: "month", branch: chart.month.branch.name },
    { position: "day", branch: chart.day.branch.name },
  ];
  if (chart.hour) {
    out.push({ position: "hour", branch: chart.hour.branch.name });
  }
  return out;
}

/**
 * Check a TongShu day's branch against all natal branches for 冲/合/害/刑.
 * This is the key almanac↔BaZi link (日冲/合 etc.).
 *
 * Results sorted by priority: 冲 > 刑 > 害 > 合.
 */
export function checkDayVsNatal(
  dayBranch: string,
  natalBranches: NatalBranch[]
): DayNatalInteraction[] {
  const results: DayNatalInteraction[] = [];
  for (const n of natalBranches) {
    const type = detectInteractionBetween(dayBranch, n.branch);
    if (type) {
      results.push({
        position: n.position,
        positionThai: POSITION_THAI[n.position],
        natalBranch: n.branch,
        dayBranch,
        type,
        meaningThai: MEANING_BY_TYPE_POSITION[type][n.position],
      });
    }
  }
  results.sort((a, b) => PRIORITY[a.type] - PRIORITY[b.type]);
  return results;
}

/**
 * Thai labels for the user's career theme based on useful-god relationship.
 */
const RELATIONSHIP_GOAL_THAI: Record<RelationshipType, string[]> = {
  wealth: ["ค้า", "ขาย", "ลงทุน", "การเงิน", "ทรัพย์", "เงิน", "กิจการ", "ซื้อ", "คลัง"],
  power: ["ตำแหน่ง", "รับ", "เจรจา", "แต่งตั้ง", "สมาคม", "ราชการ", "สัญญา", "ติดต่อ"],
  resource: ["เรียน", "สอบ", "อ่าน", "พิมพ์", "วิจัย", "พร", "ปริญญา", "อบรม", "ศึกษา"],
  output: ["แสดง", "เขียน", "พูด", "ออกแบบ", "สร้าง", "โพสต์", "นำเสนอ", "ประกาศ"],
  companion: ["พบ", "ปะ", "เพื่อน", "ทีม", "ประชุม", "ร่วม", "จัดตั้ง", "มิตร"],
};

export interface PersonalizedRecommend {
  nameTh: string;
  /** true if this activity matches the user's career/goal theme */
  highlighted: boolean;
}

/**
 * Highlight the day's generic 宜 activities that match the user's goal theme
 * (derived from their useful-god relationship). Pure: only filters/highlights
 * the existing recommends — never invents activities.
 */
export function getPersonalizedRecommends(
  dayInfo: TongShuDayInfo,
  usefulGodRelationship: RelationshipType | null
): PersonalizedRecommend[] {
  const goals = usefulGodRelationship
    ? RELATIONSHIP_GOAL_THAI[usefulGodRelationship] ?? []
    : [];
  return dayInfo.recommends.map((r) => ({
    nameTh: r.nameTh,
    highlighted: goals.some((g) => r.nameTh.includes(g)),
  }));
}

/** Visual tone for a calendar cell, resolved from BaZi link + day rating. */
export type CellTone = "clash" | "good" | "neutral" | "caution" | "bad" | "muted";

const RATING_TONE: Record<TongShuDayInfo["rating"], CellTone> = {
  very_auspicious: "good",
  auspicious: "good",
  neutral: "neutral",
  inauspicious: "caution",
  very_inauspicious: "bad",
};

const RESONANCE_TONE: Record<PersonalResonance["rating"], CellTone> = {
  very_good: "good",
  good: "good",
  neutral: "neutral",
  challenging: "caution",
  very_challenging: "bad",
};

/**
 * Resolve a calendar cell's visual tone for a given day.
 * Priority: 冲 clash (highest signal) > personal resonance > generic day rating.
 * When no profile (resonance null), falls back to the generic day rating.
 */
export function getCellTone(
  dayInfo: TongShuDayInfo,
  resonance: PersonalResonance | null,
  dayInteractions: DayNatalInteraction[]
): CellTone {
  if (dayInteractions.some((d) => d.type === "冲")) return "clash";
  if (resonance) return RESONANCE_TONE[resonance.rating];
  return RATING_TONE[dayInfo.rating];
}

/**
 * A day's "goodness" ranking — combines personal resonance, useful-god
 * alignment, and generic auspiciousness; penalises days that 冲 a natal
 * pillar. Used to surface the best days of the month proactively.
 *
 * NOTE: goodness is an interpretive ranking for display only (NOT a
 * fortune claim). Derived purely from existing engine output.
 */
export interface RankedDay {
  tone: CellTone;
  goodness: number;
  hasClash: boolean;
  resonanceScore: number | null;
  /** Short Thai reason string (why this day ranks as it does). */
  reasonThai: string;
}

export function rankDay(
  dayInfo: TongShuDayInfo,
  resonance: PersonalResonance | null,
  dayInteractions: DayNatalInteraction[]
): RankedDay {
  const hasClash = dayInteractions.some((d) => d.type === "冲");
  const tone = getCellTone(dayInfo, resonance, dayInteractions);
  const resScore = resonance?.resonanceScore ?? 0;

  let goodness = resScore * 1.5 + dayInfo.powerScore / 5;
  if (resonance?.alignsWithUsefulGod) goodness += 2;
  if (hasClash) goodness -= 6;

  const reasons: string[] = [];
  if (hasClash) {
    reasons.push("冲 สาดวง");
  } else {
    if (resonance) {
      const r = resonance.rating;
      if (r === "very_good") reasons.push("เข้ากันมาก");
      else if (r === "good") reasons.push("เข้ากันดี");
      else if (r === "challenging" || r === "very_challenging") reasons.push("ท้าทาย");
    }
    if (resonance?.alignsWithUsefulGod) reasons.push("ตรง用神");
    if (dayInfo.rating === "very_auspicious" || dayInfo.rating === "auspicious") {
      reasons.push("มงคล");
    }
    if (reasons.length === 0) reasons.push(tone === "good" ? "ปกติดี" : "ปานกลาง");
  }

  return {
    tone,
    goodness,
    hasClash,
    resonanceScore: resonance?.resonanceScore ?? null,
    reasonThai: reasons.join(" · "),
  };
}
