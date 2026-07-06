/**
 * Relationship Context Builder — รวบข้อมูลคู่ครอง → context ภาษาไทยสำหรับ AI 天机
 *
 * สร้าง compressed digest สำหรับคู่ครอง N=1 (สนับสนุน N up to 3 ในอนาคต)
 * เป้าหมาย: token budget ~250-400 (ไม่ใช่ full natal context)
 *
 * Structure ของ context:
 * 1. Self one-liner (name, gender, day master)
 * 2. Partner one-liner (name, gender, relationship role, day master)
 * 3. Day-master comparison (stems combine, element interaction, ten gods, reading)
 * 4. Cross-chart signals (high+medium weight, ไม่ใช่ full 4×4 matrix)
 * 5. Three-harmony (frame + type)
 * 6. Partner spouse snapshot (gendered spouse star, palace stability, overall)
 * 7. Overall compatibility assessment
 */

import type { Profile, RelationshipRole } from "@/types/profile";
import type { SixRelativeTargetRole } from "./intent-detector";
import { calculateBaZi } from "@/lib/bazi/calculate";
import { analyzeStrength } from "@/lib/bazi/strength";
import { analyzeStructure } from "@/lib/bazi/structure";
import { analyzeUsefulGod } from "@/lib/bazi/useful-god";
import { analyzeTenGodProfile } from "@/lib/bazi/ten-god-profile";
import { analyzePalace } from "@/lib/bazi/palace";
import { analyzeSpouse } from "@/lib/bazi/spouse-analysis";
import { analyzeCrossChart } from "@/lib/bazi/cross-chart";
import { relationshipLabel } from "@/lib/bazi/relationship-labels";
import { ELEMENT_THAI, YINYANG_THAI } from "@/lib/bazi/types";
import { TEN_GOD_THAI } from "@/types/bazi-gods-stars";
import { STEM_THAI } from "@/lib/bazi/pinyin";

/**
 * ผลลัพธ์จาก buildRelationshipContext()
 */
export interface RelationshipContextResult {
  /** Context ภาษาไทย (compressed) */
  text: string;
  /** ชื่อคู่ครอง */
  partnerName: string;
}

/**
 * Priority order สำหรับ targetRole="any-relative" (คำถามกว้าง "ครอบครัว/พ่อแม่")
 * เลือกคนแรกที่เจอตามลำดับ: คู่ครอง → แม่ → พ่อ → ลูกชาย → ลูกสาว → พี่น้อง
 */
const ANY_RELATIVE_PRIORITY: RelationshipRole[] = [
  "spouse", "mother", "father", "son", "daughter", "sibling",
];

/**
 * ผลลัพธ์จาก findRelativeProfile() — profile ที่ match + metadata สำหรับ note
 */
export interface RelativeMatch {
  /** Profile ของ relative ที่ match (createdAt เร็วที่สุดใน role เดียวกัน) */
  profile: Profile;
  /** Role จริงของ relative ที่ match */
  role: RelationshipRole;
  /** จำนวน relative ใน role เดียวกัน — >1 → context จะเพิ่ม note "มีหลายคน" */
  sameRoleCount: number;
}

/**
 * แม็พ targetRole (จาก intent) → รายการ role ใน store ที่จะค้นหา
 */
function resolveSearchRoles(targetRole: SixRelativeTargetRole): RelationshipRole[] {
  if (targetRole === "any-relative") return ANY_RELATIVE_PRIORITY;
  if (targetRole === "child") return ["son", "daughter"];
  return [targetRole as RelationshipRole];
}

/**
 * หา relative profile ที่ตรงกับ role ที่ user ถาม (N=1)
 *
 * - exclude self (id ตรง หรือ relationship==="self")
 * - ค้นตาม priority ของ role (เฉพาะ any-relative/child มีหลาย role)
 * - หลายคนใน role เดียวกัน → เลือก createdAt เร็วที่สุด + sameRoleCount > 1 (สำหรับ note)
 *
 * @param profiles - ทุก profile ใน store
 * @param self - profile ที่เป็นตัวเอง
 * @param targetRole - role ที่ user ถาม (จาก detectSixRelativeRole)
 * @returns RelativeMatch หรือ null ถ้าไม่มี relative ตรงในระบบ
 */
