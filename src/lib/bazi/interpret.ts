/**
 * Interpretation Engine — อ่าน engine features + analyzers + content library
 * → ประกอบเป็น DomainInterpretation สำหรับ 7 หัวข้อชีวิต
 *
 * DETERMINISTIC (no AI): ทุกข้อความมาจาก curated library (content/) หรือ engine output
 * Zero Hallucination: framing probabilistic, ไม่ฟันธงสุขภาพร้ายแรง
 *
 * narrative v2 (D.2) จะนำ DomainInterpretation ไป render เป็น UI sections
 */

import type { BaZiAnalysis } from "./use-bazi-analysis";
import type { Archetype } from "./archetypes";
import type { TenGodProfile } from "./ten-god-profile";
import type { PalaceAnalysis } from "./palace";
import type { LuckFavorabilityAnalysis } from "./luck-favorability";
import { summarizeLuckTimeline } from "./luck-favorability";
import type { LifeDomain } from "./content/types";
import {
  TEN_GOD_MEANINGS,
  PALACE_MEANINGS,
  ELEMENT_HEALTH,
  RELATIONSHIP_APPLICATION,
  LUCK_PHASE_MEANING,
} from "./content";
import { ELEMENT_THAI } from "./types";
import { TEN_GOD_THAI, type TenGodName } from "../../types/bazi-gods-stars";
import type { Gender } from "../../types/profile";
import { analyzeSpouse } from "./spouse-analysis";

export interface DomainInterpretation {
  domain: LifeDomain;
  /** ชื่อหัวข้อ (ไทย) */
  title: string;
  /** 1-3 ประโยค derived จากดวงจริง */
  intro: string;
  /** content bullets จาก library */
  bullets: string[];
  /** source refs (ten god / element / palace) เพื่อ debug + verify */
  sources: string[];
}

export interface BaZiInterpretation {
  profileName: string;
  domains: Record<LifeDomain, DomainInterpretation>;
}

const DOMAIN_TITLE: Record<LifeDomain, string> = {
  personality: "บุคลิกและแกนเด่น",
  career: "การงาน",
  wealth: "การเงิน",
  relationship: "ความรักและคู่ครอง",
  health: "สุขภาพ",
  timing: "จังหวะเวลา",
  family: "ครอบครัว",
};

export interface InterpretInput {
  profileName: string;
  analysis: BaZiAnalysis;
  tenGodProfile: TenGodProfile;
  palace: PalaceAnalysis;
  luckFavorability: LuckFavorabilityAnalysis;
  archetype: Archetype;
  /** Optional gender for gender-aware relationship readings */
  gender?: Gender;
}

/**
 * ประกอบ interpretation ทั้ง 7 domains จาก engine features
 */
export function interpretBaZi(input: InterpretInput): BaZiInterpretation {
  const { profileName, analysis, tenGodProfile, palace, luckFavorability, archetype, gender } = input;

  return {
    profileName,
    domains: {
      personality: buildPersonality(archetype, tenGodProfile),
      career: buildCareer(archetype, analysis, tenGodProfile),
      wealth: buildWealth(tenGodProfile, analysis),
      relationship: buildRelationship(palace, tenGodProfile, gender ? { gender, chart: analysis.chart, strength: analysis.strength, usefulGod: analysis.usefulGod } : undefined),
      health: buildHealth(analysis),
      timing: buildTiming(luckFavorability),
      family: buildFamily(palace),
    },
  };
}

// ── Personality ───────────────────────────────────────────────────────
function buildPersonality(archetype: Archetype, tp: TenGodProfile): DomainInterpretation {
  const topGod = tp.dominantGods[0];
  const topMeaning = topGod ? TEN_GOD_MEANINGS[topGod] : null;

  const intro =
    `เจ้าวัน "${archetype.title}"` +
    (topMeaning ? ` — แกนเด่นในดวงของคุณคือ ${topMeaning.nameTh} (${topMeaning.name})` : "") +
    ` ทำให้บุคลิกโดยรวมเป็นแนวที่วิเคราะห์ได้จาก day master + ten god ที่เด่น`;

  const bullets: string[] = [
    ...archetype.traits.slice(0, 3),
    ...(topMeaning ? topMeaning.personality.slice(0, 2) : []),
  ];

  return {
    domain: "personality",
    title: DOMAIN_TITLE.personality,
    intro,
    bullets,
    sources: [
      `archetype=${archetype.title}`,
      ...(topGod ? [`dominantTenGod=${topGod}(${TEN_GOD_THAI[topGod]})`] : []),
      `primaryGroup=${tp.primaryGroup}`,
    ],
  };
}

