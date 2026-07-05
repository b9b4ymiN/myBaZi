/**
 * Tong Shu Engine Test Suite
 * Tests for Tong Shu day info computation, scoring, Thai labels, XKDG, power breakdown, and personal resonance
 */

import { getTongShuDayInfo, getTongShuHours } from '../src/lib/tongshu/day-info.js';
import { getXkdgDay } from '../src/lib/tongshu/xkdg-day.js';
import { analyzePersonalResonance } from '../src/lib/tongshu/personal-resonance.js';
import { scoreHours } from '../src/lib/tongshu/hours-with-score.js';

console.log('🧪 Tong Shu Engine Tests\n');

// Test 1: 2024-06-21 (Summer Solstice - 夏至)
console.log('📅 Test 1: 2024-06-21 (Summer Solstice)');
const test1 = getTongShuDayInfo(2024, 6, 21);
console.log('  Day Officer:', test1.dayOfficer.name, '→', test1.dayOfficer.nameTh);
console.log('  Yellow/Black Star:', test1.yellowBlackStar.name, '→', test1.yellowBlackStar.nameTh);
console.log('  28 Constellation:', test1.constellation28.name, '→', test1.constellation28.nameTh);
console.log('  Solar Term:', test1.solarTerm);
console.log('  Recommends:', test1.recommends.length);
console.log('  Avoids:', test1.avoids.length);
console.log('  Power Score:', test1.powerScore);
console.log('  Power Score Breakdown:', test1.powerScoreBreakdown);
console.log('  Rating:', test1.rating);
console.log('  Summary:', test1.summary);
console.log('  XKDG:', test1.xkdg);

// Verify expected values for 2024-06-21
const assert = (condition, message) => {
  if (!condition) {
    console.error('❌ FAILED:', message);
    process.exit(1);
  } else {
    console.log('✅ PASS:', message);
  }
};

assert(test1.dayOfficer.name === '开', `Expected day officer "开", got "${test1.dayOfficer.name}"`);
assert(test1.yellowBlackStar.name === '天牢', `Expected "天牢", got "${test1.yellowBlackStar.name}"`);
assert(test1.constellation28.name === '鬼', `Expected "鬼", got "${test1.constellation28.name}"`);
assert(test1.solarTerm === '夏至', `Expected "夏至", got "${test1.solarTerm}"`);
assert(test1.recommends.length > 0, 'Expected some recommends');
assert(test1.avoids.length > 0, 'Expected some avoids');
assert(test1.powerScore >= -50 && test1.powerScore <= 50, 'Power score out of range');
assert(['very_auspicious', 'auspicious', 'neutral', 'inauspicious', 'very_inauspicious'].includes(test1.rating),
  'Invalid rating value');
assert(test1.powerScoreBreakdown !== undefined, 'Power score breakdown missing');
assert(test1.powerScoreBreakdown.total === test1.powerScore, 'Power score breakdown total mismatch');
assert(test1.xkdg !== undefined, 'XKDG information missing');
assert(test1.xkdg.periodGroup >= 1 && test1.xkdg.periodGroup <= 6, 'XKDG period group out of range');

console.log('');

// Test 2: 2024-02-10 (After Li Chun - year pillar is 甲辰)
console.log('📅 Test 2: 2024-02-10 (After Li Chun - 甲辰 year)');
const test2 = getTongShuDayInfo(2024, 2, 10);
console.log('  Year Pillar:', test2.yearPillar);
console.log('  Month Pillar:', test2.monthPillar);
console.log('  Day Pillar:', test2.sixtyCycle);
console.log('  Solar Term:', test2.solarTerm);
console.log('  Power Score:', test2.powerScore);
console.log('  Power Score Breakdown:', test2.powerScoreBreakdown);
console.log('  Rating:', test2.rating);
console.log('  XKDG:', test2.xkdg);

// Year pillar should be 甲辰 (Jia Chen) for 2024 after Li Chun
assert(test2.yearPillar === '甲辰', `Expected year pillar "甲辰", got "${test2.yearPillar}"`);
assert(test2.solarTerm === '立春', `Expected "立春", got "${test2.solarTerm}"`);
assert(test2.powerScoreBreakdown !== undefined, 'Test 2: Power score breakdown missing');
assert(test2.powerScoreBreakdown.total === test2.powerScore, 'Test 2: Power score breakdown total mismatch');
assert(test2.xkdg !== undefined, 'Test 2: XKDG information missing');

console.log('');

