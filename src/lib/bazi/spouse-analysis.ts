/**
 * Spouse/Relationship Analysis (คู่ครอง) — วิเคราะห์ดาวคู่ + spouse palace แบบลึก
 *
 * FIXES GENDER-BLIND BUG: แก้บั๊กใน interpret.ts:173 buildRelationship ที่ไม่สนใจเพศ
 * ตามตำรา 子平真诠 (Ziping Zhenquan) — แหล่งข้อมูลดั้งเดิมของการอ่านดวงจีน
 *
 * หลักการ:
 * - ดาวคู่ (Spouse Star) ขึ้นอยู่กับเพศของ Day Master เสมอ:
 *   - Male Day Master → ภรรยา = 财 (Wealth - 偏财, 正财)
 *   - Female Day Master → สามี = 官杀 (Power - 七杀, 正官)
 * - Spouse Palace = Day Branch (หลักวัน - 地支) — บอกความมั่นคงความสัมพันธ์
 * - 星宫同参 (Xing Gong Tong Can) — อ่านดาวคู่ร่วมกับ spouse palace เพื่อความแม่นยำ
 * - ผนวก DM strength + 用神/忌神 (Yong Shen/Ji Shen) + palace stability (clash/combine)
 *
 * DUTY-OF-CARE (ห้าม doom-say):
 * การตัดสิน "แต่งงาน/ไม่แต่งงาน" ต้องใช้หลายสัญญาณ — ไม่ใช่แค่ดาวคู่
 * ดวงที่ไม่มีดาวคู่ใน natal pillars อาจแต่งงานได้เพราะ:
 * - ดาวคู่มาใน luck pillar (大运)
 * - Spouse palace มั่นคง (ไม่ clash)
 * - ปีชนะดาวคู่ (流年)
 * → ดังนั้น ใน reading ต้องใช้ภาษาความเป็นไปได้ ห้ามฟันธง "ไร้คู่/แต่งไม่ติด/หย่าร้าง"
 *
 * PURE FUNCTION — ไม่แตะ L1 calculation; อ่าน chart ที่ calculate แล้ว + ใช้ helper functions
 * Serializable (plain object) เท่านั้น
 */

import type { BaZiChart, ElementName } from "./types";
import type { Gender } from "../../types/profile";
import type { TenGodName, TenGodRelationship } from "../../types/bazi-gods-stars";
import type { StrengthAnalysis } from "@/types/bazi-strength";
import type { UsefulGodAnalysis } from "@/types/bazi-useful-god";
import type { TenGodProfile } from "./ten-god-profile";
import type { PalaceAnalysis } from "./palace";
import { getSpouseStar } from "./six-relatives";
import { detectInteractionBetween } from "./interactions";
import { ELEMENT_THAI } from "./types";

/**
 * คุณภาพของดาวคู่ใน chart
 */
export type SpouseStarQuality = "strong" | "moderate" | "weak" | "absent";

/**
 * ความมั่นคงของ Spouse Palace (Day Branch)
 */
export type PalaceStability = "stable" | "clashed" | "combined" | "neutral";

/**
 * ผลการประเมินดาวคู่ (Spouse Star Assessment)
 */
export interface SpouseStarAssessment {
  /** ดาวคู่ตามเพศ (เช่น male → ["偏财","正财"]) */
  stars: TenGodName[];
  /** มีดาวคู่ใน chart หรือไม่ (เช็คจาก tenGodProfile.entries) */
  present: boolean;
  /** ดาวคู่เด่นหรือไม่ (count >= 2 ใน dominantGods) */
  dominant: boolean;
  /** คุณภาพของดาวคู่ */
  quality: SpouseStarQuality;
  /** ดาวคู่เป็น useful god หรือไม่ */
  isUsefulGod: boolean;
  /** ดาวคู่เป็น avoid god หรือไม่ (忌神) */
  isAvoidGod: boolean;
  /** context ความแข็ง/อ่อนของ DM (ภาษาไทย) */
  dmStrengthContext: string;
  /** คำอ่าน (ภาษาไทย) — ใช้ภาษาความเป็นไปได้ ไม่ doom-say */
  reading: string;
}