export function findRelativeProfile(
  profiles: Profile[],
  self: Profile,
  targetRole: SixRelativeTargetRole
): RelativeMatch | null {
  const candidates = profiles.filter(
    (p) => p.id !== self.id && p.relationship && p.relationship !== "self"
  );

  const searchRoles = resolveSearchRoles(targetRole);

  for (const role of searchRoles) {
    const matches = candidates
      .filter((p) => p.relationship === role)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (matches.length > 0) {
      return { profile: matches[0], role, sameRoleCount: matches.length };
    }
  }

  return null;
}

/**
 * สร้าง Relationship Context (คู่เทียบดวง) — compressed digest
 *
 * @param self - Profile ของตัวเอง
 * @param partner - Profile ของคู่ครอง
 * @param currentYear - ปีปัจจุบัน (ค.ศ.)
 * @returns RelationshipContextResult - context ภาษาไทย + partner name
 */
export function buildRelationshipContext(
  self: Profile,
  partner: Profile,
  _currentYear: number, // Reserved for future date-specific compatibility analysis
  options?: {
    /** จำนวน relative ใน role เดียวกัน — >1 → เพิ่ม note "มีหลายคนในระบบ" */
    sameRoleCount?: number;
  }
): RelationshipContextResult {
  // ===== Compute charts & analyzers =====
  const selfChart = calculateBaZi(self);
  const partnerChart = calculateBaZi(partner);

  // Self analyzers (computed for future extensibility, v1 uses only chart + day master)
  const selfStrength = analyzeStrength(selfChart);
  const selfStructure = analyzeStructure(selfChart, selfStrength);
  // Note: following computed for future N>1 partner scenarios, eslint-disable unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selfUsefulGod = analyzeUsefulGod(selfChart, selfStrength, selfStructure);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selfTenGodProfile = analyzeTenGodProfile(selfChart);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selfPalace = analyzePalace(selfChart);

  // Partner analyzers
  const partnerStrength = analyzeStrength(partnerChart);
  const partnerStructure = analyzeStructure(partnerChart, partnerStrength);
  const partnerUsefulGod = analyzeUsefulGod(partnerChart, partnerStrength, partnerStructure);
  const partnerTenGodProfile = analyzeTenGodProfile(partnerChart);
  const partnerPalace = analyzePalace(partnerChart);

  // Cross-chart analysis
  const crossChart = analyzeCrossChart(selfChart, partnerChart);

  // Spouse analysis (partner-focused)
  const partnerSpouse = analyzeSpouse(
    partnerChart,
    partner.gender,
    partnerStrength,
    partnerUsefulGod,
    partnerTenGodProfile,
    partnerPalace
  );

  // ===== Build compressed Thai digest =====
  const sections: string[] = [];

  // ===== Header =====
  // relabel ตาม role จริงของ relative ("ความสัมพันธ์กับแม่" แทน "合婚 Context")
  // fallback "คู่เทียบดวง" ถ้า profile นั้นไม่ได้ตั้ง relationship
  const partnerRoleLabel = relationshipLabel(partner.relationship);
  const headerRole = partnerRoleLabel !== "—" ? partnerRoleLabel : "คู่เทียบดวง";
  sections.push(`## ความสัมพันธ์กับ ${headerRole}`);

  // Note: ถ้ามี relative หลายคนใน role เดียวกัน → flag ให้ AI รู้ว่า context นี้เฉพาะคนที่เลือก
  if (options?.sameRoleCount && options.sameRoleCount > 1) {
    sections.push(
      `> ⚠️ หมายเหตุ: มี${headerRole} ${options.sameRoleCount} คนในระบบ — context นี้วิเคราะห์เฉพาะ "${partner.name}" (เพิ่มก่อนสุด) เท่านั้น`
    );
  }

  // ===== Self one-liner =====
  const selfDMThai = STEM_THAI[selfChart.dayMaster.name] || selfChart.dayMaster.name;
  const selfElementThai = ELEMENT_THAI[selfChart.dayMaster.element];
  const selfYinYangThai = YINYANG_THAI[selfChart.dayMaster.yinYang];
  const selfGenderThai = self.gender === "male" ? "ชาย" : "หญิง";

  sections.push(`**ตัวเอง:** ${self.name} (${selfGenderThai}) — เสาวัน ${selfChart.dayMaster.name} (${selfDMThai}) ธาตุ${selfElementThai} ${selfYinYangThai}`);

  // ===== Partner one-liner =====
  const partnerDMThai = STEM_THAI[partnerChart.dayMaster.name] || partnerChart.dayMaster.name;
  const partnerElementThai = ELEMENT_THAI[partnerChart.dayMaster.element];
  const partnerYinYangThai = YINYANG_THAI[partnerChart.dayMaster.yinYang];
  const partnerGenderThai = partner.gender === "male" ? "ชาย" : "หญิง";
  const partnerRoleThai = relationshipLabel(partner.relationship);

  sections.push(`**คู่เทียบ:** ${partner.name} (${partnerGenderThai}${partnerRoleThai !== "—" ? `, ${partnerRoleThai}` : ""}) — เสาวัน ${partnerChart.dayMaster.name} (${partnerDMThai}) ธาตุ${partnerElementThai} ${partnerYinYangThai}`);

  // ===== Day-master comparison =====
  sections.push("\n### เปรียบเทียบเสาวัน (Day Master)");
  const dmc = crossChart.dayMasterComparison;

  // Stem combination (五合)
  if (dmc.stemCombines && dmc.transformElement) {
    const transformThai = ELEMENT_THAI[dmc.transformElement];
    sections.push(`- **天干五合:** เสาวันผนึกกัน (${dmc.ownerStem}+${dmc.relatedStem} → แปรสภาพเป็น${transformThai}) — คู่มีสายสัมพันธ์แน่น`);
  } else if (!dmc.stemCombines) {
    sections.push(`- **天干五合:** เสาวันไม่ผนึกกัน (${dmc.ownerStem}+${dmc.relatedStem})`);
  }

  // Element interaction
  const elementInteractionThai: Record<typeof dmc.elementInteraction, string> = {
    same: "ธาตุเดียวกัน — เข้าใจกันง่าย",
    "i-generate": "ธาตุเกื้อกูลกัน (เกิดสู้คุม) — มีแนวโน้มสนับสนุน",
    "generates-me": "ธาตุเกื้อกูลกัน (ถูกเกิด) — มีแนวโน้มอุปถัมภ์",
    "i-control": "ธาตุคุม-ถูกคุม — อาจมีความตึงเครียดบ้าง",
    "controls-me": "ธาตุคุม-ถูกคุม — อาจมีความตึงเครียดบ้าง",
  };
  sections.push(`- **ความสัมพันธ์ธาตุ:** ${elementInteractionThai[dmc.elementInteraction]}`);

  // Ten gods (mutual perception)
  const tenGodOwnerThai = TEN_GOD_THAI[dmc.tenGodOwnerSeesRelated] || dmc.tenGodOwnerSeesRelated;
  const tenGodRelatedThai = TEN_GOD_THAI[dmc.tenGodRelatedSeesOwner] || dmc.tenGodRelatedSeesOwner;
  sections.push(`- **Ten Gods (มองกัน):** ตัวเองมองคู่เป็น ${tenGodOwnerThai} | คู่มองตัวเองเป็น ${tenGodRelatedThai}`);

  // Day master reading (from engine)
  if (dmc.reading) {
    sections.push(`- **สรุปเสาวัน:** ${dmc.reading}`);
  }

  // ===== Cross-chart signals (high+medium only, compressed) =====
  sections.push("\n### สัญญาณความเข้ากัน (Compatibility Signals)");
  const highMediumSignals = crossChart.signals.filter(s => s.weight === "high" || s.weight === "medium");

  if (highMediumSignals.length > 0) {
    for (const signal of highMediumSignals) {
      const directionEmoji = signal.direction === "harmonious" ? "🟢" : signal.direction === "tense" ? "🔴" : "⚪";
      const weightThai = signal.weight === "high" ? "[สำคัญ]" : "[ปานกลาง]";
      sections.push(`- ${directionEmoji} **${signal.label}** ${weightThai}: ${signal.note}`);
    }
  } else {
    sections.push("- ไม่พบสัญญาณสำคัญระดับสูง/ปานกลาง");
  }

  // ===== Three-harmony =====
  sections.push("\n### 三合 (Three-Way Harmony)");
  if (crossChart.threeHarmony.found) {
    const typeThai = crossChart.threeHarmony.type === "half" ? "半三合" : "三合เต็ม";
    const strengthThai = crossChart.threeHarmony.strength === "strong" ? "แรง" : "อ่อน";
    const transformThai = crossChart.threeHarmony.transformElement ? ELEMENT_THAI[crossChart.threeHarmony.transformElement] : "";
    sections.push(`- **พบ ${typeThai}:** ${crossChart.threeHarmony.frame} ${transformThai ? `→ แปรสภาพเป็น${transformThai}` : ""} (${strengthThai}) — สายสัมพันธ์กลมกลืน`);
  } else {
    sections.push("- ไม่พบ 三合/半三合 ในดวงคู่");
  }

  // ===== Partner spouse snapshot =====
  sections.push("\n### ดาวคู่ครองของคู่เทียบ (Partner Spouse Star)");

  // Spouse star presence + quality
  const spouseStarThai = partnerSpouse.star.stars.map(star => TEN_GOD_THAI[star] || star).join("、");
  const qualityThai = partnerSpouse.star.quality === "strong" ? "แข็งแรง" :
                      partnerSpouse.star.quality === "moderate" ? "ปรากฏ" :
                      partnerSpouse.star.quality === "weak" ? "อ่อน" : "ไม่ปรากฏ";
  const dominantThai = partnerSpouse.star.dominant ? " (เด่น)" : "";
  const usefulGodThai = partnerSpouse.star.isUsefulGod ? " · เป็น用神" : "";
  const avoidGodThai = partnerSpouse.star.isAvoidGod ? " · เป็น忌神" : "";

  sections.push(`- **ดาวคู่ครอง:** ${spouseStarThai}`);
  sections.push(`  - สถานะ: ${qualityThai}${dominantThai}${usefulGodThai}${avoidGodThai}`);
  sections.push(`  - ${partnerSpouse.star.reading}`);

  // Spouse palace stability
  const palacePrimaryThai = TEN_GOD_THAI[partnerSpouse.palace.primaryTenGod] || partnerSpouse.palace.primaryTenGod;
  const stabilityThai = partnerSpouse.palace.stability === "stable" ? "มั่นคง" :
                       partnerSpouse.palace.stability === "combined" ? "ร่วม (六合)" :
                       partnerSpouse.palace.stability === "clashed" ? "ถูก clash (冲)" : "ปกติ";

  sections.push(`\n- **Spouse Palace (夫妻宫):** ${partnerSpouse.palace.branch} (${palacePrimaryThai})`);
  sections.push(`  - ความมั่นคง: ${stabilityThai}`);
  sections.push(`  - ${partnerSpouse.palace.reading}`);

  // Cross-check (星宫同参)
  sections.push(`\n- **星宫同参 (ดาวคู่ ↔ Palace):** ${partnerSpouse.crossCheckReading}`);

  // ===== Overall compatibility =====
  sections.push("\n### สรุปความเข้ากัน (Overall Compatibility)");
  sections.push(crossChart.overall);

  // ===== Compose text =====
  const text = sections.join("\n");

  return {
    text,
    partnerName: partner.name,
  };
}
