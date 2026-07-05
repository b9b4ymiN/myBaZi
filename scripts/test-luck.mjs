/**
 * Test script for Luck Pillars (大运) + Annual (流年) + Transit
 *
 * ทดสอบ analyzeLuck() function ว่าคำนวณถูกต้อง:
 * 1. Direction (阳男/阴女 forward, อื่น backward)
 * 2. startAge ของ luck pillar แรก = cl.getEndAge() (verified 1986 male = 3)
 * 3. 8 pillars ครบ, age ต่อเนื่อง
 * 4. Stem/branch element derive ถูก
 * 5. CurrentPillar detect ถูก
 * 6. TenGod ของ pillar stem เทียบ day master ถูก
 * 7. UpcomingTransitions มีค่า
 */

import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import { analyzeLuck } from '../src/lib/bazi/luck.ts';

// Test profiles
const male1986 = {
  id: 'test-1',
  name: 'Male 1986',
  gender: 'male',
  birthDate: '1986-05-29',
  birthTime: '12:00',
  birthTimeKnown: 'known',
  timezone: 'Asia/Shanghai',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const female1986 = {
  id: 'test-2',
  name: 'Female 1986',
  gender: 'female',
  birthDate: '1986-05-29',
  birthTime: '12:00',
  birthTimeKnown: 'known',
  timezone: 'Asia/Shanghai',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Assertions counter
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.error(`✗ ${message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message) {
  const condition = actual === expected;
  if (condition) {
    console.log(`✓ ${message} (expected: ${expected}, actual: ${actual})`);
    passed++;
  } else {
    console.error(`✗ ${message} (expected: ${expected}, actual: ${actual})`);
    failed++;
  }
}

console.log('=== Test Luck Pillars Analysis ===\n');

// Test 1: Male 1986 (丙寅 - 阳年男 → forward)
console.log('Test 1: Male 1986 (丙寅 - 阳年男)');
const maleChart = calculateBaZi(male1986);
const maleLuck = analyzeLuck(male1986, maleChart, 2026);

console.log('Day Master:', maleChart.dayMaster.name, maleChart.dayMaster.element, maleChart.dayMaster.yinYang);
console.log('Year Pillar:', maleChart.year.sixtyCycleName, '(', maleChart.year.stem.name + maleChart.year.stem.yinYang, ')');

assertEqual(maleLuck.direction, 'forward', 'Direction should be forward (阳年男 → forward)');
assertEqual(maleLuck.startAge, 3, 'startAge ของ luck pillar แรก = 3 (verified)');
assertEqual(maleLuck.pillars.length, 8, '8 pillars ครบ');

// Check pillar แรก
const firstPillar = maleLuck.pillars[0];
assertEqual(firstPillar.sixtyCycleName, '甲午', 'Pillar แรก = 甲午');
assertEqual(firstPillar.startAge, 3, 'Pillar แรก startAge = 3');
assertEqual(firstPillar.endAge, 12, 'Pillar แรก endAge = 12 (3+9)');

// Check stem/branch elements
assertEqual(firstPillar.stem.element, '木', '甲 stem element = 木');
assertEqual(firstPillar.branch.element, '火', '午 branch element = 火');

// Check age ต่อเนื่อง (pillar[i].endAge + 1 == pillar[i+1].startAge)
for (let i = 0; i < 7; i++) {
  assertEqual(
    maleLuck.pillars[i].endAge + 1,
    maleLuck.pillars[i + 1].startAge,
    `Pillar ${i} endAge + 1 == Pillar ${i + 1} startAge`
  );
}

// Current pillar for age 40 (2026 - 1986 = 40)
assert(maleLuck.currentPillar !== null, 'Current pillar ไม่ null');
assertEqual(maleLuck.currentPillar.index, 3, 'Current pillar index = 3 (age 40 is in pillar 3, startAge 33-42)');
assertEqual(maleLuck.currentPillar.isCurrent, true, 'Current pillar isCurrent = true');

// Check tenGod exists
assert(firstPillar.tenGod !== undefined, 'Pillar stem has tenGod');
console.log('Pillar แรก tenGod:', firstPillar.tenGod, '(', firstPillar.stem.name, 'vs Day Master', maleChart.dayMaster.name, ')');

// Check currentAnnual
assert(maleLuck.currentAnnual !== null, 'Current annual fortune ไม่ null');
assertEqual(maleLuck.currentAnnual.year, 2026, 'Current annual year = 2026');
console.log('Current annual (2026):', maleLuck.currentAnnual.sixtyCycleName, 'tenGod:', maleLuck.currentAnnual.tenGod);

// Check upcomingTransitions
assert(maleLuck.upcomingTransitions.length >= 3, 'Upcoming transitions >= 3');
console.log('Upcoming transitions:', maleLuck.upcomingTransitions.slice(0, 3));

console.log('\n---\n');

// Test 2: Female 1986 (丙寅 - 阳年女 → backward)
console.log('Test 2: Female 1986 (丙寅 - 阳年女)');
const femaleChart = calculateBaZi(female1986);
const femaleLuck = analyzeLuck(female1986, femaleChart, 2026);

console.log('Day Master:', femaleChart.dayMaster.name, femaleChart.dayMaster.element, femaleChart.dayMaster.yinYang);
console.log('Year Pillar:', femaleChart.year.sixtyCycleName, '(', femaleChart.year.stem.name + femaleChart.year.stem.yinYang, ')');

assertEqual(femaleLuck.direction, 'backward', 'Direction should be backward (阳年女 → backward)');

// Female ควรมี startAge ต่างจาก male (น่าจะ ~8)
assert(femaleLuck.startAge !== 3, 'Female startAge ≠ male startAge (backward direction)');
console.log('Female startAge:', femaleLuck.startAge);

// 8 pillars ครบ
assertEqual(femaleLuck.pillars.length, 8, '8 pillars ครบ (female)');

// Pillar แรกต้องไม่ใช่ 甲午 (เพราะ backward)
assert(femaleLuck.pillars[0].sixtyCycleName !== '甲午', 'First pillar ≠ 甲午 (backward direction)');
console.log('Female pillar แรก:', femaleLuck.pillars[0].sixtyCycleName);

console.log('\n---\n');

// Test 3: Verify all pillar names for male 1986
console.log('Test 3: Verify all 8 pillar names (male 1986)');
const expectedPillars = [
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑'
];
for (let i = 0; i < 8; i++) {
  assertEqual(maleLuck.pillars[i].sixtyCycleName, expectedPillars[i], `Pillar ${i} = ${expectedPillars[i]}`);
  console.log(`Pillar ${i}: ${maleLuck.pillars[i].sixtyCycleName} (age ${maleLuck.pillars[i].startAge}-${maleLuck.pillars[i].endAge})`);
}

console.log('\n---\n');

// Test 4: Verify all pillar names for female 1986 (backward)
console.log('Test 4: Verify all 8 pillar names (female 1986 - backward)');
const expectedPillarsFemale = [
  '壬辰', '辛卯', '庚寅', '己丑', '戊子', '丁亥', '丙戌', '乙酉'
];
for (let i = 0; i < 8; i++) {
  assertEqual(femaleLuck.pillars[i].sixtyCycleName, expectedPillarsFemale[i], `Pillar ${i} = ${expectedPillarsFemale[i]} (female)`);
  console.log(`Pillar ${i}: ${femaleLuck.pillars[i].sixtyCycleName} (age ${femaleLuck.pillars[i].startAge}-${femaleLuck.pillars[i].endAge})`);
}

console.log('\n---\n');

// Test 5: TenGod accuracy
console.log('Test 5: Verify TenGod accuracy (male 1986)');

// Day Master = 癸阴水
// 甲午: 甲阳木 vs 癸阴水 (水 生 木 = 我生 = output, different polarity → 伤官)
assertEqual(maleLuck.pillars[0].tenGod, '伤官', '甲 (阳木) vs 癸 (阴水) = 伤官 (水→木, different polarity)');

// 乙未: 乙阴木 vs 癸阴水 (水 生 木 = 我生 = output, same polarity → 食神)
assertEqual(maleLuck.pillars[1].tenGod, '食神', '乙 (阴木) vs 癸 (阴水) = 食神 (水→木, same polarity)');

console.log('\n---\n');

// Test 6: Annual fortune accuracy
console.log('Test 6: Verify annual fortune (2026 = 丙午)');
// 2026 = 丙午
// 丙阳火 vs 癸阴水 (水 克 火 = wealth, different polarity → 正财)
assertEqual(maleLuck.currentAnnual.tenGod, '正财', '丙午 丙 (阳火) vs 癸 (阴水) = 正财');

console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✓ All tests passed!');
  process.exit(0);
}
