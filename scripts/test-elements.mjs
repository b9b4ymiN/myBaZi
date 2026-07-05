// Test Element Composition (สัดส่วน 5 ธาตุ)
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import { analyzeElements } from '../src/lib/bazi/elements.ts';
import { ELEMENT_THAI } from '../src/lib/bazi/types.ts';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) { pass++; } else { fail++; }
}

// Helper: ตรวจ percentage รวม ~100%
function checkPercentages(label, counts) {
  const total = counts.reduce((sum, c) => sum + c.percentage, 0);
  const ok = Math.abs(total - 100) < 0.2; // tolerance 0.2%
  console.log(`${ok ? '✅' : '❌'} ${label}: ${total.toFixed(1)}%${ok ? '' : ` (คาด ~100%)`}`);
  if (ok) { pass++; } else { fail++; }
}

// Helper: ตรวจ 5 elements ครบ
function checkFiveElements(label, counts) {
  const elements = counts.map(c => c.element);
  const expected = ['木', '火', '土', '金', '水'];
  const ok = JSON.stringify(elements) === JSON.stringify(expected);
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(elements)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) { pass++; } else { fail++; }
}

console.log('═══ TEST 1: เคส 1986-05-29 12:00 Shanghai (4 pillars) ═══');
const profile1986Shanghai = {
  id: 't1', name: 'T', gender: 'male',
  birthDate: '1986-05-29', birthTime: '12:00', birthTimeKnown: 'known',
  timezone: 'Asia/Shanghai', createdAt: '', updatedAt: '',
};

const chart1986 = calculateBaZi(profile1986Shanghai);
const elements1986 = analyzeElements(chart1986);

console.log('Chart 1986 Shanghai:');
console.log(`  Year: ${chart1986.year.sixtyCycleName} (stem: ${chart1986.year.stem.name}${ELEMENT_THAI[chart1986.year.stem.element]}, branch: ${chart1986.year.branch.name}${ELEMENT_THAI[chart1986.year.branch.element]})`);
console.log(`  Month: ${chart1986.month.sixtyCycleName} (stem: ${chart1986.month.stem.name}${ELEMENT_THAI[chart1986.month.stem.element]}, branch: ${chart1986.month.branch.name}${ELEMENT_THAI[chart1986.month.branch.element]})`);
console.log(`  Day: ${chart1986.day.sixtyCycleName} (stem: ${chart1986.day.stem.name}${ELEMENT_THAI[chart1986.day.stem.element]}, branch: ${chart1986.day.branch.name}${ELEMENT_THAI[chart1986.day.branch.element]})`);
console.log(`  Hour: ${chart1986.hour.sixtyCycleName} (stem: ${chart1986.hour.stem.name}${ELEMENT_THAI[chart1986.hour.stem.element]}, branch: ${chart1986.hour.branch.name}${ELEMENT_THAI[chart1986.hour.branch.element]})`);

console.log('\nElement counts (นับเองเทียบ):');
console.log('  Stems: 丙(火), 癸(水), 癸(水), 戊(土) → 火=1, 水=2, 土=1');
console.log('  Branches: 寅(木), 巳(火), 酉(金), 午(火) → 木=1, 火=2, 金=1');
console.log('  Hidden stems (ต้องเช็คจาก chart):');

// แสดง hidden stems
const pillars = ['year', 'month', 'day', 'hour'];
for (const pos of pillars) {
  const pillar = chart1986[pos];
  console.log(`    ${pillar.position}: ${pillar.branch.name} (${ELEMENT_THAI[pillar.branch.element]}) →`);
  for (const hidden of pillar.branch.hiddenStems) {
    const weight = hidden.type === 'main' ? 1.0 : hidden.type === 'middle' ? 0.5 : 0.3;
    console.log(`      ${hidden.stem.name}${ELEMENT_THAI[hidden.stem.element]} (${hidden.type}) = ${weight}`);
  }
}

console.log('\nElement composition results:');
console.log(`  Total weight: ${elements1986.totalWeight}`);
console.log(`  Dominant: ${ELEMENT_THAI[elements1986.dominantElement]}`);
console.log(`  Weakest: ${elements1986.weakestElement ? ELEMENT_THAI[elements1986.weakestElement] : 'null'}`);
console.log(`  Missing: ${elements1986.missingElements.map(e => ELEMENT_THAI[e]).join(', ') || 'none'}`);
console.log(`  Balance: ${elements1986.balanceStatus}`);
console.log(`  Description: ${elements1986.description}`);

console.log('\nDetailed counts:');
for (const count of elements1986.counts) {
  console.log(`  ${ELEMENT_THAI[count.element]}: count=${count.count}, percentage=${count.percentage}%, level=${count.level}`);
}

