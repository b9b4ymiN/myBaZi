/**
 * BaZi Narrative v2 — นำ DomainInterpretation (จาก interpret engine) → InsightSection[] 7 หัวข้อ
 *
 * ต่างจาก v1 (narrative.ts): v1 ดึง archetype ล้วน (คน 丙 ทุกคนเหมือนกัน)
 *   v2 ผูกดวงจริงผ่าน ten god profile + palace + luck favorability
 *
 * รักษา shape BaZiNarrative (จาก narrative.ts) เพื่อ backward-compat กับ UI เดิม
 * — consumer เดียวกัน (InsightNarrative, HomeHub) ใช้ได้
 *
 * ZERO HALLUCINATION: ทุกข้อความ derived จาก engine + curated library
 *   framing probabilistic, ไม่ฟันธงสุขภาพร้ายแรง (health มี disclaimer)
 */

import type { BaZiAnalysis } from "./use-bazi-analysis";
import type { Archetype } from "./archetypes";
import type { TenGodProfile } from "./ten-god-profile";
import type { PalaceAnalysis } from "./palace";
import type { LuckFavorabilityAnalysis } from "./luck-favorability";
import type { BaZiNarrative, InsightSection } from "./narrative";
import { interpretBaZi, type InterpretInput } from "./interpret";
import { ELEMENT_THAI, YINYANG_THAI } from "./types";
import { STRENGTH_LEVEL_THAI, STRENGTH_LEVEL_DESC } from "../../types/bazi-strength";

export interface BuildNarrativeV2Input {
  profileName: string;
  analysis: BaZiAnalysis;
  tenGodProfile: TenGodProfile;
  palace: PalaceAnalysis;
  luckFavorability: LuckFavorabilityAnalysis;
  archetype: Archetype;
}

const DOMAIN_ORDER = [
  "personality",
  "career",
  "wealth",
  "relationship",
  "health",
  "timing",
  "family",
] as const;

/**
 * สร้าง BaZiNarrative v2 — 7 หัวข้อชีวิตผูกดวงจริง
 */
export function buildBaZiNarrativeV2(input: BuildNarrativeV2Input): BaZiNarrative {
  const { profileName, analysis, archetype, tenGodProfile } = input;
  const interpretation = interpretBaZi(input as InterpretInput);

  const { chart, strength } = analysis;
  const dm = chart.dayMaster;
  const elementThai = ELEMENT_THAI[dm.element];
  const yinYangThai = YINYANG_THAI[dm.yinYang];
  const levelThai = STRENGTH_LEVEL_THAI[strength.level];
  const levelDesc = STRENGTH_LEVEL_DESC[strength.level];

  // opening: day master + archetype + strength + แกนเด่น (top ten god)
  const topGod = tenGodProfile.dominantGods[0];
  const topGodClause = topGod
    ? ` — แกนเด่นในดวงของคุณคือ ${tenGodProfile.counts[topGod]} ครั้งของ ${topGod}`
    : "";
  const opening =
    `เจ้าวันของ${profileName ? ` ${profileName}` : "คุณ"}คือ ${dm.name}${elementThai} ` +
    `(${yinYangThai}) — "${archetype.motto}" ` +
    `เจ้าวัน${levelThai}: ${levelDesc}${topGodClause}`;

  // 7 sections จาก interpretation domains
  const sections: InsightSection[] = DOMAIN_ORDER.map((domain) => {
    const d = interpretation.domains[domain];
    return {
      id: domain,
      title: d.title,
      intro: d.intro,
      bullets: d.bullets,
    };
  });

  return {
    profileName,
    dayMasterName: dm.name,
    elementThai,
    yinYangThai,
    archetypeTitle: archetype.title,
    archetypeMotto: archetype.motto,
    opening,
    sections,
    closingNote:
      "นี่เป็นการตีความตามหลักปาจื้อ เพื่อใช้เป็น “แผนที่” เข้าใจแนวโน้มของตัวเอง — ทุกข้อเป็นแนวโน้ม ไม่ใช่โชคชะตาตายตัว ชีวิตเปลี่ยนแปลงได้เสมอ (โดยเฉพาะเรื่องสุขภาพ หากมีอาการควรพบแพทย์). อยากเจาะลึกเรื่องใด ถาม 天机 ได้เลย",
  };
}
