/**
 * Ten God Profile (十神分布) — นับ 10 Gods ทั้งดวง + จัดอันดับเด่น/ขาด
 *
 * 子平 principle: นักปาจื้ออ่านดวงจาก "ten gods ที่เด่น/ขาด" ไม่ใช่แค่ day master
 * ดวงที่ day master เดียวกัน (เช่น 丙 ทุกคน) จะต่างกันเพราะ ten gods ใน chart ต่างกัน
 *
 * PURE FUNCTION — ไม่แตะ L1 calculation; อ่าน chart ที่คำนวณแล้ว + ใช้ getTenGod/getRelationshipType
 * Serializable (plain object) เท่านั้น
 *
 * นับอะไร:
 *  - stems หลักของ year/month/hour (ไม่นับ day stem = เจ้าวันตัวเอง)
 *  - hidden stems ใน branch ทุกกิ่ง (year/month/day/hour) — รวม day branch (spouse palace)
 */

import type { BaZiChart, StemInfo } from "./types";
import type {
  TenGodName,
  TenGodRelationship,
} from "../../types/bazi-gods-stars";
import { getTenGod } from "./ten-gods";
import { getRelationshipType } from "./relationships";

type Position = "year" | "month" | "day" | "hour";
type Source = "stem" | "hidden-main" | "hidden-middle" | "hidden-residual";

/**
 * หนึ่ง entry = หนึ่ง stem (หลักหรือ hidden) ใน chart ที่นับเป็น ten god
 */
export interface TenGodProfileEntry {
  position: Position;
  source: Source;
  stem: StemInfo;
  tenGod: TenGodName;
  relationship: TenGodRelationship;
}

/**
 * ผล ten god profile ทั้งดวง
 */
export interface TenGodProfile {
  /** นับแต่ละ ten god (10 ตัว) */
  counts: Record<TenGodName, number>;
  /** นับตามกลุ่มความสัมพันธ์ (5 กลุ่ม: companion/output/wealth/power/resource) */
  relationshipCounts: Record<TenGodRelationship, number>;
  /** ทุก stem + hidden stem ที่นับ */
  entries: TenGodProfileEntry[];
  /** ten gods ที่เด่น (count >= dominantThreshold) — เรียง count มาก→น้อย */
  dominantGods: TenGodName[];
  /** กลุ่มความสัมพันธ์ที่ขาด (count = 0) */
  missingRelationships: TenGodRelationship[];
  /** กลุ่มความสัมพันธ์เด่นที่สุด (count สูงสุด, tie-break ตามลำดับ companion→output→wealth→power→resource) */
  primaryGroup: TenGodRelationship;
  /** จำนวน entry รวม */
  total: number;
}

const ALL_TEN_GODS: TenGodName[] = [
  "比肩",
  "劫财",
  "食神",
  "伤官",
  "偏财",
  "正财",
  "七杀",
  "正官",
  "偏印",
  "正印",
];

const ALL_RELATIONSHIPS: TenGodRelationship[] = [
  "companion",
  "output",
  "wealth",
  "power",
  "resource",
];

/** ten god นับเท่าไรถือว่าเด่น (>= 2 stems ในดวง) */
const DOMINANT_THRESHOLD = 2;

/**
 * นับ ten god profile ทั้งดวงจาก chart
 */
export function analyzeTenGodProfile(chart: BaZiChart): TenGodProfile {
  const dm = chart.dayMaster;
  const entries: TenGodProfileEntry[] = [];

  const positions: Position[] = chart.hour
    ? ["year", "month", "day", "hour"]
    : ["year", "month", "day"];

  for (const position of positions) {
    // stem หลัก — ข้าม day (เจ้าวันตัวเอง)
    if (position !== "day") {
      const stem = stemOf(chart, position);
      if (stem) {
        entries.push({
          position,
          source: "stem",
          stem,
          tenGod: getTenGod(dm, stem),
          relationship: getRelationshipType(dm.element, stem.element),
        });
      }
    }
    // hidden stems ใน branch ของทุกกิ่ง (รวม day = spouse palace)
    for (const { stem: hStem, type } of getHiddenStemsForPosition(chart, position)) {
      entries.push({
        position,
        source: `hidden-${type}`,
        stem: hStem,
        tenGod: getTenGod(dm, hStem),
        relationship: getRelationshipType(dm.element, hStem.element),
      });
    }
  }

  return buildProfile(entries);
}

/** ดึง stem หลักของ position ที่กำหนด */
function stemOf(chart: BaZiChart, position: Position): StemInfo | null {
  if (position === "year") return chart.year.stem;
  if (position === "month") return chart.month.stem;
  if (position === "day") return chart.day.stem;
  return chart.hour?.stem ?? null;
}

/** ดึง hidden stems พร้อม type ของ position ที่กำหนด */
function getHiddenStemsForPosition(
  chart: BaZiChart,
  position: Position
): Array<{ stem: StemInfo; type: "main" | "middle" | "residual" }> {
  const pillar =
    position === "year"
      ? chart.year
      : position === "month"
        ? chart.month
        : position === "day"
          ? chart.day
          : chart.hour;
  if (!pillar) return [];
  return pillar.branch.hiddenStems.map((h) => ({ stem: h.stem, type: h.type }));
}

/** สร้าง profile object จาก entries (นับ + จัดอันดับ) */
function buildProfile(entries: TenGodProfileEntry[]): TenGodProfile {
  const counts = initCounts();
  const relationshipCounts = initRelationshipCounts();

  for (const e of entries) {
    counts[e.tenGod] += 1;
    relationshipCounts[e.relationship] += 1;
  }

  const dominantGods = ALL_TEN_GODS.filter((g) => counts[g] >= DOMINANT_THRESHOLD).sort(
    (a, b) => counts[b] - counts[a]
  );

  const missingRelationships = ALL_RELATIONSHIPS.filter(
    (r) => relationshipCounts[r] === 0
  );

  const primaryGroup = choosePrimaryGroup(relationshipCounts);

  return {
    counts,
    relationshipCounts,
    entries,
    dominantGods,
    missingRelationships,
    primaryGroup,
    total: entries.length,
  };
}

function initCounts(): Record<TenGodName, number> {
  return {
    比肩: 0,
    劫财: 0,
    食神: 0,
    伤官: 0,
    偏财: 0,
    正财: 0,
    七杀: 0,
    正官: 0,
    偏印: 0,
    正印: 0,
  };
}

function initRelationshipCounts(): Record<TenGodRelationship, number> {
  return { companion: 0, output: 0, wealth: 0, power: 0, resource: 0 };
}

/** เลือกกลุ่มเด่น: count สูงสุด, tie-break ตามลำดับ companion→output→wealth→power→resource */
function choosePrimaryGroup(
  counts: Record<TenGodRelationship, number>
): TenGodRelationship {
  let best: TenGodRelationship = "companion";
  let bestCount = -1;
  for (const r of ALL_RELATIONSHIPS) {
    if (counts[r] > bestCount) {
      bestCount = counts[r];
      best = r;
    }
  }
  return best;
}