/**
 * ผลการประเมิน Spouse Palace (Day Branch)
 */
export interface SpousePalaceAssessment {
  /** ชื่อ day branch (จีน) */
  branch: string;
  /** Ten god หลักของ day branch (จาก main hidden stem) */
  primaryTenGod: TenGodName;
  /** ความมั่นคงของ palace */
  stability: PalaceStability;
  /** interactions ที่พบระหว่าง day branch กับ branches อื่น */
  interactions: Array<{
    otherBranch: string;
    type: "冲" | "合" | "害" | "刑";
    otherPosition: "year" | "month" | "hour";
  }>;
  /** คำอ่าน (ภาษาไทย) */
  reading: string;
}

/**
 * ผลการวิเคราะห์คู่ครองทั้งหมด (ดาว + palace + 星宫同参)
 */
export interface SpouseAnalysis {
  /** การประเมินดาวคู่ */
  star: SpouseStarAssessment;
  /** การประเมิน spouse palace */
  palace: SpousePalaceAssessment;
  /** ดาวคู่กับ palace สอดคล้องกันหรือไม่ (星宫同参) */
  starPalaceAligned: boolean;
  /** คำอ่านแบบ cross-check (ดาว ↔ palace) */
  crossCheckReading: string;
  /** คำอ่านรวม (ภาษาไทย) — สังเคราะห์ทุกสัญญาณ แบบความเป็นไปได้ */
  overall: string;
}

/**
 * ประเมินดาวคู่ (Spouse Star) แบบลึก — เพศ + DM strength + 用神/忌神
 *
 * @param chart - BaZi chart ที่ calculateBaZi() คืนมา
 * @param gender - เพศของ Day Master ("male" หรือ "female")
 * @param strength - ผลวิเคราะห์ strength จาก analyzeStrength()
 * @param usefulGod - ผลวิเคราะห์ useful god จาก analyzeUsefulGod()
 * @param tenGodProfile - ผลวิเคราะห์ ten god profile จาก analyzeTenGodProfile()
 * @returns SpouseStarAssessment - ผลการประเมินดาวคู่ครบทุก field
 *
 * @example
 * const starAssessment = assessSpouseStar(chart, "male", strength, usefulGod, tenGodProfile);
 * console.log(starAssessment.reading); // "ดาวคู่ครอง (财富) แข็งแรง..."
 */
