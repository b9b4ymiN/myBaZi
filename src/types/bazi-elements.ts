/**
 * BaZi Element Composition Types (สัดส่วน 5 ธาตุ)
 * ประเภทข้อมูลสำหรับวิเคราะห์สัดส่วน 5 ธาตุใน BaZi Chart
 */

import type { ElementName } from "@/lib/bazi/types";

/**
 * ระดับความเด่นของธาตุ
 */
export type ElementLevel = "none" | "low" | "medium" | "high" | "dominant";

/**
 * สถานะความสมดุลของธาตุ
 */
export type BalanceStatus = "balanced" | "slightly_imbalanced" | "imbalanced";

/**
 * จำนวนและสัดส่วนของแต่ละธาตุ
 */
export interface ElementCount {
  /** ธาตุ */
  element: ElementName;
  /** จำนวน occurrence (weighted) */
  count: number;
  /** เปอร์เซ็นต์ (0-100, 1 ทศนิยม) */
  percentage: number;
  /** คะแนนรวม (จาก weighting) */
  weight: number;
  /** ระดับความเด่น */
  level: ElementLevel;
}

/**
 * ผลการวิเคราะห์สัดส่วน 5 ธาตุ
 */
export interface ElementComposition {
  /** จำนวนของแต่ละธาตุ (ครบ 5 ธาตุ เรียงตามลำดับ 木火土金水) */
  counts: ElementCount[];
  /** ธาตุที่เด่นที่สุด */
  dominantElement: ElementName;
  /** ธาตุที่น้อยที่สุด (ข้าม none) */
  weakestElement: ElementName | null;
  /** ธาตุที่ไม่มีเลย (count=0) */
  missingElements: ElementName[];
  /** คะแนนรวมทั้งหมด */
  totalWeight: number;
  /** สรุปภาษาไทย */
  description: string;
  /** สถานะความสมดุล */
  balanceStatus: BalanceStatus;
}

/**
 * Map Element Level → ภาษาไทย
 */
export const ELEMENT_LEVEL_THAI: Record<ElementLevel, string> = {
  none: "ไม่มี",
  low: "น้อย",
  medium: "ปานกลาง",
  high: "มาก",
  dominant: "เด่นมาก",
};

/**
 * Map Balance Status → ภาษาไทย
 */
export const BALANCE_STATUS_THAI: Record<BalanceStatus, string> = {
  balanced: "สมดุล",
  slightly_imbalanced: "ค่อนข้างสมดุล",
  imbalanced: "ไม่สมดุล",
};
