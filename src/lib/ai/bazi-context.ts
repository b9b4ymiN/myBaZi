/**
 * BaZi Context Builder - รวบข้อมูลดวง → context ภาษาไทยสำหรับ AI 天机
 *
 * แปลงข้อมูล BaZi ทั้งหมด → Rich Thai context string
 * เพื่อให้ AI เข้าใจดวงผู้ใช้ครบถ้วน ไม่ต้องเดา
 *
 * Structure ของ context:
 * 1. ข้อมูลผู้ใช้ (name, gender, birth info)
 * 2. 4 เสา (Natal Chart) - จีน + พินอญ + ไทย + ธาตุ + หยิน/หยาง
 * 3. Day Master - archetype
 * 4. Strength analysis
 * 5. Structure analysis
 * 6. Useful God (用神)
 * 7. 10 Gods (十神)
 * 8. Stars (神煞)
 * 9. Hidden Stems (藏干)
 * 10. Branch Interactions (冲合害刑)
 * 11. Element Composition
 * 12. Luck Pillars (大运)
 * 13. Transit Forecasting context
 */

import type { Profile } from "@/types/profile";
import { calculateBaZi } from "@/lib/bazi/calculate";
import { analyzeStrength } from "@/lib/bazi/strength";
import { analyzeStructure } from "@/lib/bazi/structure";
import { analyzeUsefulGod } from "@/lib/bazi/useful-god";
import { analyzeGodsAndStars } from "@/lib/bazi/gods-stars";
import { analyzeLuck } from "@/lib/bazi/luck";
import { analyzeElements } from "@/lib/bazi/elements";
import { analyzeInteractions, summarizeInteractions } from "@/lib/bazi/interactions";
import { analyzePalace } from "@/lib/bazi/palace";
import { analyzeTenGodProfile } from "@/lib/bazi/ten-god-profile";
import { analyzeSpouse } from "@/lib/bazi/spouse-analysis";
import { getSixRelatives } from "@/lib/bazi/six-relatives";
import { ELEMENT_THAI, YINYANG_THAI, HIDDEN_STEM_TYPE_THAI } from "@/lib/bazi/types";
import { TEN_GOD_THAI } from "@/types/bazi-gods-stars";
import { STEM_THAI, BRANCH_THAI, ZODIAC_THAI } from "@/lib/bazi/pinyin";
import type { BaZiChart } from "@/lib/bazi/types";
import type { StrengthAnalysis } from "@/types/bazi-strength";
import type { StructureAnalysis } from "@/types/bazi-structure";
import type { UsefulGodAnalysis } from "@/types/bazi-useful-god";
import type { GodsAndStarsAnalysis } from "@/types/bazi-gods-stars";
import type { BranchInteraction } from "@/lib/bazi/interactions";
import type { ElementComposition } from "@/types/bazi-elements";
import type { LuckAnalysis } from "@/types/bazi-luck";

/**
 * BaZi Context - ผลลัพธ์จาก buildBaZiContext()
 */
export interface BaZiContext {
  /** Context ภาษาไทยเต็ม (ใส่ใน system prompt) */
  text: string;
  /** สรุปสั้น 1 บรรทัด */
  summary: string;
  /** ข้อมูลดิบทั้งหมด (สำหรับ layer 2 server calc) */
  raw: {
    profile: Profile;
    chart: BaZiChart;
    strength: StrengthAnalysis;
    structure: StructureAnalysis;
    usefulGod: UsefulGodAnalysis;
    godsAndStars: GodsAndStarsAnalysis;
    interactions: BranchInteraction[];
    elements: ElementComposition;
    luck: LuckAnalysis | null;
  };
}

/**
 * Map ชื่อ pillar → ไทย
 */
const PILLAR_THAI: Record<string, string> = {
  year: "ปีหลัก",
  month: "เดือนหลัก",
  day: "วันหลัก",
  hour: "ชั่วโมงหลัก",
};

/**
 * แปลง pillar → string ภาษาไทย (rich format)
 */