// Test 3: Verify different days have different day officers
console.log('📅 Test 3: Different days should have different day officers');
const test3a = getTongShuDayInfo(2024, 6, 21);
const test3b = getTongShuDayInfo(2024, 6, 22);
console.log('  2024-06-21 Day Officer:', test3a.dayOfficer.name);
console.log('  2024-06-22 Day Officer:', test3b.dayOfficer.name);

assert(test3a.dayOfficer.name !== test3b.dayOfficer.name,
  'Day officers should differ for consecutive days');

console.log('');

// Test 4: Thai labels exist
console.log('📅 Test 4: Thai labels exist');
const test4 = getTongShuDayInfo(2024, 6, 21);
assert(test4.dayOfficer.nameTh !== '', 'Day officer Thai label missing');
assert(test4.yellowBlackStar.nameTh !== '', 'Yellow/Black star Thai label missing');
assert(test4.constellation28.nameTh !== '', '28 Constellation Thai label missing');
assert(test4.nineStar.nameTh !== '', 'Nine Star Thai label missing');
assert(test4.gods.every(g => g.nameTh !== ''), 'Some gods have missing Thai labels');
assert(test4.recommends.every(r => r.nameTh !== ''), 'Some recommends have missing Thai labels');
console.log('  All Thai labels present ✓');

console.log('');

// Test 5: Power score range
console.log('📅 Test 5: Power scores in valid range');
const testDates = [
  [2024, 6, 21],
  [2024, 2, 4],
  [2024, 1, 1],
  [2024, 12, 31],
  [2023, 8, 15]
];

for (const [y, m, d] of testDates) {
  const info = getTongShuDayInfo(y, m, d);
  assert(info.powerScore >= -50 && info.powerScore <= 50,
    `Power score ${info.powerScore} out of range for ${y}-${m}-${d}`);
  console.log(`  ${y}-${m}-${d}: score = ${info.powerScore}, rating = ${info.rating}`);
}

console.log('');

// Test 6: Rating categories
console.log('📅 Test 6: Rating categories are valid');
const allRatings = new Set();
for (const [y, m, d] of testDates) {
  const info = getTongShuDayInfo(y, m, d);
  allRatings.add(info.rating);
}
console.log('  Found ratings:', Array.from(allRatings));
assert(allRatings.size > 0, 'Should have at least one rating category');

console.log('');

// Test 7: Tong Shu hours
console.log('📅 Test 7: Tong Shu hours for 2024-06-21');
const hours = getTongShuHours(2024, 6, 21);
console.log('  Number of hours:', hours.length);
assert(hours.length >= 12, `Expected at least 12 hours, got ${hours.length}`);

// Display first few hours
hours.slice(0, 3).forEach((hour, i) => {
  console.log(`  Hour ${i + 1}: ${hour.hourName} (${hour.nameTh}) ${hour.timeRange} - ${hour.sixtyCycle}`);
});

// Verify hour data
assert(hours.every(h => h.hourName !== ''), 'Some hours missing name');
assert(hours.every(h => h.nameTh !== ''), 'Some hours missing Thai name');
assert(hours.every(h => h.timeRange !== ''), 'Some hours missing time range');
assert(hours.every(h => h.sixtyCycle !== ''), 'Some hours missing sixty cycle');

console.log('');

// Test 8: Lunar date info
console.log('📅 Test 8: Lunar date information');
const test8 = getTongShuDayInfo(2024, 6, 21);
console.log('  Lunar Day:', test8.lunarDate.dayName);
console.log('  Lunar Month:', test8.lunarDate.monthName);
console.log('  Lunar Year:', test8.lunarDate.yearName);
assert(test8.lunarDate.dayName !== '', 'Lunar day name missing');
assert(test8.lunarDate.monthName !== '', 'Lunar month name missing');
assert(test8.lunarDate.yearName !== '', 'Lunar year name missing');

console.log('');

// Test 9: Gods/spirits data
console.log('📅 Test 9: Gods and spirits');
const test9 = getTongShuDayInfo(2024, 6, 21);
console.log('  Number of gods:', test9.gods.length);
assert(test9.gods.length > 0, 'Should have at least one god');
const auspiciousGods = test9.gods.filter(g => g.auspicious).length;
const inauspiciousGods = test9.gods.filter(g => !g.auspicious).length;
console.log('  Auspicious gods:', auspiciousGods);
console.log('  Inauspicious gods:', inauspiciousGods);

console.log('');

