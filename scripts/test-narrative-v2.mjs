// Test buildBaZiNarrativeV2 — narrative v2 ที่ผูกดวงจริง (7 domains)
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
import { buildBaZiNarrativeV2 } from '../src/lib/bazi/narrative-v2.ts';

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
  return buildBaZiNarrativeV2({ profileName: profile.name, analysis, tenGodProfile, palace, luckFavorability, archetype });
}

const profile1993 = {
  id: 'ref1993', name: 'เคสอ้างอิง', gender: 'male',
  birthDate: '1993-10-12', birthTime: '12:55', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok', birthLongitude: 99.5, useTrueSolarTime: true,
  createdAt: '', updatedAt: '',
};
const n1993 = buildAll(profile1993, 2026);

console.log('═══ Narrative v2 — 1993 (丙) ═══');
console.log(`opening: ${n1993.opening}`);
console.log(`sections: ${n1993.sections.map(s => s.id).join(', ')}`);

// ── shape (backward-compat กับ v1) ──
checkTrue('1.1 profileName ไม่ว่าง', !!n1993.profileName);
checkTrue('1.2 dayMasterName = 丙', n1993.dayMasterName === '丙');
checkTrue('1.3 elementThai = ไฟ', n1993.elementThai === 'ไฟ');
checkTrue('1.4 yinYangThai = หยาง', n1993.yinYangThai === 'หยาง');
checkTrue('1.5 archetypeTitle ไม่ว่าง', !!n1993.archetypeTitle);
checkTrue('1.6 opening ไม่ว่าง', !!n1993.opening && n1993.opening.length > 0);
checkTrue('1.7 closingNote ไม่ว่าง', !!n1993.closingNote && n1993.closingNote.length > 0);

// ── DOD หลัก: 7 sections + id ตรง ──
const EXPECTED = ['personality','career','wealth','relationship','health','timing','family'];
checkTrue('2.1 มี 7 sections', n1993.sections.length === 7);
checkTrue('2.2 section ids = 7 domains', JSON.stringify(n1993.sections.map(s => s.id)) === JSON.stringify(EXPECTED));
for (const s of n1993.sections) {
  checkTrue(`2.x section ${s.id} มี title+intro`, !!s.title && !!s.intro);
}

// ── DOD: 丙 vs 丁 ต่างกัน ──
const profile1994 = {
  id: 'fon', name: 'น้องฝน', gender: 'female',
  birthDate: '1994-03-22', birthTime: '12:00', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok', createdAt: '', updatedAt: '',
};
const n1994 = buildAll(profile1994, 2026);

let diffSections = 0;
for (let i = 0; i < 7; i++) {
  if (JSON.stringify(n1993.sections[i]) !== JSON.stringify(n1994.sections[i])) diffSections++;
}
console.log(`═══ 丙 vs 丁 ต่างกัน ${diffSections}/7 sections ═══`);
checkTrue('3.1 丙 vs 丁 ต่างกัน >= 4 sections (DOD)', diffSections >= 4);

// ── DOD: ไม่ฟันธงสุขภาพร้ายแรง + closingNote มี disclaimer ──
// (เช็คเฉพาะ health section — ไม่ใช่ทั้ง narrative เพราะ "ตายตัว" ใน closingNote = fixed/rigid ไม่ใช่ die)
const healthSec = n1993.sections.find(s => s.id === 'health');
const healthText = JSON.stringify(healthSec);
const BANNED = ['มะเร็ง', 'จะตาย', 'ตายแน่นอน', 'เป็นโรคร้ายแรง', 'แน่นอนว่าจะเป็น', 'ต้องเป็นมะเร็ง'];
checkTrue('4.1 health ไม่มีคำฟันธงร้ายแรง', !BANNED.some(w => healthText.includes(w)));
checkTrue('4.2 closingNote มี disclaimer สุขภาพ (พบแพทย์)', /พบแพทย์|ไม่ใช่โชคชะตา/.test(n1993.closingNote));
checkTrue('4.3 health มีคำ probabilistic (มัก/ควร/สังเกต)', /มัก|ควร|สังเกต|แนวโน้ม/.test(healthText));

// ── serializable + pure ──
let serializable = true;
try { JSON.parse(JSON.stringify(n1993)); } catch { serializable = false; }
checkTrue('5.1 serializable', serializable);
const n1993b = buildAll(profile1993, 2026);
checkTrue('5.2 pure/deterministic', JSON.stringify(n1993) === JSON.stringify(n1993b));

console.log(`\n═══ SUMMARY ═══\n✅ Passed: ${pass}\n❌ Failed: ${fail}\nTotal: ${pass + fail}`);
process.exit(fail > 0 ? 1 : 0);