function formatPillar(pillar: { stem: { name: string; element: string; yinYang: string }; branch: { name: string; zodiac: string } }, position: string): string {
  const stemName = pillar.stem.name;
  const branchName = pillar.branch.name;
  const stemThai = STEM_THAI[stemName] || stemName;
  const branchThai = BRANCH_THAI[branchName] || branchName;
  const elementThai = ELEMENT_THAI[pillar.stem.element as keyof typeof ELEMENT_THAI];
  const yinYangThai = YINYANG_THAI[pillar.stem.yinYang as keyof typeof YINYANG_THAI];
  const zodiacThai = ZODIAC_THAI[pillar.branch.zodiac as keyof typeof ZODIAC_THAI] || pillar.branch.zodiac;

  const posThai = PILLAR_THAI[position] || position;

  return `${posThai}: ${stemName}${branchName} (${stemThai}${branchThai}) - ธาตุ${elementThai} ${yinYangThai} - 生肖${zodiacThai}`;
}

/**
 * แปลง hidden stems → string ภาษาไทย
 */
function formatHiddenStems(hiddenStems: { stem: { name: string; element: string }; type: string }[]): string {
  if (!hiddenStems || hiddenStems.length === 0) {
    return "ไม่มี";
  }

  return hiddenStems.map((hs) => {
    const stemName = hs.stem.name;
    const stemThai = STEM_THAI[stemName] || stemName;
    const elementThai = ELEMENT_THAI[hs.stem.element as keyof typeof ELEMENT_THAI];
    const typeThai = HIDDEN_STEM_TYPE_THAI[hs.type as keyof typeof HIDDEN_STEM_TYPE_THAI] || hs.type;

    return `${stemName} (${stemThai}) - ธาตุ${elementThai} (${typeThai})`;
  }).join(", ");
}

/**
 * สร้าง Rich BaZi Context จาก profile
 *
 * @param profile - ข้อมูลผู้ใช้
 * @param currentYear - ปีปัจจุบัน (ค.ศ.) - required for SSR safety
 * @param options - ตัวเลือกเพิ่มเติม (เช่น intent สำหรับ gate section)
 * @returns BaZiContext - context ภาษาไทย + summary + raw data
 */
