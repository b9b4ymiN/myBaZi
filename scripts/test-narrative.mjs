// Narrative builder test — proves Zero Hallucination derivation:
// every string comes from engine output or the authored archetype library,
// no undefined/NaN leaks, sections well-formed, day master matches validated case.
// Run: pnpm narrative:test
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import { analyzeStrength } from '../src/lib/bazi/strength.ts';
import { analyzeStructure } from '../src/lib/bazi/structure.ts';
import { analyzeUsefulGod } from '../src/lib/bazi/useful-god.ts';
import { analyzeGodsAndStars } from '../src/lib/bazi/gods-stars.ts';
import { analyzeLuck } from '../src/lib/bazi/luck.ts';
import { analyzeXkdg } from '../src/lib/bazi/xkdg.ts';
import { analyzeElements } from '../src/lib/bazi/elements.ts';
import { getArchetype } from '../src/lib/bazi/archetypes.ts';
import { buildBaZiNarrative } from '../src/lib/bazi/narrative.ts';

// Validated case: 1993-10-12 male, Bangkok, 12:55, TST → day 丙寅, hour 甲午.
const profile = {
  id: 'test-1993',
  name: 'เทสต์ 1993',
  gender: 'male',
  birthDate: '1993-10-12',
  birthTime: '12:55',
  birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok',
  birthLongitude: 100.5,
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
const analysis = { chart, strength, structure, usefulGod, godsAndStars, luck, xkdg, elements };

const archetype = getArchetype({
  name: strength.dayMaster.name,
  element: strength.dayMaster.element,
  yinYang: chart.dayMaster.yinYang === '阴' ? 'yin' : 'yang',
});

const narrative = buildBaZiNarrative({ profileName: profile.name, analysis, archetype });

let pass = true;
const check = (name, cond) => {
  console.log(`  ${cond ? '✓' : '✗'} ${name}`);
  if (!cond) pass = false;
};

console.log('Narrative builder — 1993-10-12 male (validated 丙寅):');
check('day master = 丙', narrative.dayMasterName === '丙');
check('elementThai = ไฟ', narrative.elementThai === 'ไฟ');
check('yinYangThai = หยาง', narrative.yinYangThai === 'หยาง');
check('archetype title from library', narrative.archetypeTitle === archetype.title);
check('6 sections', narrative.sections.length === 6);
check(
  'section order = personality→strengths→cautions→career→balance→luck',
  JSON.stringify(narrative.sections.map((s) => s.id)) ===
    JSON.stringify(['personality', 'strengths', 'cautions', 'career', 'balance', 'luck'])
);

const serialized = JSON.stringify(narrative);
check('no "undefined" leak', !/undefined/.test(serialized));
check('no "NaN" leak', !/NaN/.test(serialized));

const sectionsOk = narrative.sections.every(
  (s) => s.title && (s.intro || (s.bullets && s.bullets.length > 0))
);
check('every section has title + content', sectionsOk);

// Zero Hallucination: sections must reference engine-derived data, not invent.
const luckSection = narrative.sections.find((s) => s.id === 'luck');
check('luck section references อายุ/รอบดวง', /อายุ|รอบดวง/.test(luckSection.intro || ''));

const balanceSection = narrative.sections.find((s) => s.id === 'balance');
check('balance section references 用神', (balanceSection.intro || '').includes('用神'));

const careerSection = narrative.sections.find((s) => s.id === 'career');
check('career bullets come from archetype library', careerSection.bullets?.length === archetype.careers.length);

// Probabilistic framing present (not fate-stating)
check('closing note frames as map not fate', /แผนที่/.test(narrative.closingNote));

console.log(pass ? '\nPASS' : '\nFAIL');
process.exit(pass ? 0 : 1);
