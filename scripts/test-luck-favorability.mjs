// Test analyzeLuckFavorability — เทียบ luck pillar/annual กับ 用/喜/忌神 → รุ่ง/กลาง/ระวัง
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import { analyzeStrength } from '../src/lib/bazi/strength.ts';
import { analyzeStructure } from '../src/lib/bazi/structure.ts';
import { analyzeUsefulGod } from '../src/lib/bazi/useful-god.ts';
import { analyzeLuck } from '../src/lib/bazi/luck.ts';
import { analyzeLuckFavorability } from '../src/lib/bazi/luck-favorability.ts';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) pass++; else fail++;
}
function checkTrue(label, ok) {
  console.log(`${ok ? '✅' : '❌'} ${label}`);
  if (ok) pass++; else fail++;
}

// ── MOCK test: control input เพื่อ verify logic แม่น ──────────────────
// 用神 金, 喜神 [水], 忌神 [木, 火]
const mockUsefulGod = {
  primaryElement: '金',
  primaryRelationship: 'wealth',
  secondaryElements: ['水'],
  avoidElements: ['木', '火'],
  label: '', labelCn: '', description: '', reasons: [], applicationTips: '',
};
const mockLuck = {
  direction: 'forward',
  startAge: 3,
  currentPillar: null,
  currentAnnual: null,
  upcomingTransitions: [],
  pillars: [
    // index 0: stem 庚(金) branch 酉(金) → +1 +1 = 2 → favorable
    { index: 0, sixtyCycleName: '庚酉', startAge: 3, endAge: 12, stem: { name: '庚', element: '金' }, branch: { name: '酉', element: '金' }, tenGod: '偏财', isCurrent: false },
    // index 1: stem 甲(木) branch 巳(火) → -1 -1 = -2 → unfavorable
    { index: 1, sixtyCycleName: '甲巳', startAge: 13, endAge: 22, stem: { name: '甲', element: '木' }, branch: { name: '巳', element: '火' }, tenGod: '偏印', isCurrent: true },
    // index 2: stem 壬(水) branch 辰(土) → +0.5 + 0 = 0.5 → favorable
    { index: 2, sixtyCycleName: '壬辰', startAge: 23, endAge: 32, stem: { name: '壬', element: '水' }, branch: { name: '辰', element: '土' }, tenGod: '七杀', isCurrent: false },
    // index 3: stem 戊(土) branch 丑(土) → 0 → neutral
    { index: 3, sixtyCycleName: '戊丑', startAge: 33, endAge: 42, stem: { name: '戊', element: '土' }, branch: { name: '丑', element: '土' }, tenGod: '食神', isCurrent: false },
  ],
};

const mockResult = analyzeLuckFavorability(mockLuck, mockUsefulGod);

console.log('═══ MOCK test ═══');
for (const p of mockResult.pillars) {
  console.log(`${p.startAge}-${p.endAge} ${p.sixtyCycleName}: ${p.favorabilityTh} (score ${p.score})`);
}

check('1.1 pillar 0 (庚酉 双金) score = 2', mockResult.pillars[0].score, 2);
check('1.2 pillar 0 favorable', mockResult.pillars[0].favorability, 'favorable');
check('1.3 pillar 0 reasons มี 2 ตัว (stem+branch ทั้ง 用神)', mockResult.pillars[0].reasons.length, 2);

check('1.4 pillar 1 (甲巳 木火) score = -2', mockResult.pillars[1].score, -2);
check('1.5 pillar 1 unfavorable', mockResult.pillars[1].favorability, 'unfavorable');

check('1.6 pillar 2 (壬辰 水/土) score = 0.5', mockResult.pillars[2].score, 0.5);
check('1.7 pillar 2 favorable (喜神)', mockResult.pillars[2].favorability, 'favorable');

check('1.8 pillar 3 (戊丑 双土) score = 0', mockResult.pillars[3].score, 0);
check('1.9 pillar 3 neutral', mockResult.pillars[3].favorability, 'neutral');
check('1.10 pillar 3 reasons บอก "ไม่เติม"', mockResult.pillars[3].reasons[0].includes('ไม่เติม'), true);

// current detection
check('1.11 current = pillar index 1 (isCurrent)', mockResult.current?.index, 1);

// ── Real 1993 test ────────────────────────────────────────────────────
const profile = {
  id: 'ref1993', name: 'เคสอ้างอิง', gender: 'male',
  birthDate: '1993-10-12', birthTime: '12:55', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok', birthLongitude: 99.5, useTrueSolarTime: true,
  createdAt: '', updatedAt: '',
};
const chart = calculateBaZi(profile);
const strength = analyzeStrength(chart);
const structure = analyzeStructure(chart, strength);
const usefulGod = analyzeUsefulGod(chart, strength, structure);
const luck = analyzeLuck(profile, chart, 2026);

console.log('\n═══ Real 1993 ═══');
console.log(`用神: ${usefulGod.primaryElement} | 喜神: [${usefulGod.secondaryElements}] | 忌神: [${usefulGod.avoidElements}]`);
const real = analyzeLuckFavorability(luck, usefulGod);
for (const p of real.pillars) {
  console.log(`${p.startAge}-${p.endAge} ${p.sixtyCycleName}: ${p.favorabilityTh} (score ${p.score}) ${p.isCurrent ? '★' : ''}`);
}

// DOD หลัก: 用神金 → ทุก pillar ที่ stem/branch = 金 ต้อง favorable หรือ neutral (ถ้ามี 忌 ด้วย)
// ที่สำคัญ: consistency ระหว่าง score กับ favorability label
for (const fp of real.pillars) {
  if (fp.score > 0) {
    checkTrue(`2.x pillar ${fp.sixtyCycleName} score>0 → favorable`, fp.favorability === 'favorable');
  } else if (fp.score < 0) {
    checkTrue(`2.x pillar ${fp.sixtyCycleName} score<0 → unfavorable`, fp.favorability === 'unfavorable');
  } else {
    checkTrue(`2.x pillar ${fp.sixtyCycleName} score=0 → neutral`, fp.favorability === 'neutral');
  }
}

// มี favorable อย่างน้อย 1 (8 pillars ~ เจอ 用/喜 แน่)
const hasFav = real.pillars.some((p) => p.favorability === 'favorable');
checkTrue('2.x มีอย่างน้อย 1 pillar favorable', hasFav);

// serializable
let serializable = true;
try { JSON.parse(JSON.stringify(real)); } catch { serializable = false; }
check('2.x serializable', serializable, true);

console.log(`\n═══ SUMMARY ═══\n✅ Passed: ${pass}\n❌ Failed: ${fail}\nTotal: ${pass + fail}`);
process.exit(fail > 0 ? 1 : 0);