export function assessSpouseStar(
  chart: BaZiChart,
  gender: Gender,
  strength: StrengthAnalysis,
  usefulGod: UsefulGodAnalysis,
  tenGodProfile: TenGodProfile
): SpouseStarAssessment {
  // 1. หาดาวคู่ตามเพศ
  const stars = getSpouseStar(gender);

  // 2. ตรวจว่ามีดาวคู่ใน chart หรือไม่
  // ดาวคู่ = wealth (male) / power (female) — ตรวจสอบว่า relationship group นั้น missing หรือไม่
  const spouseStarRelationship: TenGodRelationship = gender === "male" ? "wealth" : "power";
  const present = !tenGodProfile.missingRelationships.includes(spouseStarRelationship);

  // 3. ตรวจว่าดาวคู่เด่นหรือไม่ (dominant)
  const dominant = stars.some((star) => tenGodProfile.dominantGods.includes(star));

  // 4. กำหนด quality
  let quality: SpouseStarQuality;
  if (dominant) {
    quality = "strong";
  } else if (present) {
    // มีดาวคู่ แต่ไม่ dominant
    quality = "moderate";
  } else {
    // ไม่มีดาวคู่เลยใน natal pillars
    quality = "absent";
  }

  // 5. ตรวจว่าดาวคู่เป็น useful god หรือไม่
  const isUsefulGod = usefulGod.primaryRelationship === spouseStarRelationship;

  // 6. ตรวจว่าดาวคู่เป็น avoid god หรือไม่ (忌神)
  // Heuristic: ถ้า DM อ่อน/อ่อนมาก AND ดาวคู่ = wealth (สำหรับ male)
  // → wealth จะ drain DM ที่อ่อนอยู่แล้ว → เป็น avoid god
  // สำหรับ female: ถ้า DM อ่อน/อ่อนมาก AND ดาวคู่ = power
  // → power คุม DM ที่อ่อนอยู่แล้ว → เป็น avoid god
  let isAvoidGod = false;
  if (strength.level === "weak" || strength.level === "very_weak") {
    // ตรวจว่าดาวคู่ group อยู่ใน avoid elements หรือไม่
    // spouse star relationship = wealth/power → ตรวจสอบว่าเป็นสิ่งที่ drain/control DM อ่อน
    if (gender === "male" && usefulGod.avoidElements.includes(chart.dayMaster.element === "木" ? "土" :
        chart.dayMaster.element === "火" ? "金" :
        chart.dayMaster.element === "土" ? "水" :
        chart.dayMaster.element === "金" ? "木" : "火")) {
      // Wealth (我克) drains weak DM → avoid
      isAvoidGod = true;
    } else if (gender === "female" && usefulGod.avoidElements.includes(chart.dayMaster.element === "木" ? "金" :
        chart.dayMaster.element === "火" ? "水" :
        chart.dayMaster.element === "土" ? "木" :
        chart.dayMaster.element === "金" ? "火" : "土")) {
      // Power (克我) controls weak DM → avoid
      isAvoidGod = true;
    }
  }

  // 7. DM Strength Context (ภาษาไทย)
  const dmStrengthContext = generateDMStrengthContext(gender, strength, chart.dayMaster.element);

  // 8. Reading (ภาษาไทย) — ใช้ภาษาความเป็นไปได้ ไม่ doom-say
  const reading = generateSpouseStarReading(
    gender,
    quality,
    present,
    dominant,
    isUsefulGod,
    isAvoidGod,
    dmStrengthContext,
    stars
  );

  return {
    stars,
    present,
    dominant,
    quality,
    isUsefulGod,
    isAvoidGod,
    dmStrengthContext,
    reading,
  };
}

/**
 * ประเมินความมั่นคงของ Spouse Palace (Day Branch)
 *
 * @param chart - BaZi chart ที่ calculateBaZi() คืนมา
 * @param palace - ผลวิเคราะห์ palace จาก analyzePalace()
 * @returns SpousePalaceAssessment - ผลการประเมิน spouse palace ครบทุก field
 *
 * @example
 * const palaceAssessment = assessSpousePalaceStability(chart, palace);
 * console.log(palaceAssessment.reading); // "Spouse palace (寅) มั่นคง..."
 */
export function assessSpousePalaceStability(
  chart: BaZiChart,
  palace: PalaceAnalysis
): SpousePalaceAssessment {
  const dayBranch = chart.day.branch;
  const branch = dayBranch.name;
  const primaryTenGod = palace.spouse.branchPrimaryTenGod;

  // ตรวจ interactions กับ branches อื่น
  const interactions: Array<{
    otherBranch: string;
    type: "冲" | "合" | "害" | "刑";
    otherPosition: "year" | "month" | "hour";
  }> = [];

  // year branch
  const yearBranch = chart.year.branch.name;
  const yearInteraction = detectInteractionBetween(branch, yearBranch);
  if (yearInteraction) {
    interactions.push({ otherBranch: yearBranch, type: yearInteraction, otherPosition: "year" });
  }

  // month branch
  const monthBranch = chart.month.branch.name;
  const monthInteraction = detectInteractionBetween(branch, monthBranch);
  if (monthInteraction) {
    interactions.push({ otherBranch: monthBranch, type: monthInteraction, otherPosition: "month" });
  }

  // hour branch (ถ้ามี)
  if (chart.hour) {
    const hourBranch = chart.hour.branch.name;
    const hourInteraction = detectInteractionBetween(branch, hourBranch);
    if (hourInteraction) {
      interactions.push({ otherBranch: hourBranch, type: hourInteraction, otherPosition: "hour" });
    }
  }

  // กำหนด stability
  let stability: PalaceStability;
  const hasClash = interactions.some((i) => i.type === "冲");
  const hasCombine = interactions.some((i) => i.type === "合");
  const hasHarm = interactions.some((i) => i.type === "害");
  const hasPunishment = interactions.some((i) => i.type === "刑");

  if (hasClash) {
    stability = "clashed";
  } else if (hasCombine) {
    stability = "combined";
  } else if (hasHarm || hasPunishment) {
    stability = "neutral"; // มีปฏิสัมพันธ์ลบ แต่ไม่รุนแรงอย่าง clash
  } else {
    stability = "stable";
  }

  // Reading (ภาษาไทย)
  const reading = generatePalaceReading(branch, stability, interactions);

  return {
    branch,
    primaryTenGod,
    stability,
    interactions,
    reading,
  };
}

