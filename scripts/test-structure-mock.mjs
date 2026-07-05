// Mock tests สำหรับ structure logic (follower/special/vibrant) — verify ว่า logic detect พิเศษได้จริง
import { analyzeStructure } from '../src/lib/bazi/structure.ts';
let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? '✅' : '❌'} ${label}: ${actual}${ok ? '' : ` (คาด ${expected})`}`);
  if (ok) pass++; else fail++;
}
function pillar(stemName, stemEl, branchName, branchEl, hidden = []) {
  return { position: 'day', sixtyCycleName: stemName+branchName,
    stem: { name: stemName, element: stemEl, yinYang: '阳', index: 0 },
    branch: { name: branchName, element: branchEl, zodiac: '', direction: '',
      hiddenStems: hidden.map(h => ({ stem: { name: h.name, element: h.el, yinYang: '阳', index: 0 }, type: 'main' })) } };
}
const weak = (dm) => ({ level: 'very_weak', score: -5, factors: [], supportingElements: [], weakeningElements: [], clashNotes: [], summary: '', dayMaster: dm });
const vstrong = (dm) => ({ level: 'very_strong', score: 6, factors: [], supportingElements: [], weakeningElements: [], clashNotes: [], summary: '', dayMaster: dm });

console.log('═══ MOCK A: Follower (从财) — 癸水 very_weak, chart ล้วน 火(wealth) ═══');
const cF = { birthTimeKnown: true, dayMaster: { name:'癸', element:'水', yinYang:'阴', index:9 },
  year: pillar('丁','火','巳','火'), month: pillar('丙','火','午','火'),
  day: pillar('癸','水','丑','土'), hour: pillar('丁','火','巳','火') };
const rF = analyzeStructure(cF, weak(cF.dayMaster));
check('A.1 type=follower', rF.type, 'follower');
check('A.2 subtype=follow_wealth', rF.subtype, 'follow_wealth');

console.log('\n═══ MOCK B: Vibrant (专旺) — 甲木 very_strong, chart ล้วน 木+水 ═══');
const cV = { birthTimeKnown: true, dayMaster: { name:'甲', element:'木', yinYang:'阳', index:0 },
  year: pillar('壬','水','子','水'), month: pillar('癸','水','亥','水'),
  day: pillar('甲','木','寅','木'), hour: pillar('乙','木','卯','木') };
const rV = analyzeStructure(cV, vstrong(cV.dayMaster));
// chart มี 2 elements (木+水) → อาจเป็น special two_element หรือ vibrant — ยอมรับทั้งคู่
check('B.1 type เป็น vibrant หรือ special', (rV.type === 'vibrant' || rV.type === 'special') ? rV.type : 'INVALID', rV.type === 'vibrant' ? 'vibrant' : 'special');

console.log('\n═══ MOCK C: Special two-element (木+火 ล้วน) ═══');
const cS = { birthTimeKnown: true, dayMaster: { name:'丙', element:'火', yinYang:'阳', index:2 },
  year: pillar('甲','木','寅','木'), month: pillar('乙','木','卯','木'),
  day: pillar('丙','火','午','火'), hour: pillar('丁','火','巳','火') };
const rS = analyzeStructure(cS, { level:'strong', score:3, factors:[], supportingElements:[], weakeningElements:[], clashNotes:[], summary:'', dayMaster:cS.dayMaster });
check('C.1 type=special', rS.type, 'special');
check('C.2 subtype=two_element_harmony', rS.subtype, 'two_element_harmony');

console.log('\n═══ MOCK D: Normal — strength strong ปกติ ═══');
const cN = { birthTimeKnown: true, dayMaster: { name:'癸', element:'水', yinYang:'阴', index:9 },
  year: pillar('丙','火','寅','木'), month: pillar('癸','水','巳','火'),
  day: pillar('癸','水','酉','金'), hour: pillar('戊','土','午','火') };
const rN = analyzeStructure(cN, { level:'strong', score:1, factors:[], supportingElements:[], weakeningElements:[], clashNotes:[], summary:'', dayMaster:cN.dayMaster });
check('D.1 type=normal', rN.type, 'normal');

console.log(`\nสรุป: ${pass} ผ่าน, ${fail} ตก จาก ${pass+fail}`);
process.exit(fail > 0 ? 1 : 0);