// Test 10: Solar date info
console.log('📅 Test 10: Solar date information');
const test10 = getTongShuDayInfo(2024, 6, 21);
console.log('  Solar Date:', test10.solarDate);
assert(test10.solarDate.year === 2024, 'Year mismatch');
assert(test10.solarDate.month === 6, 'Month mismatch');
assert(test10.solarDate.day === 21, 'Day mismatch');
assert(typeof test10.solarDate.weekday === 'number', 'Weekday should be number');
assert(test10.solarDate.weekday >= 0 && test10.solarDate.weekday <= 6, 'Weekday out of range');

console.log('');

// Test 11: XKDG day information
console.log('📅 Test 11: XKDG day information for 2024-06-21');
const test11 = getXkdgDay(2024, 6, 21);
console.log('  XKDG Day Pillar:', test11.sixtyCycle);
console.log('  Period Group:', test11.periodGroup);
console.log('  Period Group Name:', test11.periodGroupName);
console.log('  Description:', test11.description);

assert(test11.sixtyCycle !== '', 'XKDG day pillar missing');
assert(test11.periodGroup >= 1 && test11.periodGroup <= 6, 'XKDG period group out of range');
assert(test11.periodGroupName !== '', 'XKDG period group name missing');
assert(test11.description !== '', 'XKDG description missing');

console.log('');

// Test 12: XKDG period groups for different days
console.log('📅 Test 12: XKDG period groups vary across days');
const xkdgTests = [
  getXkdgDay(2024, 6, 21),
  getXkdgDay(2024, 1, 1),
  getXkdgDay(2024, 12, 31),
  getXkdgDay(2023, 8, 15)
];

const periodGroups = new Set(xkdgTests.map(x => x.periodGroup));
console.log('  Period groups found:', Array.from(periodGroups).sort());
assert(periodGroups.size > 1, 'XKDG period groups should vary across days');
assert(xkdgTests.every(x => x.periodGroup >= 1 && x.periodGroup <= 6), 'All XKDG period groups should be in range 1-6');

console.log('');

// Test 13: Power score breakdown consistency
console.log('📅 Test 13: Power score breakdown consistency');
const breakdownTest = getTongShuDayInfo(2024, 6, 21);
console.log('  Power Score:', breakdownTest.powerScore);
console.log('  Breakdown total:', breakdownTest.powerScoreBreakdown.total);
console.log('  Breakdown components:', {
  dayOfficer: breakdownTest.powerScoreBreakdown.dayOfficer,
  yellowBlackStar: breakdownTest.powerScoreBreakdown.yellowBlackStar,
  constellation28: breakdownTest.powerScoreBreakdown.constellation28,
  gods: breakdownTest.powerScoreBreakdown.gods
});

assert(breakdownTest.powerScoreBreakdown.total === breakdownTest.powerScore,
  'Power score breakdown total must match power score');
assert(typeof breakdownTest.powerScoreBreakdown.dayOfficer === 'number', 'Day officer score should be number');
assert(typeof breakdownTest.powerScoreBreakdown.yellowBlackStar === 'number', 'Yellow/Black star score should be number');
assert(typeof breakdownTest.powerScoreBreakdown.constellation28 === 'number', 'Constellation score should be number');
assert(typeof breakdownTest.powerScoreBreakdown.gods === 'number', 'Gods score should be number');

console.log('');

// Test 14: Power score breakdown ranges
console.log('📅 Test 14: Power score breakdown component ranges');
const rangeTests = [
  getTongShuDayInfo(2024, 6, 21),
  getTongShuDayInfo(2024, 2, 4),
  getTongShuDayInfo(2024, 1, 1)
];

for (const info of rangeTests) {
  const bd = info.powerScoreBreakdown;
  console.log(`  ${info.solarDate.year}-${info.solarDate.month}-${info.solarDate.day}:`, {
    officer: bd.dayOfficer,
    star: bd.yellowBlackStar,
    constellation: bd.constellation28,
    gods: bd.gods,
    total: bd.total
  });

  // Check component ranges
  assert([5, -5].includes(bd.dayOfficer), `Day officer should be ±5, got ${bd.dayOfficer}`);
  assert([5, -5].includes(bd.yellowBlackStar), `Yellow/Black star should be ±5, got ${bd.yellowBlackStar}`);
  assert([3, -3].includes(bd.constellation28), `Constellation should be ±3, got ${bd.constellation28}`);
  assert(bd.gods >= -10 && bd.gods <= 10, `Gods score should be in [-10, 10], got ${bd.gods}`);
  assert(bd.total >= -50 && bd.total <= 50, `Total should be in [-50, 50], got ${bd.total}`);
}

