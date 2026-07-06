// Test Three-Harmony (三合) - Three-way Harmony และ Half Three-way Harmony
import { detectThreeHarmony, hasThreeHarmony } from '../src/lib/bazi/three-harmony.ts';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) { pass++; } else { fail++; }
}

console.log('═══ TEST 1: Full Harmonies (三合) - ทั้ง 4 frames ═══');

const result1 = detectThreeHarmony(["申", "子", "辰"]);
console.log('1.1 Water frame (申子辰):', JSON.stringify(result1, null, 2));
check('1.1 found', result1.found, true);
check('1.1 type', result1.type, "full");
check('1.1 frame', result1.frame, "申子辰");
check('1.1 transformElement', result1.transformElement, "水");
check('1.1 presentBranches length', result1.presentBranches.length, 3);
check('1.1 missingBranches length', result1.missingBranches.length, 0);

const result2 = detectThreeHarmony(["辰", "子", "申"]); // order-independent
console.log('1.2 Water frame (order-independent):', JSON.stringify(result2, null, 2));
check('1.2 found', result2.found, true);
check('1.2 frame', result2.frame, "申子辰");

const result3 = detectThreeHarmony(["亥", "卯", "未"]);
console.log('1.3 Wood frame (亥卯未):', JSON.stringify(result3, null, 2));
check('1.3 found', result3.found, true);
check('1.3 type', result3.type, "full");
check('1.3 frame', result3.frame, "亥卯未");
check('1.3 transformElement', result3.transformElement, "木");

const result4 = detectThreeHarmony(["寅", "午", "戌"]);
console.log('1.4 Fire frame (寅午戌):', JSON.stringify(result4, null, 2));
check('1.4 found', result4.found, true);
check('1.4 type', result4.type, "full");
check('1.4 frame', result4.frame, "寅午戌");
check('1.4 transformElement', result4.transformElement, "火");

const result5 = detectThreeHarmony(["巳", "酉", "丑"]);
console.log('1.5 Metal frame (巳酉丑):', JSON.stringify(result5, null, 2));
check('1.5 found', result5.found, true);
check('1.5 type', result5.type, "full");
check('1.5 frame', result5.frame, "巳酉丑");
check('1.5 transformElement', result5.transformElement, "金");

console.log('\n═══ TEST 2: Strong Half Harmonies (旺半合) - includes middle ═══');

const result6 = detectThreeHarmony(["子", "辰"]);
console.log('2.1 Water frame strong half (子+辰, includes middle 子):', JSON.stringify(result6, null, 2));
check('2.1 found', result6.found, true);
check('2.1 type', result6.type, "half");
check('2.1 frame', result6.frame, "申子辰");
check('2.1 transformElement', result6.transformElement, "水");
check('2.1 strength', result6.strength, "strong");
check('2.1 presentBranches length', result6.presentBranches.length, 2);
check('2.1 missingBranches', result6.missingBranches, ["申"]);

const result7 = detectThreeHarmony(["亥", "卯"]);
console.log('2.2 Wood frame strong half (亥+卯):', JSON.stringify(result7, null, 2));
check('2.2 found', result7.found, true);
check('2.2 type', result7.type, "half");
check('2.2 frame', result7.frame, "亥卯未");
check('2.2 transformElement', result7.transformElement, "木");
check('2.2 strength', result7.strength, "strong");
check('2.2 missingBranches', result7.missingBranches, ["未"]);

const result8 = detectThreeHarmony(["午", "戌"]);
console.log('2.3 Fire frame strong half (午+戌):', JSON.stringify(result8, null, 2));
check('2.3 found', result8.found, true);
check('2.3 type', result8.type, "half");
check('2.3 frame', result8.frame, "寅午戌");
check('2.3 transformElement', result8.transformElement, "火");
check('2.3 strength', result8.strength, "strong");
check('2.3 missingBranches', result8.missingBranches, ["寅"]);

const result9 = detectThreeHarmony(["巳", "酉"]);
console.log('2.4 Metal frame strong half (巳+酉):', JSON.stringify(result9, null, 2));
check('2.4 found', result9.found, true);
check('2.4 type', result9.type, "half");
check('2.4 frame', result9.frame, "巳酉丑");
check('2.4 transformElement', result9.transformElement, "金");
check('2.4 strength', result9.strength, "strong");
check('2.4 missingBranches', result9.missingBranches, ["丑"]);

console.log('\n═══ TEST 3: Weak Half Harmonies (拱) - start+end only, no middle ═══');

const result10 = detectThreeHarmony(["申", "辰"]);
console.log('3.1 Water frame weak half (申+辰, no middle 子):', JSON.stringify(result10, null, 2));
check('3.1 found', result10.found, true);
check('3.1 type', result10.type, "half");
check('3.1 frame', result10.frame, "申子辰");
check('3.1 transformElement', result10.transformElement, "水");
check('3.1 strength', result10.strength, "weak");
check('3.1 presentBranches length', result10.presentBranches.length, 2);
check('3.1 missingBranches', result10.missingBranches, ["子"]);

const result11 = detectThreeHarmony(["寅", "戌"]);
console.log('3.2 Fire frame weak half (寅+戌, no middle 午):', JSON.stringify(result11, null, 2));
check('3.2 found', result11.found, true);
check('3.2 type', result11.type, "half");
check('3.2 frame', result11.frame, "寅午戌");
check('3.2 transformElement', result11.transformElement, "火");
check('3.2 strength', result11.strength, "weak");
check('3.2 missingBranches', result11.missingBranches, ["午"]);

console.log('\n═══ TEST 4: Non-Harmony (different frames / no frame) ═══');