// ── Career ────────────────────────────────────────────────────────────
function buildCareer(
  archetype: Archetype,
  analysis: BaZiAnalysis,
  tp: TenGodProfile
): DomainInterpretation {
  const relApp = RELATIONSHIP_APPLICATION[analysis.usefulGod.primaryRelationship];
  const topGod = tp.dominantGods[0];
  const topMeaning = topGod ? TEN_GOD_MEANINGS[topGod] : null;

  const intro =
    `${relApp.asUsefulGod} — ส่วนใหญ่เส้นทางการงานจะเอื้อตามจุดนี้`;

  const bullets: string[] = [
    ...archetype.careers.slice(0, 3),
    ...(topMeaning ? topMeaning.career.slice(0, 2) : []),
  ];

  return {
    domain: "career",
    title: DOMAIN_TITLE.career,
    intro,
    bullets,
    sources: [
      `usefulRelationship=${analysis.usefulGod.primaryRelationship}`,
      `usefulElement=${analysis.usefulGod.primaryElement}(${ELEMENT_THAI[analysis.usefulGod.primaryElement]})`,
      ...(topGod ? [`dominantTenGod=${topGod}`] : []),
    ],
  };
}

// ── Wealth ────────────────────────────────────────────────────────────
function buildWealth(tp: TenGodProfile, analysis: BaZiAnalysis): DomainInterpretation {
  // หา wealth god ที่เด่น (正财/偏财) — ถ้าไม่เด่น ดูว่า wealth เป็น 用神 ไหม
  const wealthGods: TenGodName[] = ["正财", "偏财"];
  const dominantWealth = wealthGods.find((g) => tp.dominantGods.includes(g));
  const wealthIsUseful = analysis.usefulGod.primaryRelationship === "wealth";

  let intro: string;
  let bullets: string[] = [];
  const sources: string[] = [`wealthCount=${tp.relationshipCounts.wealth}`];

  if (dominantWealth) {
    const m = TEN_GOD_MEANINGS[dominantWealth];
    intro = `ดวงคุณทรัพย์ (财) เด่น — แนวโน้ม ${m.nameTh}: ${m.essence}`;
    bullets = [...m.wealth];
    sources.push(`dominantWealth=${dominantWealth}`);
  } else if (wealthIsUseful) {
    intro = `ทรัพย์ (财) เป็นธาตุประโยชน์ (用神) ของคุณ — ${RELATIONSHIP_APPLICATION.wealth.asUsefulGod}`;
    bullets = [...RELATIONSHIP_APPLICATION.wealth.timingNote.split("。")];
    sources.push("wealth=usefulGod");
  } else {
    intro = `ดวงคุณทรัพย์ไม่ได้เด่นมาก (count ${tp.relationshipCounts.wealth}) — การเงินมาจากความสม่ำเสมอมากกว่าความรวดเร็ว`;
    bullets = ["เน้นสะสม ระวังรั่ว", "เพิ่มพลังทรัพย์ผ่าน luck ที่เติม 金属"];
    sources.push("wealth=balanced");
  }

  return { domain: "wealth", title: DOMAIN_TITLE.wealth, intro, bullets, sources };
}

// ── Relationship (spouse palace) ──────────────────────────────────────
interface BuildRelationshipContext {
  gender: Gender;
  chart: BaZiAnalysis["chart"];
  strength: BaZiAnalysis["strength"];
  usefulGod: BaZiAnalysis["usefulGod"];
}

function buildRelationship(
  palace: PalaceAnalysis,
  tp: TenGodProfile,
  ctx?: BuildRelationshipContext
): DomainInterpretation {
  // When gender is provided, use gender-aware analyzeSpouse
  if (ctx) {
    const spouseAnalysis = analyzeSpouse(
      ctx.chart,
      ctx.gender,
      ctx.strength,
      ctx.usefulGod,
      tp,
      palace
    );

    const intro = `ดาวคู่ครอง (เพศ${ctx.gender === "male" ? "ชาย" : "หญิง"}): ${spouseAnalysis.star.reading}`;

    const bullets: string[] = [
      `spouse palace: ${spouseAnalysis.palace.reading}`,
      spouseAnalysis.crossCheckReading,
      spouseAnalysis.overall,
    ].filter(Boolean);

    // Keep existing companion-dominant warning logic
    if (tp.dominantGods.includes("比肩") || tp.dominantGods.includes("劫财")) {
      bullets.push("⚠️ companion เด่น — อาจมีคู่แข่ง/แรงดึงดูดจากคนนอก ควรสื่อสารให้ชัด");
    }

    const sources = [
      `spouseBranch=${palace.spouse.branch.name}`,
      `spouseTenGod=${palace.spouse.branchPrimaryTenGod}`,
      `genderedSpouseStar=${spouseAnalysis.star.stars.join(",")}`,
    ];

    return {
      domain: "relationship",
      title: DOMAIN_TITLE.relationship,
      intro,
      bullets,
      sources,
    };
  }

  // Fall back to existing behavior when gender is not provided
  const spouse = palace.spouse;
  const spouseTenGod = spouse.branchPrimaryTenGod;
  const spouseReading = PALACE_MEANINGS.day.byTenGod[spouseTenGod];
  const meaning = TEN_GOD_MEANINGS[spouseTenGod];

  const intro =
    `spouse palace (วันกิ่ง = ${spouse.branch.name}) — hidden หลักเป็น ${TEN_GOD_THAI[spouseTenGod]}. ` +
    (spouseReading ?? "ความสัมพันธ์อ่านจาก ten god ใน spouse palace");

  const bullets: string[] = meaning ? [...meaning.relationship] : [];
  if (tp.dominantGods.includes("比肩") || tp.dominantGods.includes("劫财")) {
    bullets.push("⚠️ companion เด่น — อาจมีคู่แข่ง/แรงดึงดูดจากคนนอก ควรสื่อสารให้ชัด");
  }

  return {
    domain: "relationship",
    title: DOMAIN_TITLE.relationship,
    intro,
    bullets,
    sources: [`spouseBranch=${spouse.branch.name}`, `spouseTenGod=${spouseTenGod}`],
  };
}

