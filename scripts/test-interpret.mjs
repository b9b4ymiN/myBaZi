// Test interpretBaZi — ประกอบ DomainInterpretation 7 domains จาก engine features
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import { analyzeStrength } from '../src/lib/bazi/strength.ts';
import { analyzeStructure } from '../src/lib/bazi/structure.ts';
import { analyzeUsefulGod } from '../src/lib/bazi/useful-god.ts';
import { analyzeLuck } from '../src/lib/bazi/luck.ts';
import { analyzeGodsAndStars } from '../src/lib/bazi/gods-stars.ts';
import { analyzeXkdg } from '../src/lib/bazi/xkdg.ts';
import { analyzeElements } from '../src/lib/bazi/elements.ts';
import { analyzeTenGodProfile } from '../src/lib/bazi/ten-god-profile.ts';
import { analyzePalace } from '../src/lib/bazi/palace.ts';
import { analyzeLuckFavorability } from '../src/lib/bazi/luck-favorability.ts';
import { getArchetype } from '../src/lib/bazi/archetypes.ts';
import { interpretBaZi } from '../src/lib/bazi/interpret.ts';

let pass = 0, fail = 0;
function checkTrue(label, ok) {
  console.log(`${ok ? '✅' : '❌'} ${label}`);
  if (ok) pass++; else fail++;
}

function buildAll(profile, year) {
  const chart = calculateBaZi(profile);
  const strength = analyzeStrength(chart);
  const structure = analyzeStructure(chart, strength);
  const usefulGod = analyzeUsefulGod(chart, strength, structure);
  const godsAndStars = analyzeGodsAndStars(chart);
  const luck = analyzeLuck(profile, chart, year);
  const xkdg = analyzeXkdg(profile, chart);
  const elements = analyzeElements(chart);
  const analysis = { chart, strength, structure, usefulGod, godsAndStars, luck, xkdg, elements };
  const tenGodProfile = analyzeTenGodProfile(chart);
  const palace = analyzePalace(chart);
  const luckFavorability = analyzeLuckFavorability(luck, usefulGod);
  const archetype = getArchetype({ name: chart.dayMaster.name, element: chart.dayMaster.element, yinYang: chart.dayMaster.yinYang });
  return interpretBaZi({ profileName: profile.name, analysis, tenGodProfile, palace, luckFavorability, archetype });
}

const DOMAINS = ['personality','career','wealth','relationship','health','timing','family'];

// ── เคส 1993 (丙) ─────────────────────────────────────────────────────
const profile1993 = {
  id: 'ref1993', name: 'เคสอ้างอิง', gender: 'male',
  birthDate: '1993-10-12', birthTime: '12:55', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok', birthLongitude: 99.5, useTrueSolarTime: true,
  createdAt: '', updatedAt: '',
};
const interp1993 = buildAll(profile1993, 2026);

console.log('═══ Interpret 1993 (丙) ═══');
console.log(`profileName: ${interp1993.profileName}`);
for (const d of DOMAINS) {
  const dom = interp1993.domains[d];
  console.log(`\n【${dom.title}】`);
  console.log(`  intro: ${dom.intro}`);
  console.log(`  bullets[0..1]: ${(dom.bullets[0] || '').slice(0,80)} | ${(dom.bullets[1] || '').slice(0,80)}`);
  console.log(`  sources: ${dom.sources.join(', ')}`);
}

// ── structure checks ──
checkTrue('1.1 มี 7 domains', DOMAINS.every(d => interp1993.domains[d] !== undefined));
for (const d of DOMAINS) {
  const dom = interp1993.domains[d];
  checkTrue(`1.x ${d} title ไม่ว่าง`, !!dom.title && dom.title.length > 0);
  checkTrue(`1.x ${d} intro ไม่ว่าง`, !!dom.intro && dom.intro.length > 0);
  checkTrue(`1.x ${d} sources เป็น array`, Array.isArray(dom.sources));
}

// ── DOD หลัก: 丙 vs 丁 ต้องต่างกัน ────────────────────────────────────
const profile1994 = {
  id: 'fon', name: 'น้องฝน', gender: 'female',
  birthDate: '1994-03-22', birthTime: '12:00', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok', createdAt: '', updatedAt: '',
};
const interp1994 = buildAll(profile1994, 2026);

// อย่างน้อย 4 ใน 7 domains ต้องมี intro/bullets/sources ต่างกัน
let diffCount = 0;
for (const d of DOMAINS) {
  const a = interp1993.domains[d];
  const b = interp1994.domains[d];
  const same = JSON.stringify({ i: a.intro, b: a.bullets, s: a.sources }) === JSON.stringify({ i: b.intro, b: b.bullets, s: b.sources });
  if (!same) diffCount++;
}
console.log(`\n═══ 丙 vs 丁 ต่างกัน ${diffCount}/7 domains ═══`);
checkTrue('2.1 丙 vs 丁 ต่างกัน >= 4 domains (DOD)', diffCount >= 4);

// ── Zero Hallucination: health ต้องมี disclaimer ไม่ฟันธง ──────────────
const healthBullets = interp1993.domains.health.bullets.join(' ');
checkTrue('3.1 health มี disclaimer ไม่ฟันธงโรค', /ไม่ใช่การวินิจฉัย|พบแพทย์/.test(healthBullets));

// ── pure + serializable ──
let serializable = true;
try { JSON.parse(JSON.stringify(interp1993)); } catch { serializable = false; }
checkTrue('4.1 serializable', serializable);

// เรียก 2 ครั้ง → deterministic (pure)
const interp1993b = buildAll(profile1993, 2026);
checkTrue('4.2 pure/deterministic (เรียกซ้ำได้ผลเหมือนเดิม)',
  JSON.stringify(interp1993) === JSON.stringify(interp1993b));

console.log(`\n═══ SUMMARY ═══\n✅ Passed: ${pass}\n❌ Failed: ${fail}\nTotal: ${pass + fail}`);
process.exit(fail > 0 ? 1 : 0);
