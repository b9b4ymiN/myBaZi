/**
 * XKDG Test Script
 * Phase 1.8 - ทดสอบ XKDG analysis (simplified approach)
 */

import { calculateBaZi } from '../src/lib/bazi/calculate.js';
import { analyzeXkdg } from '../src/lib/bazi/xkdg.js';

// Test case: 1986-05-29 12:00 Shanghai
const profile = {
  name: "Test Case",
  gender: "male",
  birthDate: "1986-05-29",
  birthTime: "12:00",
  birthTimeKnown: "known",
  timezone: "Asia/Shanghai",
};

console.log("=== XKDG Test: 1986-05-29 12:00 Shanghai ===\n");

// 1. คำนวณ BaZi chart
const chart = calculateBaZi(profile);
console.log("BaZi Chart:");
console.log(`  Year:  ${chart.year.sixtyCycleName} (${chart.year.stem.name}${chart.year.branch.name})`);
console.log(`  Month: ${chart.month.sixtyCycleName} (${chart.month.stem.name}${chart.month.branch.name})`);
console.log(`  Day:   ${chart.day.sixtyCycleName} (${chart.day.stem.name}${chart.day.branch.name})`);
console.log(`  Hour:  ${chart.hour?.sixtyCycleName} (${chart.hour?.stem.name}${chart.hour?.branch.name})`);
console.log();

// 2. วิเคราะห์ XKDG
const xkdg = analyzeXkdg(profile, chart);
console.log("XKDG Analysis (Simplified):");
console.log(`  Year:  ${xkdg.year.description}`);
console.log(`    - Period Group: ${xkdg.year.periodGroup} (ซำ${xkdg.year.periodGroupName})`);
console.log(`    - Stem Element: ${xkdg.year.stemElement}, Branch Element: ${xkdg.year.branchElement}`);
console.log(`  Month: ${xkdg.month.description}`);
console.log(`    - Period Group: ${xkdg.month.periodGroup} (ซำ${xkdg.month.periodGroupName})`);
console.log(`    - Stem Element: ${xkdg.month.stemElement}, Branch Element: ${xkdg.month.branchElement}`);
console.log(`  Day:   ${xkdg.day.description}`);
console.log(`    - Period Group: ${xkdg.day.periodGroup} (ซำ${xkdg.day.periodGroupName})`);
console.log(`    - Stem Element: ${xkdg.day.stemElement}, Branch Element: ${xkdg.day.branchElement}`);
console.log(`  Hour:  ${xkdg.hour?.description || 'N/A (unknown time)'}`);
if (xkdg.hour) {
  console.log(`    - Period Group: ${xkdg.hour.periodGroup} (ซำ${xkdg.hour.periodGroupName})`);
  console.log(`    - Stem Element: ${xkdg.hour.stemElement}, Branch Element: ${xkdg.hour.branchElement}`);
}
console.log();

// 3. Verify requirements
console.log("=== Verification ===");
const checks = [];

// Check 1: Period groups are in range 1-6
const yearValid = xkdg.year.periodGroup >= 1 && xkdg.year.periodGroup <= 6;
const monthValid = xkdg.month.periodGroup >= 1 && xkdg.month.periodGroup <= 6;
const dayValid = xkdg.day.periodGroup >= 1 && xkdg.day.periodGroup <= 6;
const hourValid = xkdg.hour === null || (xkdg.hour.periodGroup >= 1 && xkdg.hour.periodGroup <= 6);
checks.push({
  name: "Period groups 1-6",
  passed: yearValid && monthValid && dayValid && hourValid,
  detail: `Year=${xkdg.year.periodGroup}, Month=${xkdg.month.periodGroup}, Day=${xkdg.day.periodGroup}, Hour=${xkdg.hour?.periodGroup || 'N/A'}`
});

// Check 2: Period group names are valid 6 ซำ
const validTenNames = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'];
const yearTenValid = validTenNames.includes(xkdg.year.periodGroupName);
const monthTenValid = validTenNames.includes(xkdg.month.periodGroupName);
const dayTenValid = validTenNames.includes(xkdg.day.periodGroupName);
const hourTenValid = xkdg.hour === null || validTenNames.includes(xkdg.hour.periodGroupName);
checks.push({
  name: "Period group names (6 ซำ)",
  passed: yearTenValid && monthTenValid && dayTenValid && hourTenValid,
  detail: `Year=${xkdg.year.periodGroupName}, Month=${xkdg.month.periodGroupName}, Day=${xkdg.day.periodGroupName}, Hour=${xkdg.hour?.periodGroupName || 'N/A'}`
});

// Check 3: All required fields present
const yearFields = xkdg.year.sixtyCycleName && xkdg.year.periodGroup && xkdg.year.periodGroupName &&
                   xkdg.year.stemElement && xkdg.year.branchElement && xkdg.year.description;
const monthFields = xkdg.month.sixtyCycleName && xkdg.month.periodGroup && xkdg.month.periodGroupName &&
                    xkdg.month.stemElement && xkdg.month.branchElement && xkdg.month.description;
const dayFields = xkdg.day.sixtyCycleName && xkdg.day.periodGroup && xkdg.day.periodGroupName &&
                  xkdg.day.stemElement && xkdg.day.branchElement && xkdg.day.description;
const hourFields = xkdg.hour === null || (xkdg.hour.sixtyCycleName && xkdg.hour.periodGroup &&
                   xkdg.hour.periodGroupName && xkdg.hour.stemElement && xkdg.hour.branchElement &&
                   xkdg.hour.description);
checks.push({
  name: "All fields present",
  passed: yearFields && monthFields && dayFields && hourFields,
  detail: `Year=${yearFields}, Month=${monthFields}, Day=${dayFields}, Hour=${hourFields}`
});

// Check 4: Note is present and explains approach
checks.push({
  name: "Note explains approach",
  passed: xkdg.note && xkdg.note.includes('Simplified') && xkdg.note.includes('period groups'),
  detail: xkdg.note?.substring(0, 100) + '...'
});

// Check 5: Hour is null for unknown time (test with unknown time)
const unknownProfile = { ...profile, birthTimeKnown: 'unknown', birthTime: null };
const unknownChart = calculateBaZi(unknownProfile);
const unknownXkdg = analyzeXkdg(unknownProfile, unknownChart);
checks.push({
  name: "Hour = null for unknown time",
  passed: unknownXkdg.hour === null,
  detail: `birthTimeKnown=unknown → hour=${unknownXkdg.hour}`
});

// Print results
console.log();
let allPassed = true;
for (const check of checks) {
  const status = check.passed ? "✓ PASS" : "✗ FAIL";
  console.log(`${status}: ${check.name}`);
  if (!check.passed) {
    console.log(`  Detail: ${check.detail}`);
    allPassed = false;
  }
}
console.log();

if (allPassed) {
  console.log("✓ All checks passed!");
  process.exit(0);
} else {
  console.log("✗ Some checks failed");
  process.exit(1);
}