// Verification
check('1.1 Total weight (4+4+hidden), expect >8', elements1986.totalWeight > 8, true);
check('1.2 5 elements ครบ', elements1986.counts.length, 5);
checkFiveElements('1.3 Elements order', elements1986.counts);
checkPercentages('1.4 Percentages sum ~100%', elements1986.counts);
check('1.5 Dominant is not null', elements1986.dominantElement !== null, true);
check('1.6 Missing is array', Array.isArray(elements1986.missingElements), true);
check('1.7 Balance status valid', ['balanced', 'slightly_imbalanced', 'imbalanced'].includes(elements1986.balanceStatus), true);
check('1.8 Description not empty', elements1986.description.length > 0, true);

console.log('\n═══ TEST 2: Unknown birth time (3 pillars only) ═══');
const profileUnknown = {
  ...profile1986Shanghai,
  birthTimeKnown: 'unknown',
  birthTime: null,
};

const chartUnknown = calculateBaZi(profileUnknown);
const elementsUnknown = analyzeElements(chartUnknown);

console.log('Chart unknown time:');
console.log(`  Hour: ${chartUnknown.hour}`);
console.log(`  Total weight: ${elementsUnknown.totalWeight} (ต้องน้อยกว่า 4 pillars)`);
console.log(`  Description: ${elementsUnknown.description}`);

check('2.1 Hour is null', chartUnknown.hour, null);
check('2.2 Total weight < 4 pillars', elementsUnknown.totalWeight < elements1986.totalWeight, true);
check('2.3 5 elements ครบ', elementsUnknown.counts.length, 5);
checkPercentages('2.4 Percentages sum ~100%', elementsUnknown.counts);

console.log('\n═══ TEST 3: ตรวจ level classification ═══');
// หา element ที่มี level ต่างๆ
const levelCounts = {
  none: elements1986.counts.filter(c => c.level === 'none').length,
  low: elements1986.counts.filter(c => c.level === 'low').length,
  medium: elements1986.counts.filter(c => c.level === 'medium').length,
  high: elements1986.counts.filter(c => c.level === 'high').length,
  dominant: elements1986.counts.filter(c => c.level === 'dominant').length,
};
console.log('Level distribution:', levelCounts);
check('3.1 All levels assigned', levelCounts.none + levelCounts.low + levelCounts.medium + levelCounts.high + levelCounts.dominant, 5);

console.log('\n═══ TEST 4: ตรวจ consistency กับ dominant/weakest ═══');
if (elements1986.weakestElement) {
  const dominant = elements1986.counts.find(c => c.element === elements1986.dominantElement);
  const weakest = elements1986.counts.find(c => c.element === elements1986.weakestElement);
  console.log(`Dominant: ${ELEMENT_THAI[elements1986.dominantElement]} (${dominant.percentage}%)`);
  console.log(`Weakest: ${ELEMENT_THAI[elements1986.weakestElement]} (${weakest.percentage}%)`);
  check('4.1 Dominant % >= Weakest %', dominant.percentage >= weakest.percentage, true);
  check('4.2 Dominant weight >= Weakest weight', dominant.weight >= weakest.weight, true);
} else {
  console.log('No weakest element (all may be none?)');
}

console.log('\n═══ TEST 5: ตรวจ missing elements logic ═══');
if (elements1986.missingElements.length > 0) {
  console.log(`Missing: ${elements1986.missingElements.map(e => ELEMENT_THAI[e]).join(', ')}`);
  for (const missing of elements1986.missingElements) {
    const count = elements1986.counts.find(c => c.element === missing);
    check(`5.${missing} Missing element has count=0`, count.count, 0);
    check(`5.${missing} Missing element has level=none`, count.level, 'none');
  }
} else {
  console.log('No missing elements (all 5 present)');
  check('5.1 No missing means all counts > 0', elements1986.counts.every(c => c.count > 0), true);
}

console.log('\n═══ TEST 6: ตรวจ totalWeight consistency ═══');
const calculatedTotal = elements1986.counts.reduce((sum, c) => sum + c.weight, 0);
check('6.1 totalWeight = sum of individual weights', calculatedTotal, elements1986.totalWeight);

console.log('\n═══ TEST 7: ตรวจ description format ═══');
console.log(`Description: "${elements1986.description}"`);
check('7.1 Description contains dominant info', elements1986.description.includes('เด่น') || elements1986.description.includes('ธาตุ'), true);
check('7.2 Description not too long', elements1986.description.length < 200, true);
check('7.3 Description contains balance info', elements1986.description.includes('สมดุล') || elements1986.description.includes('ไม่สมดุล'), true);

console.log('\n═══ SUMMARY ═══');
console.log(`Pass: ${pass}, Fail: ${fail}`);
if (fail > 0) {
  process.exit(1);
}
