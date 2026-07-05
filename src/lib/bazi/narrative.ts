/**
 * BaZi Narrative — pure builder that turns engine analysis into the
 * "สิ่งที่ผู้คนอยากรู้" insight flow (personality → strengths → cautions →
 * career → element balance/useful god → current 10-year luck).
 *
 * ZERO HALLUCINATION CONTRACT
 * - Every string is derived from engine output (BaZiAnalysis) or the authored
 *   archetype library (src/lib/bazi/archetypes.ts). This module never invents
 *   fortune-telling claims, health diagnoses, or specific predictions.
 * - Framing is probabilistic / interpretive ("มัก", "น่าจะ", "เป็นแนวโน้ม").
 * - No new calculation happens here — it only reads pre-computed analysis.
 *
 * Used by: /bazi InsightNarrative section + / home hub preview.
 */

import type { BaZiAnalysis } from "./use-bazi-analysis";
import type { Archetype } from "./archetypes";
import {
  ELEMENT_THAI,
  YINYANG_THAI,
  type ElementName,
} from "./types";
import { STRENGTH_LEVEL_THAI, STRENGTH_LEVEL_DESC } from "@/types/bazi-strength";
import { BALANCE_STATUS_THAI } from "@/types/bazi-elements";

export interface InsightSection {
  id: string;
  title: string;
  /** 1-3 sentence data-derived intro (undefined when bullets speak for themselves). */
  intro?: string;
  /** Authored library bullets (archetype) — never generated. */
  bullets?: string[];
}

export interface BaZiNarrative {
  profileName: string;
  dayMasterName: string;
  elementThai: string;
  yinYangThai: string;
  archetypeTitle: string;
  archetypeMotto: string;
  /** Opening paragraph: who you are, day master, strength framing. */
  opening: string;
  sections: InsightSection[];
  /** Probabilistic / "map not fate" footer; nudges to 天机 for specifics. */
  closingNote: string;
}

