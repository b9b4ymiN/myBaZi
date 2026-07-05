// Baseline capture — dump full BaZi engine output for the reference case.
// Run: pnpm tsx scripts/capture-baseline.mjs [before|after]
//   tag (default 'after') กำหนดชื่อไฟล์ → engine-1993-male-lampang-<tag>.json
//   ⚠️ ห้ามรันไม่ระบุ tag เมื่อต้องการเก็บ BEFORE (จะเขียนทับ)
import { writeFileSync, mkdirSync } from 'node:fs';
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import { analyzeStrength } from '../src/lib/bazi/strength.ts';
import { analyzeStructure } from '../src/lib/bazi/structure.ts';
import { analyzeUsefulGod } from '../src/lib/bazi/useful-god.ts';
import { analyzeGodsAndStars } from '../src/lib/bazi/gods-stars.ts';
import { analyzeLuck } from '../src/lib/bazi/luck.ts';
import { analyzeXkdg } from '../src/lib/bazi/xkdg.ts';
import { analyzeElements } from '../src/lib/bazi/elements.ts';
import { analyzeTenGodProfile } from '../src/lib/bazi/ten-god-profile.ts';
import { analyzePalace } from '../src/lib/bazi/palace.ts';
import { analyzeLuckFavorability, summarizeLuckTimeline } from '../src/lib/bazi/luck-favorability.ts';
import { getArchetype } from '../src/lib/bazi/archetypes.ts';
import { buildBaZiNarrativeV2 } from '../src/lib/bazi/narrative-v2.ts';
import { buildBaZiContext } from '../src/lib/ai/bazi-context.ts';

const TAG = process.argv[2] ?? 'after';

// Reference case the user linked to: ชาย 12 ต.ค. 2536 12:55 Asia/Bangkok เกิดที่ลำปาง
// Lampang ≈ 18.29°N, 99.50°E
const profile = {
  id: 'baseline-1993-male-lampang',
  name: 'เคสอ้างอิง (ชาย ลำปาง)',
  gender: 'male',
  birthDate: '1993-10-12',
  birthTime: '12:55',
  birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok',
  birthLongitude: 99.5,
  useTrueSolarTime: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const currentYear = 2026;
const chart = calculateBaZi(profile);
const strength = analyzeStrength(chart);
const structure = analyzeStructure(chart, strength);
const usefulGod = analyzeUsefulGod(chart, strength, structure);
const godsAndStars = analyzeGodsAndStars(chart);
const luck = analyzeLuck(profile, chart, currentYear);
const xkdg = analyzeXkdg(profile, chart);
const elements = analyzeElements(chart);
const tenGodProfile = analyzeTenGodProfile(chart);
const palace = analyzePalace(chart);
const luckFavorability = analyzeLuckFavorability(luck, usefulGod);
const timelineSummary = summarizeLuckTimeline(luckFavorability);
const analysis = { chart, strength, structure, usefulGod, godsAndStars, luck, xkdg, elements, tenGodProfile, palace, luckFavorability };

const archetype = getArchetype({
  name: strength.dayMaster.name,
  element: strength.dayMaster.element,
  yinYang: chart.dayMaster.yinYang === '阴' ? 'yin' : 'yang',
});
const narrative = buildBaZiNarrativeV2({ profileName: profile.name, analysis, tenGodProfile, palace, luckFavorability, archetype });
const context = buildBaZiContext(profile, currentYear);

mkdirSync('docs/baseline', { recursive: true });
const out = {
  capturedAt: new Date().toISOString(),
  tag: TAG,
  note: `${TAG.toUpperCase()} snapshot — /bazi content layer (narrative v2 + analyzers).`,
  profile,
  currentYear,
  chart,
  strength,
  structure,
  usefulGod,
  godsAndStars,
  elements,
  luck,
  tenGodProfile,
  palace,
  luckFavorability,
  timelineSummary,
  narrative,
  aiContextText: context.text,
};
const filename = `engine-1993-male-lampang-${TAG}.json`;
writeFileSync(`docs/baseline/${filename}`, JSON.stringify(out, null, 2));

const hour = chart.hour?.sixtyCycleName ?? '(ไม่ทราบเวลา)';
console.log(`=== ${TAG.toUpperCase()}: ชาย 1993-10-12 12:55 ลำปาง (TST, long 99.5) ===`);
console.log('4 เสา (ปี/เดือน/วัน/ชม.):', chart.year.sixtyCycleName, chart.month.sixtyCycleName, chart.day.sixtyCycleName, hour);
console.log('เจ้าวัน:', chart.dayMaster.name, chart.dayMaster.element, chart.dayMaster.yinYang, '| strength:', strength.level, '(score', strength.score + ')');
console.log('โครงสร้าง:', structure.label);
console.log('用神:', usefulGod.label, '| avoid:', usefulGod.avoidElements.join(''));
console.log('ธาตุเด่น/ขาด:', elements.dominantElement, '/', elements.missingElements.join('') || '(ไม่ขาด)');
console.log('ดาว:', godsAndStars.stars.map((s) => s.name).join(', ') || '(ไม่มี)');
console.log('luck current:', luck.currentPillar?.sixtyCycleName ?? '-', '| annual', luck.currentAnnual?.sixtyCycleName ?? '-');
console.log('ten god profile: dominant=', tenGodProfile.dominantGods.join(','), '| primaryGroup=', tenGodProfile.primaryGroup);
console.log('spouse palace:', palace.spouse.branch.name, '→', palace.spouse.branchPrimaryTenGod);
console.log('luck timeline:', timelineSummary.summary);
console.log('\nnarrative.opening:\n ', narrative.opening);
console.log('\nsections:', narrative.sections.map((s) => s.id).join(' → '));
console.log(`\n✓ saved → docs/baseline/${filename}`);