console.log('');

// Test 15: Personal Resonance - Fire day master vs 丙辰 day
console.log('📅 Test 15: Personal Resonance (Fire day master vs 丙辰 day)');
const test15 = getTongShuDayInfo(2024, 6, 21); // This should be a 丙辰 day
const personalResonanceTest = analyzePersonalResonance(
  test15,
  { stem: "丙", element: "火" }, // Fire day master
  "火" // Useful God is Fire
);

console.log('  User Day Master:', personalResonanceTest.userDayMaster);
console.log('  Day Pillar:', personalResonanceTest.dayPillar);
console.log('  Stem Relationship:', personalResonanceTest.stemRelationshipTh);
console.log('  Aligns with Useful God:', personalResonanceTest.alignsWithUsefulGod);
console.log('  Alignment Note:', personalResonanceTest.alignmentNote);
console.log('  Resonance Score:', personalResonanceTest.resonanceScore);
console.log('  Rating:', personalResonanceTest.rating);
console.log('  Summary:', personalResonanceTest.summary);

// Verify personal resonance calculation
assert(personalResonanceTest.userDayMaster.stem === "丙", 'User day master stem should be 丙');
assert(personalResonanceTest.userDayMaster.element === "火", 'User day master element should be 火');
assert(personalResonanceTest.dayPillar.stem === test15.sixtyCycle[0], 'Day pillar stem should match');
assert(personalResonanceTest.dayPillar.branch === test15.sixtyCycle[1], 'Day pillar branch should match');
assert(["resource", "companion", "output", "wealth", "power"].includes(personalResonanceTest.stemRelationship),
  'Stem relationship should be valid');
assert(personalResonanceTest.stemRelationshipTh !== '', 'Stem relationship Thai label should not be empty');
assert(personalResonanceTest.usefulGodElement === "火", 'Useful God element should be 火');
assert(personalResonanceTest.alignsWithUsefulGod === true, 'Should align with useful god (Fire day stem)');
assert(personalResonanceTest.resonanceScore >= -10 && personalResonanceTest.resonanceScore <= 10,
  'Resonance score should be in range [-10, 10]');
assert(["very_good", "good", "neutral", "challenging", "very_challenging"].includes(personalResonanceTest.rating),
  'Rating should be valid');
assert(personalResonanceTest.summary !== '', 'Summary should not be empty');

console.log('');

// Test 16: Personal Resonance - No useful god
console.log('📅 Test 16: Personal Resonance (no useful god)');
const test16 = getTongShuDayInfo(2024, 6, 21);
const personalResonanceNoUG = analyzePersonalResonance(
  test16,
  { stem: "丁", element: "火" },
  null // No useful god
);

console.log('  Useful God Element:', personalResonanceNoUG.usefulGodElement);
console.log('  Aligns with Useful God:', personalResonanceNoUG.alignsWithUsefulGod);
console.log('  Alignment Note:', personalResonanceNoUG.alignmentNote);

assert(personalResonanceNoUG.usefulGodElement === null, 'Useful God should be null');
assert(personalResonanceNoUG.alignsWithUsefulGod === false, 'Should not align when no useful god');
assert(personalResonanceNoUG.alignmentNote.includes('ไม่มีข้อมูล Useful God'),
  'Alignment note should mention no useful god info');

console.log('');

// Test 17: Scored Hours - Identify best hours
console.log('📅 Test 17: Scored Hours with Useful God alignment');
const test17Hours = getTongShuHours(2024, 6, 21);
const test17ScoredHours = scoreHours(test17Hours, "火"); // Useful God = Fire

console.log('  Total Hours:', test17ScoredHours.length);
console.log('  Hours with element field:', test17ScoredHours.filter(h => h.element).length);

const bestHours = test17ScoredHours.filter(h => h.recommendation === "best");
const goodHours = test17ScoredHours.filter(h => h.recommendation === "good");
const neutralHours = test17ScoredHours.filter(h => h.recommendation === "neutral");
const avoidHours = test17ScoredHours.filter(h => h.recommendation === "avoid");

console.log('  Best Hours:', bestHours.length);
console.log('  Good Hours:', goodHours.length);
console.log('  Neutral Hours:', neutralHours.length);
console.log('  Avoid Hours:', avoidHours.length);