function listThai(elements: ElementName[]): string {
  const names = elements.map((e) => ELEMENT_THAI[e]);
  if (names.length === 0) return "—";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} และ${names[1]}`;
  return `${names.slice(0, -1).join("、")} และ${names[names.length - 1]}`;
}

export interface BuildNarrativeInput {
  profileName: string;
  analysis: BaZiAnalysis;
  archetype: Archetype;
}

export function buildBaZiNarrative({
  profileName,
  analysis,
  archetype,
}: BuildNarrativeInput): BaZiNarrative {
  const { chart, strength, usefulGod, elements, luck } = analysis;
  const dm = chart.dayMaster;
  const elementThai = ELEMENT_THAI[dm.element];
  const yinYangThai = YINYANG_THAI[dm.yinYang];
  const levelThai = STRENGTH_LEVEL_THAI[strength.level];
  const levelDesc = STRENGTH_LEVEL_DESC[strength.level];

  const opening =
    `เจ้าวันของ${profileName ? ` ${profileName}` : "คุณ"}คือ ${dm.name}${elementThai} ` +
    `(${yinYangThai}) — "${archetype.motto}" ` +
    `เจ้าวัน${levelThai}: ${levelDesc}`;

  // --- Section: personality (archetype traits) ---
  const personality: InsightSection = {
    id: "personality",
    title: "บุคลิกและแกนเด่น",
    intro:
      `คนธาตุ${elementThai} (${dm.name} ${yinYangThai}) ที่เป็น "${archetype.title}" ` +
      `มักมีแกนนิสัยแบบนี้ — เป็นแนวโน้มจากเจ้าวัน ไม่ได้กำหนดตัวตนทั้งหมด`,
    bullets: archetype.traits,
  };

  // --- Section: strengths (archetype + supporting elements) ---
  const supportClause = strength.supportingElements.length
    ? ` ธาตุที่เสริมคุณคือ ${listThai(strength.supportingElements)}`
    : "";
  const strengths: InsightSection = {
    id: "strengths",
    title: "จุดแข็ง",
    intro: `จากเจ้าวัน${levelThai} คุณมีแนวโน้มเด่นด้านนี้${supportClause}`,
    bullets: archetype.strengths,
  };

  // --- Section: cautions (archetype + weakening/clash) ---
  const weakClause = strength.weakeningElements.length
    ? ` ธาตุที่อาจดึงพลังคุณลงคือ ${listThai(strength.weakeningElements)}`
    : "";
  const clashClause = strength.clashNotes.length
    ? ` ข้อสังเกต: ${strength.clashNotes.join("、")}`
    : "";
  const cautions: InsightSection = {
    id: "cautions",
    title: "จุดที่ควรระวัง",
    intro: `ทุกเจ้าวันมีด้านที่ต้องระวัง สำหรับคุณคือ${weakClause}${clashClause}`,
    bullets: archetype.challenges,
  };

  // --- Section: career (archetype + useful-god relationship framing) ---
  const relMap: Record<string, string> = {
    wealth: "ดวงเน้นเรื่องทรัพย์/โอกาสทางธุรกิจ",
    power: "ดวงเน้นเรื่องอำนาจ/การบริหาร",
    resource: "ดวงเน้นเรื่องความรู้/การสนับสนุน",
    output: "ดวงเน้นเรื่องการสร้างสรรค์/การแสดงออก",
    companion: "ดวงเน้นเรื่องพันธมิตร/การทำงานเป็นทีม",
  };
  const careerIntro =
    `อาชีพที่เข้ากับเจ้าวันและธาตุประโยชน์ของคุณ ` +
    `(${relMap[usefulGod.primaryRelationship] ?? "ดวงเน้นใช้จุดเด่นของธาตุประโยชน์"})`;
  const career: InsightSection = {
    id: "career",
    title: "งานที่เหมาะสม",
    intro: careerIntro,
    bullets: archetype.careers,
  };

  // --- Section: element balance + useful god (engine-derived) ---
  const dominantThai = ELEMENT_THAI[elements.dominantElement];
  const weakestThai = elements.weakestElement
    ? ELEMENT_THAI[elements.weakestElement]
    : null;
  const balanceThai = BALANCE_STATUS_THAI[elements.balanceStatus];
  const balanceIntro =
    `${elements.description} (ภาพรวม${balanceThai} — ` +
    `เด่น: ${dominantThai}${weakestThai ? ` น้อย: ${weakestThai}` : ""})\n\n` +
    `ธาตุประโยชน์ (用神): ${usefulGod.label} — ${usefulGod.description}\n` +
    `${usefulGod.applicationTips}`;
  const balance: InsightSection = {
    id: "balance",
    title: "สมดุลธาตุและธาตุประโยชน์",
    intro: balanceIntro,
  };

  // --- Section: current 10-year luck (engine-derived) ---
  let luckIntro: string;
  const cp = luck.currentPillar;
  if (cp) {
    const stemEl = ELEMENT_THAI[cp.stem.element];
    const branchEl = ELEMENT_THAI[cp.branch.element];
    const tenGodClause = cp.tenGod ? ` สัมพันธ์เป็น ${cp.tenGod}` : "";
    const annualClause = luck.currentAnnual
      ? ` ดวงรายปี ${luck.currentAnnual.year} = ${luck.currentAnnual.sixtyCycleName}` +
        (luck.currentAnnual.tenGod ? ` (${luck.currentAnnual.tenGod})` : "")
      : "";
    luckIntro =
      `ตอนนี้คุณอยู่ในรอบ ${cp.sixtyCycleName} (อายุ ${cp.startAge}–${cp.endAge} ปี) ` +
      `ธาตุเสา: ${stemEl}·${branchEl}${tenGodClause}.${annualClause}`;
  } else {
    luckIntro =
      "ยังไม่พบรอบดวง 10 ปีที่ครอบคลุมอายุปัจจุบัน — ลองดูไทม์ไลน์รอบดวงเต็มด้านล่าง";
  }
  const luckSection: InsightSection = {
    id: "luck",
    title: "รอบดวงปัจจุบัน (10 ปี)",
    intro: luckIntro,
  };

  return {
    profileName,
    dayMasterName: dm.name,
    elementThai,
    yinYangThai,
    archetypeTitle: archetype.title,
    archetypeMotto: archetype.motto,
    opening,
    sections: [personality, strengths, cautions, career, balance, luckSection],
    closingNote:
      "นี่เป็นการตีความตามหลักปาจื้อ เพื่อใช้เป็น “แผนที่” เข้าใจแนวโน้มของตัวเอง ไม่ใช่โชคชะตาที่ตายตัว — ชีวิตเปลี่ยนแปลงได้เสมอ หากอยากเจาะลึกเรื่องใดเป็นพิเศษ ถาม 天机 ได้เลย",
  };
}