/**
 * วิเคราะห์คู่ครองทั้งหมด — ดาว + palace + 星宫同参
 *
 * @param chart - BaZi chart ที่ calculateBaZi() คืนมา
 * @param gender - เพศของ Day Master ("male" หรือ "female")
 * @param strength - ผลวิเคราะห์ strength
 * @param usefulGod - ผลวิเคราะห์ useful god
 * @param tenGodProfile - ผลวิเคราะห์ ten god profile
 * @param palace - ผลวิเคราะห์ palace
 * @returns SpouseAnalysis - ผลวิเคราะห์ครบทุก field
 *
 * @example
 * const spouseAnalysis = analyzeSpouse(chart, "male", strength, usefulGod, tenGodProfile, palace);
 * console.log(spouseAnalysis.overall); // "ดาวคู่ครองแข็งแรง + palace มั่นคง..."
 */
export function analyzeSpouse(
  chart: BaZiChart,
  gender: Gender,
  strength: StrengthAnalysis,
  usefulGod: UsefulGodAnalysis,
  tenGodProfile: TenGodProfile,
  palace: PalaceAnalysis
): SpouseAnalysis {
  // 1. ประเมินดาวคู่
  const star = assessSpouseStar(chart, gender, strength, usefulGod, tenGodProfile);

  // 2. ประเมิน spouse palace
  const palaceAssessment = assessSpousePalaceStability(chart, palace);

  // 3. 星宫同参 (Xing Gong Tong Can) — ตรวจสอบความสอดคล้อง
  const genderedSpouseStars = getSpouseStar(gender);
  const starPalaceAligned = genderedSpouseStars.includes(palaceAssessment.primaryTenGod);

  // 4. Cross-check reading
  const crossCheckReading = generateCrossCheckReading(starPalaceAligned, star.quality, palaceAssessment.stability);

  // 5. Overall synthesis
  const overall = generateOverallReading(star, palaceAssessment, starPalaceAligned, crossCheckReading);

  return {
    star,
    palace: palaceAssessment,
    starPalaceAligned,
    crossCheckReading,
    overall,
  };
}

/**
 * Generate DM Strength Context (ภาษาไทย)
 */
function generateDMStrengthContext(gender: Gender, strength: StrengthAnalysis, dayMasterElement: ElementName): string {
  const elementThai = ELEMENT_THAI[dayMasterElement];
  const strengthLevel = strength.level;

  if (gender === "male") {
    // Male: ดาวคู่ = Wealth (财)
    if (strengthLevel === "very_strong" || strengthLevel === "strong") {
      return `เจ้าวัน ${elementThai} แข็ง → รับทรัพย์ (คู่ครอง) ได้ดี คู่ช่วยเสริมสร้างความมั่งคั่ง`;
    } else {
      return `เจ้าวัน ${elementThai} อ่อน → ทรัพย์ (คู่ครอง) อาจเป็นภาระ ต้องใช้เหตุผลและการวางแผนในความสัมพันธ์`;
    }
  } else {
    // Female: ดาวคู่ = Power (官杀)
    if (strengthLevel === "very_strong" || strengthLevel === "strong") {
      return `เจ้าวัน ${elementThai} แข็ง → รับอำนาจ (คู่ครอง) ได้ คู่มีความสามารถและน่าเคารพ`;
    } else {
      return `เจ้าวัน ${elementThai} อ่อน → อำนาจ (คู่ครอง) ควบคุมเธอ → ต้องการคู่ที่เอาใจใส่ ไม่กดดัน`;
    }
  }
}