// ── Health ────────────────────────────────────────────────────────────
function buildHealth(analysis: BaZiAnalysis): DomainInterpretation {
  const { elements } = analysis;
  // ดูทั้งเด่นเกิน (dominant) และขาด (weakest/missing)
  const focusElements = [
    elements.dominantElement,
    ...(elements.weakestElement ? [elements.weakestElement] : []),
    ...elements.missingElements,
  ].filter((el, idx, arr) => arr.indexOf(el) === idx); // dedupe

  const intro =
    `สุขภาพอ่านจากธาตุที่เสีย — เด่นเกินหรือขาด. ` +
    `ดวงนี้เด่น ${ELEMENT_THAI[elements.dominantElement]}` +
    (elements.weakestElement ? ` / น้อย ${ELEMENT_THAI[elements.weakestElement]}` : "") +
    (elements.missingElements.length > 0
      ? ` / ขาด ${elements.missingElements.map((e) => ELEMENT_THAI[e]).join("、")}`
      : "");

  const bullets: string[] = [];
  const sources: string[] = [];
  for (const el of focusElements) {
    const h = ELEMENT_HEALTH[el];
    bullets.push(`${ELEMENT_THAI[el]} (${el}): ${h.whenImbalanced}`);
    sources.push(`element=${el}(${h.organs[0]})`);
  }
  bullets.push("⚠️ นี่เป็นแนวโน้มตามหลักธาตุ — ไม่ใช่การวินิจฉัยโรค หากมีอาการควรพบแพทย์");

  return { domain: "health", title: DOMAIN_TITLE.health, intro, bullets, sources };
}

// ── Timing ────────────────────────────────────────────────────────────
function buildTiming(lf: LuckFavorabilityAnalysis): DomainInterpretation {
  const cur = lf.current;
  const ann = lf.annual;

  if (!cur) {
    return {
      domain: "timing",
      title: DOMAIN_TITLE.timing,
      intro: "ยังไม่พบ luck pillar ปัจจุบัน",
      bullets: [],
      sources: [],
    };
  }

  const phase = LUCK_PHASE_MEANING[cur.favorability];
  const timeline = summarizeLuckTimeline(lf);
  const intro =
    `รอบดวงปัจจุบัน ${cur.sixtyCycleName} (อายุ ${cur.startAge}–${cur.endAge}) = ${phase.description}` +
    (ann ? ` | รายปี ${ann.sixtyCycleName}: ${LUCK_PHASE_MEANING[ann.favorability].description}` : "") +
    ` | ภาพรวม: ${timeline.summary}`;

  const bullets: string[] = [...cur.reasons, `คำแนะนำ: ${phase.advice}`];

  return {
    domain: "timing",
    title: DOMAIN_TITLE.timing,
    intro,
    bullets,
    sources: [
      `current=${cur.sixtyCycleName}(${cur.favorability})`,
      ...(ann ? [`annual=${ann.sixtyCycleName}(${ann.favorability})`] : []),
    ],
  };
}

// ── Family ────────────────────────────────────────────────────────────
function buildFamily(palace: PalaceAnalysis): DomainInterpretation {
  const intro = "อ่านครอบครัวจาก palace — ปี (พ่อแม่) · เดือน (พี่น้อง/อาชีพ) · ยาม (ลูก/บั้นปลาย)";

  const bullets: string[] = [];
  const sources: string[] = [];
  for (const pos of ["year", "month", "hour"] as const) {
    const pal = palace.palaces.find((p) => p.position === pos);
    if (!pal) continue;
    const reading = PALACE_MEANINGS[pos].byTenGod?.[pal.branchPrimaryTenGod];
    const label = PALACE_MEANINGS[pos].lifeDomain.split(" · ")[0];
    bullets.push(
      `${label}: ${pal.branch.name} → ${TEN_GOD_THAI[pal.branchPrimaryTenGod]}` +
        (reading ? ` — ${reading}` : "")
    );
    sources.push(`${pos}TenGod=${pal.branchPrimaryTenGod}`);
  }

  return { domain: "family", title: DOMAIN_TITLE.family, intro, bullets, sources };
}
