/**
 * 10 Gods (十神) และ Stars (神煞) - Types และ Interfaces
 */

import type { ElementName } from "../lib/bazi/types";

/**
 * 10 Gods (十神) - ชื่อจีน
 */
export type TenGodName =
  | "比肩" | "劫财"     // Companion (同我)
  | "食神" | "伤官"     // Output (我生)
  | "偏财" | "正财"     // Wealth (我克)
  | "七杀" | "正官"     // Power (克我)
  | "偏印" | "正印";    // Resource (生我)

/**
 * ประเภทความสัมพันธ์ของ 10 Gods
 */
export type TenGodRelationship =
  | "companion"  // 同我 - Same element (比劫)
  | "output"     // 我生 - Output (食伤)
  | "wealth"     // 我克 - Wealth (财)
  | "power"      // 克我 - Power (官杀)
  | "resource";  // 生我 - Resource (印)

/**
 * ข้อมูล 10 God
 */
export interface TenGodInfo {
  /** ชื่อ 10 God (จีน) */
  name: TenGodName;
  /** ชื่อ 10 God (ไทย) */
  nameTh: string;
  /** ประเภทความสัมพันธ์ */
  relationship: TenGodRelationship;
  /** ธาตุของ stem ที่เป็น god นี้ */
  element: ElementName;
  /** หยิน-หยางของ stem ที่เป็น god นี้ */
  yinYang: "阳" | "阴";
}

/**
 * ประเภทของดาว (神煞)
 */
export type StarCategory = "auspicious" | "inauspicious";

/**
 * ตำแหน่งที่ดาวปรากฏ
 */
export type StarPosition = "year" | "month" | "day" | "hour";

/**
 * ข้อมูลดาว (神煞)
 */
export interface StarInfo {
  /** ชื่อดาว (จีน) */
  name: string;
  /** ชื่อดาว (ไทย) */
  nameTh: string;
  /** ประเภท (มงคล/อัปมงคล) */
  category: StarCategory;
  /** ตำแหน่งที่พบ */
  position: StarPosition;
  /** คำอธิบายสั้นๆ */
  description: string;
}

/**
 * ผลวิเคราะห์ 10 Gods + Stars
 */
export interface GodsAndStarsAnalysis {
  /** 10 Gods ของ stems หลัก */
  tenGods: {
    /** 10 God ของ year stem */
    year: TenGodInfo;
    /** 10 God ของ month stem */
    month: TenGodInfo;
    /** 10 God ของ hour stem (null ถ้าไม่ทราบเวลา) */
    hour: TenGodInfo | null;
    /** 10 Gods ของ hidden stems ใน day branch */
    dayHiddenStems: TenGodInfo[];
  };
  /** ดาวทั้งหมดที่พบใน chart */
  stars: StarInfo[];
  /** สรุปจำนวนดาว */
  starsSummary: {
    /** ดาวมงคล */
    auspicious: number;
    /** ดาวอัปมงคล */
    inauspicious: number;
  };
}

/**
 * Map ชื่อ 10 Gods (จีน) → ไทย
 */
export const TEN_GOD_THAI: Record<TenGodName, string> = {
  比肩: "比肩 (เพื่อน/ภราดร)",
  劫财: "劫财 (ทรัพย์สินชั่วคราว)",
  食神: "食神 (เทพผู้บริโภค)",
  伤官: "伤官 (นักการทูตบาดเจ็บ)",
  偏财: "偏财 (ทรัพย์สินทางอ้อม)",
  正财: "正财 (ทรัพย์สินตรง)",
  七杀: "七杀 (七นักฆ่า)",
  正官: "正官 (นักการทูตตรง)",
  偏印: "偏印 (ทรัพย์สินทางอ้อม)",
  正印: "正印 (ทรัพย์สินตรง)",
};

/**
 * Map ประเภทความสัมพันธ์ → ไทย
 */
export const TEN_GOD_RELATIONSHIP_THAI: Record<TenGodRelationship, string> = {
  companion: "เพื่อน (同我)",
  output: "ผลผลิต (我生)",
  wealth: "ทรัพย์สิน (我克)",
  power: "อำนาจ (克我)",
  resource: "ทรัพย์สิน (生我)",
};