// Display some best hours
if (bestHours.length > 0) {
  console.log('  Example Best Hours:');
  bestHours.slice(0, 2).forEach(h => {
    console.log(`    - ${h.nameTh} (${h.timeRange}): ${h.sixtyCycle}, element=${h.element}, score=${h.personalScore}`);
  });
}

// Verify scored hours structure
assert(test17ScoredHours.length === test17Hours.length, 'Scored hours count should match input hours');
assert(test17ScoredHours.every(h => typeof h.element === 'string' && h.element.length > 0),
  'All hours should have element');
assert(test17ScoredHours.every(h => typeof h.alignsWithUsefulGod === 'boolean'),
  'All hours should have alignsWithUsefulGod boolean');
assert(test17ScoredHours.every(h => typeof h.personalScore === 'number'),
  'All hours should have personalScore number');
assert(test17ScoredHours.every(h => h.personalScore >= -3 && h.personalScore <= 3),
  'Personal scores should be in range [-3, 3]');
assert(test17ScoredHours.every(h => ["best", "good", "neutral", "avoid"].includes(h.recommendation)),
  'All hours should have valid recommendation');

console.log('');

// Test 18: Scored Hours - No useful god
console.log('📅 Test 18: Scored Hours (no useful god)');
const test18Hours = getTongShuHours(2024, 6, 21);
const test18ScoredHours = scoreHours(test18Hours, null);

console.log('  Total Hours:', test18ScoredHours.length);
console.log('  Hours aligning with Useful God:', test18ScoredHours.filter(h => h.alignsWithUsefulGod).length);

assert(test18ScoredHours.every(h => h.alignsWithUsefulGod === false),
  'No hours should align when useful god is null');
assert(test18ScoredHours.every(h => h.personalScore >= 0 && h.personalScore <= 1),
  'Scores should be 0-1 when no useful god (based on auspiciousness)');

console.log('');

// Test 19: Personal Resonance - Different day masters
console.log('📅 Test 19: Personal Resonance with different day masters');
const test19Day = getTongShuDayInfo(2024, 6, 21);
const testCases = [
  { stem: "甲", element: "木" },
  { stem: "丙", element: "火" },
  { stem: "戊", element: "土" },
  { stem: "庚", element: "金" },
  { stem: "壬", element: "水" },
];

testCases.forEach(({ stem, element }) => {
  const resonance = analyzePersonalResonance(test19Day, { stem, element }, element);
  console.log(`  Day Master ${stem} (${element}): score=${resonance.resonanceScore}, rating=${resonance.rating}`);
  assert(resonance.userDayMaster.stem === stem, `User stem should be ${stem}`);
  assert(resonance.userDayMaster.element === element, `User element should be ${element}`);
  assert(typeof resonance.resonanceScore === 'number', 'Score should be number');
  assert(resonance.summary !== '', 'Summary should not be empty');
});

console.log('');

// Test 20: Integration test - Complete flow
console.log('📅 Test 20: Integration test - Complete personal resonance flow');
const test20Day = getTongShuDayInfo(2024, 6, 21);
const test20Hours = getTongShuHours(2024, 6, 21);
const test20Profile = { stem: "丙", element: "火" };
const test20UsefulGod = "火";

const test20Resonance = analyzePersonalResonance(test20Day, test20Profile, test20UsefulGod);
const test20ScoredHours = scoreHours(test20Hours, test20UsefulGod);

console.log('  Day Info:', {
  sixtyCycle: test20Day.sixtyCycle,
  dayOfficer: test20Day.dayOfficer.nameTh,
  powerScore: test20Day.powerScore,
});
console.log('  Personal Resonance:', {
  score: test20Resonance.resonanceScore,
  rating: test20Resonance.rating,
  aligns: test20Resonance.alignsWithUsefulGod,
});
console.log('  Scored Hours:', {
  total: test20ScoredHours.length,
  best: test20ScoredHours.filter(h => h.recommendation === "best").length,
  avoid: test20ScoredHours.filter(h => h.recommendation === "avoid").length,
});

// Verify integration
assert(test20Resonance.resonanceScore >= -10 && test20Resonance.resonanceScore <= 10, 'Integration: resonance score valid');
assert(test20ScoredHours.length > 0, 'Integration: should have scored hours');
assert(test20ScoredHours.length === test20Hours.length, 'Integration: scored hours count matches');

console.log('');
console.log('🎉 All Tong Shu tests passed!');