/**
 * Generate Spouse Star Reading (ภาษาไทย) — ใช้ภาษาความเป็นไปได้
 */
function generateSpouseStarReading(
  gender: Gender,
  quality: SpouseStarQuality,
  present: boolean,
  dominant: boolean,
  isUsefulGod: boolean,
  isAvoidGod: boolean,
  dmStrengthContext: string,
  stars: TenGodName[]
): string {
  const spouseStarNames = gender === "male" ? "财富 (ทรัพย์สิน)" : "官杀 (อำนาจยศ)";
  const starList = stars.join("、");

  if (quality === "strong") {
    let reading = `ดาวคู่ครอง (${starList}) แข็งแรงในดวงตั้งไข่ — ${dmStrengthContext}`;
    if (isUsefulGod) {
      reading += ` ดาวคู่เป็น用神 → คู่ช่วยเสริมดวงและชีวิต`;
    } else if (isAvoidGod) {
      reading += ` แต่ดาวคู่เป็น忌神 → ความสัมพันธ์อาจต้องใช้ความพยายาม`;
    }
    return reading;
  }

  if (quality === "moderate") {
    let reading = `ดาวคู่ครอง (${starList}) ปรากฏในดวงตั้งไข่ — ${dmStrengthContext}`;
    if (isUsefulGod) {
      reading += ` ดาวคู่เป็น用神 → คู่ช่วยเสริมดวง`;
    }
    return reading;
  }

  if (quality === "weak") {
    return `ดาวคู่ครอง (${spouseStarNames}) อ่อนในดวงตั้งไข่ — ${dmStrengthContext} ต้องพึ่ง timing ที่ดี`;
  }

  // quality === "absent"
  // CRITICAL: ห้าม doom-say — ใช้ภาษาความเป็นไปได้
  return `ดาวคู่ครอง (${spouseStarNames}) ไม่ปรากฏในดวงตั้งไข่ แต่ห้ามสรุปว่าจะไม่แต่งงาน — ดาวคู่อาจมาใน大运 (โชคชะตา 10 ปี) หรือ流年 (ปีชนะดาวคู่) หรืออาศัย spouse palace ที่มั่นคง ตำรา子平อ่านความสัมพันธ์จากหลายสัญญาณ ไม่ใช่แค่ดาวคู่ใน natal chart`;
}

/**
 * Generate Palace Reading (ภาษาไทย)
 */
function generatePalaceReading(
  branch: string,
  stability: PalaceStability,
  interactions: Array<{ otherBranch: string; type: "冲" | "合" | "害" | "刑"; otherPosition: string }>
): string {
  const interactionList = interactions.map((i) => {
    const posTh = i.otherPosition === "year" ? "ปี" : i.otherPosition === "month" ? "เดือน" : "ชั่วโมง";
    const typeTh = i.type === "冲" ? "ชง" : i.type === "合" ? "ร่วม" : i.type === "害" ? "ระยำ" : "ลงโทษ";
    return `${posTh} (${i.otherBranch}) ${typeTh}`;
  }).join("、");

  if (stability === "stable") {
    return `Spouse palace (${branch}) มั่นคง — ไม่มีปฏิสัมพันธ์พิเศษ (冲合害刑) กับ branches อื่น → ความสัมพันธ์เป็นไปอย่างสงบ เหมาะกับการสร้างครอบครัว`;
  }

  if (stability === "combined") {
    return `Spouse palace (${branch}) มี six harmony (六合) — ${interactionList} → คู่สนิท ความสัมพันธ์สามัคคี มีคนเข้าใจ`;
  }

  if (stability === "clashed") {
    // ใช้ภาษาที่ไม่ doom-say
    return `Spouse palace (${branch}) ถูก clash (冲) — ${interactionList} → ความสัมพันธ์อาจผันผวน มีการเปลี่ยนแปลง แต่อย่าตีความว่าจะหย่าแน่ ๆ — clash บ่งชี้ความต้องการปรับตัวและความเข้าใจซึ่งกันและกัน`;
  }

  // stability === "neutral" หรือมี harm/punishment
  return `Spouse palace (${branch}) มีปฏิสัมพันธ์ — ${interactionList || "ไม่พบ"} → ความสัมพันธ์ปกติ มีทั้งดีและเรื่องที่ต้องปรับ`;
}

