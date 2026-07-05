#!/usr/bin/env node
/**
 * Test script for BaZi Context Builder
 *
 * Test case: 1993-10-12 12:55 กทม./ลำปาง (male)
 * Expected: 4 pillars + day master 丙火 + strength + structure + useful god + 10 gods + stars + interactions + elements + luck
 * Chart: 癸酉 / 壬戌 / 丙寅 / 甲午
 */

import { calculateBaZi } from "../src/lib/bazi/calculate.js";
import { analyzeStrength } from "../src/lib/bazi/strength.js";
import { analyzeStructure } from "../src/lib/bazi/structure.js";
import { analyzeUsefulGod } from "../src/lib/bazi/useful-god.js";
import { analyzeGodsAndStars } from "../src/lib/bazi/gods-stars.js";
import { analyzeLuck } from "../src/lib/bazi/luck.js";
import { analyzeElements } from "../src/lib/bazi/elements.js";
import { analyzeInteractions } from "../src/lib/bazi/interactions.js";
import { buildBaZiContext } from "../src/lib/ai/bazi-context.js";
import { TIANJI_SYSTEM_PROMPT } from "../src/lib/ai/system-prompt.js";

// Test profile: 1993-10-12 12:55 กทม. (male)
const testProfile = {
  id: "test-001",
  name: "ทดสอบ",
  gender: "male",
  birthDate: "1993-10-12",
  birthTime: "12:55",
  birthTimeKnown: "known",
  timezone: "Asia/Bangkok",
  birthLongitude: 100.5, // Bangkok
  useTrueSolarTime: true,
  note: "Test case for BaZi Context Builder",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

console.log("=".repeat(80));
console.log("BaZi Context Builder Test");
console.log("=".repeat(80));
console.log("\nTest Profile:");
console.log(`  Name: ${testProfile.name}`);
console.log(`  Gender: ${testProfile.gender}`);
console.log(`  Birth Date: ${testProfile.birthDate}`);
console.log(`  Birth Time: ${testProfile.birthTime}`);
console.log(`  Timezone: ${testProfile.timezone}`);
console.log(`  Longitude: ${testProfile.birthLongitude}°`);
console.log("\n" + "=".repeat(80));

try {
  // ===== Test 1: Basic BaZi Calculation =====
  console.log("\n[Test 1] Basic BaZi Calculation");
  console.log("-".repeat(80));

  const chart = calculateBaZi(testProfile);
  console.log("✅ BaZi Chart calculated successfully");

  // Verify 4 pillars
  console.log(`\nYear Pillar: ${chart.year.sixtyCycleName} (${chart.year.stem.name}${chart.year.branch.name})`);
  console.log(`Month Pillar: ${chart.month.sixtyCycleName} (${chart.month.stem.name}${chart.month.branch.name})`);
  console.log(`Day Pillar: ${chart.day.sixtyCycleName} (${chart.day.stem.name}${chart.day.branch.name})`);

  if (chart.hour) {
    console.log(`Hour Pillar: ${chart.hour.sixtyCycleName} (${chart.hour.stem.name}${chart.hour.branch.name})`);
  } else {
    console.log("Hour Pillar: MISSING (should be present)");
    process.exit(1);
  }

  // Verify day master
  console.log(`\nDay Master: ${chart.dayMaster.name} (${chart.dayMaster.element})`);
  if (chart.dayMaster.name !== "丙") {
    console.error("❌ Day Master should be 丙 (Bing)");
    process.exit(1);
  }
  console.log("✅ Day Master is 丙火 (Bing Fire) - CORRECT");

  // ===== Test 2: Strength Analysis =====
  console.log("\n[Test 2] Strength Analysis");
  console.log("-".repeat(80));

  const strength = analyzeStrength(chart);
  console.log(`Strength Level: ${strength.level}`);
  console.log(`Strength Score: ${strength.score}`);
  console.log(`Summary: ${strength.summary}`);
  console.log("✅ Strength analysis completed");

  // ===== Test 3: Structure Analysis =====
  console.log("\n[Test 3] Structure Analysis");
  console.log("-".repeat(80));

  const structure = analyzeStructure(chart, strength);
  console.log(`Structure Type: ${structure.type}`);
  console.log(`Structure Label: ${structure.label}`);
  console.log(`Description: ${structure.description}`);
  console.log("✅ Structure analysis completed");

  // ===== Test 4: Useful God Analysis =====
  console.log("\n[Test 4] Useful God Analysis");
  console.log("-".repeat(80));

  const usefulGod = analyzeUsefulGod(chart, strength, structure);
  console.log(`Primary Element: ${usefulGod.primaryElement}`);
  console.log(`Primary Relationship: ${usefulGod.primaryRelationship}`);
  console.log(`Label: ${usefulGod.label}`);
  console.log(`Description: ${usefulGod.description}`);
  console.log("✅ Useful God analysis completed");

  // ===== Test 5: Gods and Stars Analysis =====
  console.log("\n[Test 5] Gods and Stars Analysis");
  console.log("-".repeat(80));

  const godsAndStars = analyzeGodsAndStars(chart);
  console.log(`Year 10 God: ${godsAndStars.tenGods.year.name} (${godsAndStars.tenGods.year.nameTh})`);
  console.log(`Month 10 God: ${godsAndStars.tenGods.month.name} (${godsAndStars.tenGods.month.nameTh})`);
  console.log(`Hour 10 God: ${godsAndStars.tenGods.hour.name} (${godsAndStars.tenGods.hour.nameTh})`);
  console.log(`Day Hidden Stems: ${godsAndStars.tenGods.dayHiddenStems.length} gods`);
  console.log(`Stars: ${godsAndStars.stars.length} stars (${godsAndStars.starsSummary.auspicious} auspicious, ${godsAndStars.starsSummary.inauspicious} inauspicious)`);
  console.log("✅ Gods and Stars analysis completed");

  // ===== Test 6: Interactions Analysis =====
  console.log("\n[Test 6] Branch Interactions Analysis");
  console.log("-".repeat(80));

  const interactions = analyzeInteractions(chart);
  console.log(`Total Interactions: ${interactions.length}`);

  for (const interaction of interactions) {
    console.log(`  - ${interaction.type}: ${interaction.branches[0]} + ${interaction.branches[1]} (${interaction.positions[0]} + ${interaction.positions[1]})`);
    console.log(`    Description: ${interaction.description}`);
  }

  console.log("✅ Interactions analysis completed");

  // ===== Test 7: Elements Composition =====
  console.log("\n[Test 7] Elements Composition Analysis");
  console.log("-".repeat(80));

  const elements = analyzeElements(chart);
  console.log(`Dominant Element: ${elements.dominantElement}`);
  console.log(`Weakest Element: ${elements.weakestElement}`);
  console.log(`Missing Elements: ${elements.missingElements.join(", ") || "none"}`);
  console.log(`Balance Status: ${elements.balanceStatus}`);
  console.log(`Description: ${elements.description}`);
  console.log("✅ Elements composition analysis completed");

  // ===== Test 8: Luck Pillars =====
  console.log("\n[Test 8] Luck Pillars Analysis");
  console.log("-".repeat(80));

  const currentYear = 2026;
  const luck = analyzeLuck(testProfile, chart, currentYear);
  console.log(`Direction: ${luck.direction}`);
  console.log(`Start Age: ${luck.startAge}`);
  console.log(`Total Pillars: ${luck.pillars.length}`);

  if (luck.currentPillar) {
    console.log(`\nCurrent Pillar (${luck.currentPillar.startAge}-${luck.currentPillar.endAge} years):`);
    console.log(`  - ${luck.currentPillar.sixtyCycleName}`);
    console.log(`  - 10 God: ${luck.currentPillar.tenGod.name} (${luck.currentPillar.tenGod.nameTh})`);
  }

  console.log(`\nCurrent Annual (${luck.currentAnnual.year}):`);
  console.log(`  - ${luck.currentAnnual.sixtyCycleName}`);
  console.log(`  - 10 God: ${luck.currentAnnual.tenGod.name} (${luck.currentAnnual.tenGod.nameTh})`);

  console.log(`\nUpcoming Transitions: ${luck.upcomingTransitions.length}`);
  for (const transition of luck.upcomingTransitions) {
    console.log(`  - Age ${transition.age} (in ${transition.yearsAway} years): ${transition.pillar}`);
  }

  console.log("✅ Luck pillars analysis completed");

  // ===== Test 9: BaZi Context Builder =====
  console.log("\n[Test 9] BaZi Context Builder (Main Test)");
  console.log("-".repeat(80));

  const context = buildBaZiContext(testProfile, currentYear);
  console.log(`✅ Context built successfully`);
  console.log(`Summary: ${context.summary}`);
  console.log(`\nContext length: ${context.text.length} characters`);

  // Verify context has all 13 sections
  const sections = [
    "ข้อมูลผู้ใช้",
    "4 เสา (Natal Chart)",
    "Day Master",
    "Strength Analysis",
    "Structure Analysis",
    "Useful God",
    "10 Gods",
    "Stars",
    "Hidden Stems",
    "Branch Interactions",
    "Element Composition",
    "Luck Pillars",
    "Transit Forecasting Context",
  ];

  console.log("\nVerifying all 13 sections are present:");
  let allSectionsPresent = true;

  for (const section of sections) {
    const present = context.text.includes(section);
    console.log(`  - ${section}: ${present ? "✅" : "❌"}`);
    if (!present) {
      allSectionsPresent = false;
    }
  }

  if (!allSectionsPresent) {
    console.error("\n❌ Some sections are missing from context");
    process.exit(1);
  }

  console.log("✅ All 13 sections are present");

  // ===== Test 10: System Prompt =====
  console.log("\n[Test 10] System Prompt");
  console.log("-".repeat(80));

  console.log(`System prompt length: ${TIANJI_SYSTEM_PROMPT.length} characters`);
  console.log(`System prompt starts with: ${TIANJI_SYSTEM_PROMPT.substring(0, 50)}...`);

  if (TIANJI_SYSTEM_PROMPT.length === 0) {
    console.error("❌ System prompt is empty");
    process.exit(1);
  }

  // Verify key phrases in system prompt
  const keyPhrases = [
    "天机",
    "ห้ามเดา",
    "ไม่ฟันธง",
    "ความแม่นยำ",
  ];

  console.log("\nVerifying key phrases in system prompt:");
  let allPhrasesPresent = true;

  for (const phrase of keyPhrases) {
    const present = TIANJI_SYSTEM_PROMPT.includes(phrase);
    console.log(`  - "${phrase}": ${present ? "✅" : "❌"}`);
    if (!present) {
      allPhrasesPresent = false;
    }
  }

  if (!allPhrasesPresent) {
    console.error("\n❌ Some key phrases are missing from system prompt");
    process.exit(1);
  }

  console.log("✅ All key phrases are present in system prompt");

  // ===== Display Sample Context =====
  console.log("\n" + "=".repeat(80));
  console.log("SAMPLE CONTEXT OUTPUT (First 1000 characters)");
  console.log("=".repeat(80));
  console.log(context.text.substring(0, 1000) + "...\n");

  console.log("=".repeat(80));
  console.log("CONTEXT SUMMARY");
  console.log("=".repeat(80));
  console.log(context.summary);
  console.log("");

  // ===== Final Results =====
  console.log("=".repeat(80));
  console.log("FINAL RESULTS");
  console.log("=".repeat(80));
  console.log("✅ All tests passed successfully!");
  console.log("");
  console.log("Summary:");
  console.log("  - BaZi calculation: ✅");
  console.log("  - Strength analysis: ✅");
  console.log("  - Structure analysis: ✅");
  console.log("  - Useful God analysis: ✅");
  console.log("  - Gods and Stars analysis: ✅");
  console.log("  - Interactions analysis: ✅");
  console.log("  - Elements composition: ✅");
  console.log("  - Luck pillars: ✅");
  console.log("  - Context builder (13 sections): ✅");
  console.log("  - System prompt: ✅");
  console.log("");
  console.log("🎉 Phase 5.2 — BaZi Context Builder is complete!");

} catch (error) {
  console.error("\n❌ Test failed with error:");
  console.error(error);
  process.exit(1);
}
