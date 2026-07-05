/**
 * BaZi calculator types - ปลอดภัยและ serializable
 * ใช้ tyme4ts แปลงเป็น pure data objects
 */

/**
 * ธาตุห้าอย่าง (五行) - จีน + ไทย + English
 */
export type ElementName = "木" | "火" | "土" | "金" | "水";

/**
 * หยิน-หยาง (阴阳)
 */
export type YinYang = "阳" | "阴";

/**
 * ประเภทของ Hidden Stem ใน Earthly Branch
 * - main (本气): ธาตุหลักที่แข็งที่สุด
 * - middle (中气): ธาตุกลาง
 * - residual (余气): ธาตุคงเหลือ
 */
export type HiddenStemType = "main" | "middle" | "residual";

/**
 * ข้อมูล Heavenly Stem (天干)
 */
export interface StemInfo {
  /** ชื่อ天干 จีน เช่น "丙" */
  name: string;
  /** ธาตุ */
  element: ElementName;
  /** หยิน-หยาง */
  yinYang: YinYang;
  /** index 0-9 (甲=0, 乙=1, ..., 壬=8, 癸=9) */
  index: number;
}

/**
 * ข้อมูล Hidden Stem ใน Earthly Branch
 */
export interface HiddenStemInfo {
  /** Heavenly Stem ที่ซ่อนอยู่ */
  stem: StemInfo;
  /** ประเภท (main/middle/residual) */
  type: HiddenStemType;
}

/**
 * ข้อมูล Earthly Branch (地支)
 */
export interface BranchInfo {
  /** ชื่อ地支 จีน เช่น "寅" */
  name: string;
  /** ธาตุหลัก */
  element: ElementName;
  /** 生肖 เช่น "虎" */
  zodiac: string;
  /** ทิศ (สำหรับ Feng Shui) */
  direction: string;
  /** Hidden Stems ที่ซ่อนอยู่ใน branch */
  hiddenStems: HiddenStemInfo[];
}

/**
 * ข้อมูล Pillar (柱) - แต่ละหลักของ BaZi
 */
export interface Pillar {
  /** ตำแหน่ง: year/month/day/hour */
  position: "year" | "month" | "day" | "hour";
  /** ชื่อ SixtyCycle (干支) เช่น "丙寅" */
  sixtyCycleName: string;
  /** Heavenly Stem */
  stem: StemInfo;
  /** Earthly Branch */
  branch: BranchInfo;
}

/**
 * ผลลัพธ์ BaZi Chart ทั้งหมด
 */
export interface BaZiChart {
  /** ทราบเวลาเกิดหรือไม่ */
  birthTimeKnown: boolean;
  /** ปีหลัก (Year Pillar) */
  year: Pillar;
  /** เดือนหลัก (Month Pillar) */
  month: Pillar;
  /** วันหลัก (Day Pillar) */
  day: Pillar;
  /** ชั่วโมงหลัก (Hour Pillar) - null ถ้าไม่ทราบเวลา */
  hour: Pillar | null;
  /** Day Master (日主) = คือ day.stem (alias สะดวก) */
  dayMaster: StemInfo;
}

/**
 * Map ธาตุจีน → ไทย
 */
export const ELEMENT_THAI: Record<ElementName, string> = {
  木: "ไม้",
  火: "ไฟ",
  土: "ดิน",
  金: "โลหะ",
  水: "น้ำ",
};

/**
 * Map ธาตุจีน → English
 */
export const ELEMENT_EN: Record<ElementName, string> = {
  木: "Wood",
  火: "Fire",
  土: "Earth",
  金: "Metal",
  水: "Water",
};

/**
 * Map Hidden Stem Type → ไทย
 */
export const HIDDEN_STEM_TYPE_THAI: Record<HiddenStemType, string> = {
  main: "ธาตุหลัก",
  middle: "ธาตุกลาง",
  residual: "ธาตุคงเหลือ",
};

/**
 * Map หยิน-หยาง → ไทย
 */
export const YINYANG_THAI: Record<YinYang, string> = {
  阳: "หยาง",
  阴: "หยิน",
};

/**
 * List ของทั้ง 10 天干 (เรียงลำดับ)
 */
export const HEAVENLY_STEMS = [
  "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"
] as const;

/**
 * List ของทั้ง 12 地支 (เรียงลำดับ)
 */
export const EARTHLY_BRANCHES = [
  "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"
] as const;