/**
 * Generate Cross-Check Reading (星宫同参)
 */
function generateCrossCheckReading(
  starPalaceAligned: boolean,
  starQuality: SpouseStarQuality,
  palaceStability: PalaceStability
): string {
  if (starPalaceAligned && starQuality === "strong" && palaceStability === "stable") {
    return "ดาวคู่และ palace สอดคล้อง → คู่ชัด ความสัมพันธ์มั่นคง";
  }

  if (starPalaceAligned && (palaceStability === "combined" || palaceStability === "stable")) {
    return "ดาวคู่และ palace สอดคล้อง → คู่ชัด มีความเข้าใจ";
  }

  if (!starPalaceAligned && starQuality === "strong" && palaceStability === "stable") {
    return "ดาวคู่และ palace ต่างกัน → ความสัมพันธ์ซับซ้อน แต่ดาวคู่แข็ง → โอกาสดีมี";
  }

  if (!starPalaceAligned) {
    return "ดาวคู่และ palace ต่างกัน → ความสัมพันธ์ซับซ้อน ต้องใช้ความเข้าใจและการปรับตัว";
  }

  if (starQuality === "absent" && palaceStability === "stable") {
    return "ดาวคู่ไม่ชัด แต่ palace มั่นคง → โอกาสแต่งงานยังมี ผ่าน timing หรือ palace";
  }

  return "ดาวคู่และ palace ให้สัญญาณผสม → ความสัมพันธ์มีทั้งโอกาสดีและเรื่องที่ต้องระวัง";
}

/**
 * Generate Overall Reading (สังเคราะห์ทุกสัญญาณ)
 */
function generateOverallReading(
  star: SpouseStarAssessment,
  palace: SpousePalaceAssessment,
  starPalaceAligned: boolean,
  crossCheckReading: string
): string {
  const parts: string[] = [];

  // ส่วนที่ 1: ดาวคู่
  if (star.quality === "strong") {
    parts.push("ดาวคู่แข็งแรง");
  } else if (star.quality === "moderate") {
    parts.push("ดาวคู่ปรากฏ");
  } else if (star.quality === "weak") {
    parts.push("ดาวคู่อ่อน");
  } else {
    parts.push("ดาวคู่ไม่ชัดในดวงตั้งไข่");
  }

  // ส่วนที่ 2: Palace
  if (palace.stability === "stable") {
    parts.push("spouse palace มั่นคง");
  } else if (palace.stability === "combined") {
    parts.push("spouse palace มี six harmony");
  } else if (palace.stability === "clashed") {
    parts.push("spouse palace ถูก clash (ความสัมพันธ์อาจผันผวน)");
  } else {
    parts.push("spouse palace ปกติ");
  }

  // ส่วนที่ 3: DM strength context (แบบย่อ)
  const strengthContext = star.dmStrengthContext.split("—")[0].trim();
  parts.push(strengthContext);

  // ส่วนที่ 4: Cross-check
  parts.push(crossCheckReading);

  // รวมเป็นย่อหน้า
  let overall = parts.join(" · ");

  // เติมหมายเหตุสุดท้าย (ถ้าดาวคู่ไม่ชัด)
  if (star.quality === "absent") {
    overall += " โดยรวม มีโอกาสแต่งงานดี ผ่าน timing (大运) หรือ spouse palace ที่มั่นคง";
  }

  return overall;
}