export function buildBaZiContext(
  profile: Profile,
  currentYear?: number,
  options?: { intent?: string }
): BaZiContext {
  // 1. คำนวณ BaZi chart
  const chart = calculateBaZi(profile);

  // 2. วิเคราะห์ทุกด้าน
  const strength = analyzeStrength(chart);
  const structure = analyzeStructure(chart, strength);
  const usefulGod = analyzeUsefulGod(chart, strength, structure);
  const godsAndStars = analyzeGodsAndStars(chart);
  const interactions = analyzeInteractions(chart);
  const elements = analyzeElements(chart);

  // 3. วิเคราะห์ luck (ถ้ามี currentYear)
  const luck = currentYear
    ? analyzeLuck(profile, chart, currentYear)
    : null;

  // 4. สร้าง context text ภาษาไทย
  const sections: string[] = [];

  // ===== Section 1: ข้อมูลผู้ใช้ =====
  sections.push("## ข้อมูลผู้ใช้");
  sections.push(`ชื่อ: ${profile.name}`);
  sections.push(`เพศ: ${profile.gender === "male" ? "ชาย" : "หญิง"}`);

  // แปลงวันเกิดเป็น Thai date
  const birthDate = new Date(profile.birthDate);
  const thaiDate = birthDate.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  sections.push(`วันเกิด: ${thaiDate} (${profile.birthDate})`);

  if (profile.birthTime && profile.birthTimeKnown === "known") {
    sections.push(`เวลาเกิด: ${profile.birthTime} น. (โซน: ${profile.timezone})`);
  } else {
    sections.push(`เวลาเกิด: ไม่ทราบแน่ชัด`);
  }

  if (profile.birthLongitude) {
    sections.push(`ลองจิจูด: ${profile.birthLongitude}° (สำหรับ True Solar Time)`);
  }

  sections.push(""); // blank line

  // ===== Section 2: 4 เสา (Natal Chart) =====
  sections.push("## 4 เสา (Natal Chart) - BaZi Chart");
  sections.push(formatPillar(chart.year, "year"));
  sections.push(formatPillar(chart.month, "month"));
  sections.push(formatPillar(chart.day, "day"));

  if (chart.hour) {
    sections.push(formatPillar(chart.hour, "hour"));
  } else {
    sections.push("ชั่วโมงหลัก: ไม่ทราบแน่ชัด");
  }

  sections.push(""); // blank line

  // ===== Section 3: Day Master =====
  sections.push("## Day Master (เจ้าวัน)");
  const dayMasterName = chart.dayMaster.name;
  const dayMasterThai = STEM_THAI[dayMasterName] || dayMasterName;
  const dayMasterElement = ELEMENT_THAI[chart.dayMaster.element];
  const dayMasterYinYang = YINYANG_THAI[chart.dayMaster.yinYang];

  sections.push(`เจ้าวัน: ${dayMasterName} (${dayMasterThai})`);
  sections.push(`ธาตุ: ${dayMasterElement} ${dayMasterYinYang}`);

  // Day Master archetype (คำอธิบายสั้น)
  const dayMasterArchetype = getDayMasterArchetype(chart.dayMaster.element);
  sections.push(`ลักษณะ: ${dayMasterArchetype}`);

  sections.push(""); // blank line

  // ===== Section 4: Strength Analysis =====
  sections.push("## Strength Analysis (ความแข็ง/อ่อนของเจ้าวัน)");
  sections.push(`ระดับ: ${getStrengthLevelThai(strength.level)}`);
  sections.push(`คะแนน: ${strength.score > 0 ? "+" : ""}${strength.score}`);
  sections.push(`สรุป: ${strength.summary}`);

  // Factors breakdown
  sections.push("\nปัจจัย:");
  for (const factor of strength.factors) {
    sections.push(`- ${factor.label}: ${factor.description} (คะแนน ${factor.score > 0 ? "+" : ""}${factor.score})`);
    if (factor.details && factor.details.length > 0) {
      for (const detail of factor.details) {
        sections.push(`  • ${detail}`);
      }
    }
  }

  // Clash notes
  if (strength.clashNotes && strength.clashNotes.length > 0) {
    sections.push("\nหมายเหตุ:");
    for (const note of strength.clashNotes) {
      sections.push(`- ${note}`);
    }
  }

  sections.push(""); // blank line

  // ===== Section 5: Structure Analysis =====
  sections.push("## Structure Analysis (格局)");
  sections.push(`โครงสร้าง: ${structure.label}`);
  sections.push(`ชื่อจีน: ${structure.labelCn}`);
  sections.push(`คำอธิบาย: ${structure.description}`);

  if (structure.reasons && structure.reasons.length > 0) {
    sections.push("\nเหตุผล:");
    for (const reason of structure.reasons) {
      sections.push(`- ${reason}`);
    }
  }

  if (structure.implications) {
    sections.push(`\nผลกระทบ: ${structure.implications}`);
  }

  sections.push(""); // blank line

  // ===== Section 6: Useful God (用神) =====
  sections.push("## Useful God (用神 - ธาตุที่เป็นประโยชน์)");
  sections.push(`ประเภท: ${usefulGod.label}`);
  sections.push(`ชื่อจีน: ${usefulGod.labelCn}`);
  sections.push(`คำอธิบาย: ${usefulGod.description}`);

  if (usefulGod.reasons && usefulGod.reasons.length > 0) {
    sections.push("\nเหตุผล:");
    for (const reason of usefulGod.reasons) {
      sections.push(`- ${reason}`);
    }
  }

  if (usefulGod.applicationTips) {
    sections.push(`\nวิธีนำไปใช้: ${usefulGod.applicationTips}`);
  }

  sections.push(""); // blank line

  // ===== Section 7: 10 Gods (十神) =====
  sections.push("## 10 Gods (十神)");
  sections.push(`ปี (年): ${godsAndStars.tenGods.year.name} (${godsAndStars.tenGods.year.nameTh})`);
  sections.push(`เดือน (月): ${godsAndStars.tenGods.month.name} (${godsAndStars.tenGods.month.nameTh})`);

  if (godsAndStars.tenGods.hour) {
    sections.push(`ชั่วโมง (时): ${godsAndStars.tenGods.hour.name} (${godsAndStars.tenGods.hour.nameTh})`);
  } else {
    sections.push("ชั่วโมง (时): ไม่ทราบแน่ชัด");
  }

  // Hidden stems ใน day branch
  if (godsAndStars.tenGods.dayHiddenStems && godsAndStars.tenGods.dayHiddenStems.length > 0) {
    sections.push("\n藏干 (Hidden Stems) ในวันหลัก:");
    for (const hiddenGod of godsAndStars.tenGods.dayHiddenStems) {
      sections.push(`- ${hiddenGod.name} (${hiddenGod.nameTh})`);
    }
  }

  sections.push(""); // blank line

  // ===== Section 8: Stars (神煞) =====
  sections.push("## Stars (神煞 - ดาวมงคล/อัปมงคล)");

  if (godsAndStars.stars && godsAndStars.stars.length > 0) {
    // แยกมงคล/อัปมงคล
    const auspiciousStars = godsAndStars.stars.filter((s: { category: string }) => s.category === "auspicious");
    const inauspiciousStars = godsAndStars.stars.filter((s: { category: string }) => s.category === "inauspicious");

    if (auspiciousStars.length > 0) {
      sections.push("ดาวมงคล:");
      for (const star of auspiciousStars) {
        sections.push(`- ${star.name} (${star.nameTh}) - ตำแหน่ง: ${star.position} - ${star.description}`);
      }
    }

    if (inauspiciousStars.length > 0) {
      sections.push("\nดาวอัปมงคล:");
      for (const star of inauspiciousStars) {
        sections.push(`- ${star.name} (${star.nameTh}) - ตำแหน่ง: ${star.position} - ${star.description}`);
      }
    }

    sections.push(`\nสรุป: มีดาวมงคล ${godsAndStars.starsSummary.auspicious} ดวง, อัปมงคล ${godsAndStars.starsSummary.inauspicious} ดวง`);
  } else {
    sections.push("ไม่พบดาวพิเศษใน chart");
  }

  sections.push(""); // blank line

  // ===== Section 9: Hidden Stems (藏干) =====
  sections.push("## Hidden Stems (藏干 - ธาตุซ่อนใน地支)");
  sections.push(`ปี: ${formatHiddenStems(chart.year.branch.hiddenStems)}`);
  sections.push(`เดือน: ${formatHiddenStems(chart.month.branch.hiddenStems)}`);
  sections.push(`วัน: ${formatHiddenStems(chart.day.branch.hiddenStems)}`);
  if (chart.hour) {
    sections.push(`ชั่วโมง: ${formatHiddenStems(chart.hour.branch.hiddenStems)}`);
  }

  sections.push(""); // blank line

  // ===== Section 10: Branch Interactions (冲合害刑) =====
  sections.push("## Branch Interactions (ปฏิสัมพันธ์ระหว่าง地支)");
  sections.push(summarizeInteractions(interactions));

  sections.push(""); // blank line

  // ===== Section 11: Element Composition =====
  sections.push("## Element Composition (สัดส่วน 5 ธาตุ)");
  sections.push(`สรุป: ${elements.description}`);

  sections.push("\nรายละเอียด:");
  for (const count of elements.counts) {
    const elementThai = ELEMENT_THAI[count.element];
    const levelThai = getElementLevelThai(count.level);
    sections.push(`- ธาตุ${elementThai}: ${count.percentage}% (${count.weight}) - ${levelThai}`);
  }

  if (elements.missingElements && elements.missingElements.length > 0) {
    const missingThai = elements.missingElements.map((e: string) => ELEMENT_THAI[e as keyof typeof ELEMENT_THAI]).join(", ");
    sections.push(`\nขาดธาตุ: ${missingThai}`);
  }

  sections.push(""); // blank line

  // ===== Section 12: Luck Pillars (大运) =====
  if (luck) {
    sections.push("## Luck Pillars (大运 - ช่วงเวลา 10 ปี)");
    sections.push(`ทิศทาง: ${luck.direction === "forward" ? "ไปข้างหน้า" : "ย้อนหลัง"}`);
    sections.push(`เริ่มที่ ${luck.startAge} ปี`);

    if (luck.currentPillar) {
      const current = luck.currentPillar;
      const stemThai = STEM_THAI[current.stem.name] || current.stem.name;
      const branchThai = BRANCH_THAI[current.branch.name] || current.branch.name;
      const tenGodName = current.tenGod as string | undefined;
      const tenGodThai = tenGodName ? (TEN_GOD_THAI[tenGodName as keyof typeof TEN_GOD_THAI] || tenGodName) : "ไม่ทราบ";

      sections.push(`\nช่วงปัจจุบัน (${current.startAge}-${current.endAge} ปี):`);
      sections.push(`- ${current.sixtyCycleName} (${stemThai}${branchThai})`);
      sections.push(`- 10 God: ${tenGodName || "ไม่ทราบ"} (${tenGodThai})`);
    }

    if (luck.currentAnnual) {
      const annual = luck.currentAnnual;
      const yearStem = annual.sixtyCycleName[0];
      const yearBranch = annual.sixtyCycleName[1];
      const stemThai = STEM_THAI[yearStem] || yearStem;
      const branchThai = BRANCH_THAI[yearBranch] || yearBranch;
      const tenGodName = annual.tenGod as string | undefined;
      const tenGodThai = tenGodName ? (TEN_GOD_THAI[tenGodName as keyof typeof TEN_GOD_THAI] || tenGodName) : "ไม่ทราบ";

      sections.push(`\nปีปัจจุบัน (${annual.year} ค.ศ.):`);
      sections.push(`- ${annual.sixtyCycleName} (${stemThai}${branchThai})`);
      sections.push(`- 10 God: ${tenGodName || "ไม่ทราบ"} (${tenGodThai})`);
    }

    if (luck.upcomingTransitions && luck.upcomingTransitions.length > 0) {
      sections.push("\nการเปลี่ยนเสาครั้งต่อไป:");
      for (const transition of luck.upcomingTransitions) {
        sections.push(`- อีก ${transition.yearsAway} ปี (ที่ ${transition.age} ปี): เข้าสู่ ${transition.pillar}`);
      }
    }

    sections.push(""); // blank line
  }

  // ===== Section 13: 六亲 Palaces & Stars (ความสัมพันธ์) =====
  // เฉพาะกรณี intent === "six_relative" เท่านั้น — cost gate
  if (options?.intent === "six_relative") {
    // วิเคราะห์เพิ่มเติมสำหรับความสัมพันธ์
    const palace = analyzePalace(chart);
    const tenGodProfile = analyzeTenGodProfile(chart);
    const spouseAnalysis = analyzeSpouse(chart, profile.gender, strength, usefulGod, tenGodProfile, palace);
    const sixRelatives = getSixRelatives(profile.gender);

    sections.push("## 六亲 Palaces & Stars (ความสัมพันธ์)");

    // 1. ดาวคู่ครอง (Spouse Star)
    const spouseStarThai = spouseAnalysis.star.stars.map(star => TEN_GOD_THAI[star] || star).join("、");
    sections.push(`ดาวคู่ครอง: ${spouseStarThai}`);
    sections.push(`- สถานะ: ${spouseAnalysis.star.quality === "strong" ? "แข็งแรง" : spouseAnalysis.star.quality === "moderate" ? "ปรากฏ" : spouseAnalysis.star.quality === "weak" ? "อ่อน" : "ไม่ปรากฏ"}${spouseAnalysis.star.dominant ? " (เด่น)" : ""}${spouseAnalysis.star.isUsefulGod ? " · เป็น用神" : ""}${spouseAnalysis.star.isAvoidGod ? " · เป็น忌神" : ""}`);
    sections.push(`- ${spouseAnalysis.star.reading}`);

    // 2. Spouse Palace (夫妻宫)
    const palacePrimaryTenGodThai = TEN_GOD_THAI[spouseAnalysis.palace.primaryTenGod] || spouseAnalysis.palace.primaryTenGod;
    sections.push(`\nSpouse Palace (夫妻宫): ${spouseAnalysis.palace.branch} (${palacePrimaryTenGodThai})`);
    sections.push(`- ความมั่นคง: ${spouseAnalysis.palace.stability === "stable" ? "มั่นคง" : spouseAnalysis.palace.stability === "combined" ? "ร่วม (六合)" : spouseAnalysis.palace.stability === "clashed" ? "ถูก clash (冲)" : "ปกติ"}`);
    sections.push(`- ${spouseAnalysis.palace.reading}`);

    // 3. 星宫同参 (Cross-check)
    sections.push(`\n星宫同参 (ดาวคู่ ↔ Palace): ${spouseAnalysis.crossCheckReading}`);

    // 4. 六亲 Map (ทุกบทบาท)
    sections.push("\n六亲 Map (ดาวครอบครัว):");
    const roleLabels: Record<string, string> = {
      spouse: "คู่ครอง",
      father: "บิดา",
      mother: "มารดา",
      son: "บุตรชาย",
      daughter: "บุตรี",
      sibling: "พี่น้อง",
    };

    for (const [role, stars] of Object.entries(sixRelatives)) {
      const starsThai = stars.map(star => TEN_GOD_THAI[star] || star).join("、");
      const roleLabel = roleLabels[role] || role;
      const isPresent = stars.some(star => tenGodProfile.counts[star] > 0);
      const status = isPresent ? "มี" : "ไม่ปรากฏ";
      sections.push(`- ${roleLabel}: ${starsThai} (${status})`);
    }

    // 5. Overall synthesis
    sections.push(`\nสรุปความสัมพันธ์: ${spouseAnalysis.overall}`);

    sections.push(""); // blank line
  }

  // ===== Section 14: Transit Forecasting Context =====
  sections.push("## Transit Forecasting Context (บริบทสำหรับการทำนายอนาคต)");
  if (luck) {
    sections.push(`ปีปัจจุบัน: ${luck.currentAnnual?.year || "ไม่ทราบ"} ค.ศ.`);
    sections.push(`ช่วง Luck Pillar ปัจจุบัน: ${luck.currentPillar ? `${luck.currentPillar.startAge}-${luck.currentPillar.endAge} ปี` : "ยังไม่ถึงช่วง"}`);
    const annualTenGodName = luck.currentAnnual?.tenGod as string | undefined;
    const annualTenGodThai = annualTenGodName ? (TEN_GOD_THAI[annualTenGodName as keyof typeof TEN_GOD_THAI] || annualTenGodName) : "ไม่ทราบ";
    sections.push(`10 God ของปีปัจจุบัน: ${annualTenGodName || "ไม่ทราบ"} (${annualTenGodThai})`);
    const pillarTenGodName = luck.currentPillar?.tenGod as string | undefined;
    const pillarTenGodThai = pillarTenGodName ? (TEN_GOD_THAI[pillarTenGodName as keyof typeof TEN_GOD_THAI] || pillarTenGodName) : "ไม่ทราบ";
    sections.push(`10 God ของ Luck Pillar ปัจจุบัน: ${pillarTenGodName || "ไม่มี"} (${pillarTenGodThai})`);
  } else {
    sections.push("ไม่ระบุปีปัจจุบัน - ไม่สามารถวิเคราะห์ transit");
  }

  sections.push("\n---");
  sections.push("Context จบลงที่นี่ - AI ควรใช้ข้อมูลข้างต้นเท่านั้น ห้ามเดูข้อมูลที่ไม่ได้ให้มา");

  // รวม sections → text
  const text = sections.join("\n");

  // สร้าง summary
  const summary = `${profile.name} (${profile.gender === "male" ? "ชาย" : "หญิง"}) เกิด ${thaiDate} - เจ้าวัน${dayMasterName} (${dayMasterThai}) ธาตุ${dayMasterElement} ${strength.level === "strong" || strength.level === "very_strong" ? "แข็ง" : "อ่อน"} - ${structure.label} - Useful God: ${usefulGod.label}`;

  // สร้าง raw data
  const raw = {
    profile,
    chart,
    strength,
    structure,
    usefulGod,
    godsAndStars,
    interactions,
    elements,
    luck,
  };

  return {
    text,
    summary,
    raw,
  };
}

