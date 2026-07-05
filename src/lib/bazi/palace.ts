/**
 * Palace Analysis (宫位) — อ่านแต่ละเสาเป็นด้านชีวิต
 *
 * 子平 principle: ตำแหน่งเสา (宫) แทนด้านชีวิต
 *   year (年)  = พ่อแม่/บรรพบุรุษ · วัยเด็ก
 *   month (月) = อาชีพ/พี่น้อง · วัยหนุ่มสาว (也 父母 — บางตำรา)
 *   day (日)   = stem ตัวเอง · branch = คู่ครอง (spouse palace / 夫妻宫)
 *   hour (时)  = ลูก/ผลงาน · บั้นปลาย
 *
 * อ่านแต่ละ palace ผ่าน ten god ของ stem หลัก + hidden stems ใน branch
 * (branch ไม่ใช่ stem เดียว — ปาจื้ออ่านผ่าน main hidden stem เป็นตัวแทน)
 *
 * PURE FUNCTION — อ่าน chart + ใช้ getTenGod/getRelationshipType; serializable
 */

import type {
  BaZiChart,
  StemInfo,
  BranchInfo,
  HiddenStemType,
} from "./types";
import type {
  TenGodName,
  TenGodRelationship,
} from "../../types/bazi-gods-stars";
import { getTenGod } from "./ten-gods";
import { getRelationshipType } from "./relationships";

type Position = "year" | "month" | "day" | "hour";

export interface PalaceHiddenStem {
  stem: StemInfo;
  tenGod: TenGodName;
  relationship: TenGodRelationship;
  type: HiddenStemType;
}

export interface PalaceInfo {
  position: Position;
  /** ด้านชีวิตที่เสานี้แทน (ไทย) */
  lifeDomain: string;
  /** stem หลักของเสา (day stem = dayMaster = ตัวเอง) */
  stem: StemInfo;
  stemTenGod: TenGodName;
  stemRelationship: TenGodRelationship;
  branch: BranchInfo;
  /** hidden stems ใน branch พร้อม ten god */
  branchHiddenStems: PalaceHiddenStem[];
  /** ten god ของ main hidden stem — ตัวแทน branch */
  branchPrimaryTenGod: TenGodName;
}

export interface PalaceAnalysis {
  palaces: PalaceInfo[];
  /** spouse palace = day branch (highlight สำหรับความรัก/คู่) */
  spouse: PalaceInfo;
  /** self = day stem (dayMaster) */
  self: { stem: StemInfo; position: "day" };
}

const LIFE_DOMAIN: Record<Position, string> = {
  year: "พ่อแม่/บรรพบุรุษ · วัยเด็ก",
  month: "อาชีพ/พี่น้อง · วัยหนุ่มสาว",
  day: "ตัวเอง (stem) · คู่ครอง (branch)",
  hour: "ลูก/ผลงาน · บั้นปลาย",
};

/**
 * วิเคราะห์ palace ทั้ง 4 เสา
 */
export function analyzePalace(chart: BaZiChart): PalaceAnalysis {
  const dm = chart.dayMaster;
  const positions: Position[] = chart.hour
    ? ["year", "month", "day", "hour"]
    : ["year", "month", "day"];

  const palaces: PalaceInfo[] = positions.map((pos) => {
    const pillar =
      pos === "year"
        ? chart.year
        : pos === "month"
          ? chart.month
          : pos === "day"
            ? chart.day
            : chart.hour!;
    const stem = pillar.stem;

    const branchHiddenStems: PalaceHiddenStem[] = pillar.branch.hiddenStems.map(
      (h) => ({
        stem: h.stem,
        tenGod: getTenGod(dm, h.stem),
        relationship: getRelationshipType(dm.element, h.stem.element),
        type: h.type,
      })
    );

    const mainHidden = pillar.branch.hiddenStems.find((h) => h.type === "main");
    const branchPrimaryTenGod: TenGodName = mainHidden
      ? getTenGod(dm, mainHidden.stem)
      : (branchHiddenStems[0]?.tenGod ?? getTenGod(dm, stem));

    return {
      position: pos,
      lifeDomain: LIFE_DOMAIN[pos],
      stem,
      stemTenGod: getTenGod(dm, stem),
      stemRelationship: getRelationshipType(dm.element, stem.element),
      branch: pillar.branch,
      branchHiddenStems,
      branchPrimaryTenGod,
    };
  });

  const spouse = palaces.find((p) => p.position === "day")!;

  return {
    palaces,
    spouse,
    self: { stem: dm, position: "day" },
  };
}