const result12 = detectThreeHarmony(["子", "丑"]);
console.log('4.1 Different frames (子+丑):', JSON.stringify(result12, null, 2));
check('4.1 found', result12.found, false);
check('4.1 type', result12.type, "none");
check('4.1 presentBranches length', result12.presentBranches.length, 0);
check('4.1 missingBranches length', result12.missingBranches.length, 0);

const result13 = detectThreeHarmony(["寅", "申"]);
console.log('4.2 Different frames (寅+申, note: actually 冲 but none here):', JSON.stringify(result13, null, 2));
check('4.2 found', result13.found, false);
check('4.2 type', result13.type, "none");

const result14 = detectThreeHarmony(["子"]);
console.log('4.3 Single branch:', JSON.stringify(result14, null, 2));
check('4.3 found', result14.found, false);
check('4.3 type', result14.type, "none");

const result15 = detectThreeHarmony(["子", "卯", "午", "酉"]); // all middles, different frames
console.log('4.4 All middles different frames:', JSON.stringify(result15, null, 2));
check('4.4 found', result15.found, false);
check('4.4 type', result15.type, "none");

console.log('\n═══ TEST 5: Best-Match Precedence ═══');

const result16 = detectThreeHarmony(["申", "子", "辰", "卯", "未"]);
console.log('5.1 Full + Half → return Full:', JSON.stringify(result16, null, 2));
check('5.1 found', result16.found, true);
check('5.1 type', result16.type, "full"); // full beats half
check('5.1 frame', result16.frame, "申子辰"); // full frame wins

const result17 = detectThreeHarmony(["申", "子", "卯", "未"]);
console.log('5.2 Two strong halves → tie break by canonical order:', JSON.stringify(result17, null, 2));
check('5.17 found', result17.found, true);
check('5.17 type', result17.type, "half");
check('5.17 frame', result17.frame, "申子辰"); // canonical order: 申子辰 before 亥卯未
check('5.17 strength', result17.strength, "strong");

const result18 = detectThreeHarmony(["申", "辰", "寅", "戌"]);
console.log('5.3 Strong half vs weak half → strong wins:', JSON.stringify(result18, null, 2));
check('5.18 found', result18.found, true);
check('5.18 type', result18.type, "half");
check('5.18 frame', result18.frame, "申子辰"); // 申+辰 = weak half, but 寅+戌 = weak too → tie break
check('5.18 strength', result18.strength, "weak");

console.log('\n═══ TEST 6: Duplicates Handling ═══');

const result19 = detectThreeHarmony(["子", "子", "辰"]);
console.log('6.1 Duplicates collapsed (子,子,辰 → 子+辰 = half):', JSON.stringify(result19, null, 2));
check('6.1 found', result19.found, true);
check('6.1 type', result19.type, "half"); // not full! duplicates collapsed
check('6.1 presentBranches length', result19.presentBranches.length, 2);
check('6.1 missingBranches', result19.missingBranches, ["申"]);

const result20 = detectThreeHarmony(["申", "申", "子", "辰", "辰"]);
console.log('6.2 Many duplicates still form full:', JSON.stringify(result20, null, 2));
check('6.2 found', result20.found, true);
check('6.2 type', result20.type, "full"); // unique branches = 申+子+辰
check('6.2 presentBranches length', result20.presentBranches.length, 3);

console.log('\n═══ TEST 7: Boolean Wrapper (hasThreeHarmony) ═══');

check('7.1 hasThreeHarmony full', hasThreeHarmony(["申", "子", "辰"]), true);
check('7.2 hasThreeHarmony strong half', hasThreeHarmony(["子", "辰"]), true);
check('7.3 hasThreeHarmony weak half', hasThreeHarmony(["申", "辰"]), true);
check('7.4 hasThreeHarmony none', hasThreeHarmony(["子", "丑"]), false);
check('7.5 hasThreeHarmony single', hasThreeHarmony(["子"]), false);

console.log('\n═══ TEST 8: All possible half combinations per frame ═══');

// Water frame (申子辰): middle = 子
check('8.1 Water half start+middle (申+子)', detectThreeHarmony(["申", "子"]).strength, "strong");
check('8.2 Water half middle+end (子+辰)', detectThreeHarmony(["子", "辰"]).strength, "strong");
check('8.3 Water half start+end (申+辰)', detectThreeHarmony(["申", "辰"]).strength, "weak");

// Wood frame (亥卯未): middle = 卯
check('8.4 Wood half start+middle (亥+卯)', detectThreeHarmony(["亥", "卯"]).strength, "strong");
check('8.5 Wood half middle+end (卯+未)', detectThreeHarmony(["卯", "未"]).strength, "strong");
check('8.6 Wood half start+end (亥+未)', detectThreeHarmony(["亥", "未"]).strength, "weak");

// Fire frame (寅午戌): middle = 午
check('8.7 Fire half start+middle (寅+午)', detectThreeHarmony(["寅", "午"]).strength, "strong");
check('8.8 Fire half middle+end (午+戌)', detectThreeHarmony(["午", "戌"]).strength, "strong");
check('8.9 Fire half start+end (寅+戌)', detectThreeHarmony(["寅", "戌"]).strength, "weak");

// Metal frame (巳酉丑): middle = 酉
check('8.10 Metal half start+middle (巳+酉)', detectThreeHarmony(["巳", "酉"]).strength, "strong");
check('8.11 Metal half middle+end (酉+丑)', detectThreeHarmony(["酉", "丑"]).strength, "strong");
check('8.12 Metal half start+end (巳+丑)', detectThreeHarmony(["巳", "丑"]).strength, "weak");

console.log('\n═══ SUMMARY ═══');
console.log(`✅ ${pass}/${pass + fail} passed`);
if (fail > 0) {
  console.log(`❌ ${fail} failed`);
  process.exit(1);
}