/**
 * แปลง strength level → ไทย
 */
function getStrengthLevelThai(level: string): string {
  const map: Record<string, string> = {
    very_strong: "แข็งมาก",
    strong: "แข็ง",
    weak: "อ่อน",
    very_weak: "อ่อนมาก",
  };
  return map[level] || level;
}

/**
 * แปลง element level → ไทย
 */
function getElementLevelThai(level: string): string {
  const map: Record<string, string> = {
    dominant: "เด่นมาก",
    high: "เด่น",
    medium: "ปานกลาง",
    low: "น้อย",
    none: "ไม่มี",
  };
  return map[level] || level;
}

/**
 * หา Day Master archetype (คำอธิบายสั้น)
 */
function getDayMasterArchetype(element: string): string {
  const archetypes: Record<string, string> = {
    木: "มีความคิดสร้างสรรค์ ขยันขันแข็ง มุ่งมั่น เติบโตได้ดี ชอบเรียนรู้",
    火: "กระตือรือร้น มีพลังงานสูง ขยัน เปี่ยมด้วยความรู้สึก มีเสน่ห์",
    土: "มั่นคง เชื่อถือได้ ซื่อสัตย์ รับผิดชอบ ชอบความสุขสบาย",
    金: "เข้มแข็ง มีหลักกการ มีวินัย ซื่อสัตย์ เป็นผู้นำ",
    水: "ปรับตัวได้ดี ฉลาด มีไหวพริบ เคลื่อนไหวได้คล่อง ชอบการสื่อสาร",
  };
  return archetypes[element] || "";
}
