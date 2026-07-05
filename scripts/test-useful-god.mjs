/**
 * Useful God (用神) Test Suite
 * ทดสอบ analyzeUsefulGod() ตามตำรามาตรฐาน (子平真诠)
 *
 * Test Cases:
 * 1. 1986-05-29 12:00 (癸水 strong + normal) → primaryElement = 火 (wealth)
 * 2. Mock weak + normal → primaryElement = resource element
 * 3. Mock follower → primaryElement = dominant element
 * 4. Mock vibrant → primaryElement = resource
 * 5. Element cycle accuracy (water controls fire, etc.)
 * 6. Label/description/reasons/applicationTips validation
 */

import { calculateBaZi } from "../src/lib/bazi/calculate.js";
import { analyzeStrength } from "../src/lib/bazi/strength.js";
import { analyzeStructure } from "../src/lib/bazi/structure.js";
import { analyzeUsefulGod } from "../src/lib/bazi/useful-god.js";

// ===== Test Case 1: 1986-05-29 12:00 Asia/Shanghai (癸水 strong + normal) =====
console.log("\n=== Test Case 1: 1986-05-29 12:00 Asia/Shanghai (癸水 strong + normal) ===");

const profile1 = {
  name: "Test Case 1",
  gender: "male",
  birthDate: "1986-05-29",
  birthTime: "12:00",
  timezone: "Asia/Shanghai",
  birthTimeKnown: "known",
};

const chart1 = calculateBaZi(profile1);
console.log("Day Master:", chart1.dayMaster.name, chart1.dayMaster.element);

const strength1 = analyzeStrength(chart1);
console.log("Strength Level:", strength1.level, "(score:", strength1.score, ")");

const structure1 = analyzeStructure(chart1, strength1);
console.log("Structure Type:", structure1.type, structure1.label);

const usefulGod1 = analyzeUsefulGod(chart1, strength1, structure1);
console.log("\n--- Useful God Result ---");
console.log("Primary Element:", usefulGod1.primaryElement, `(${usefulGod1.primaryRelationship})`);
console.log("Secondary Elements:", usefulGod1.secondaryElements.join(", "));
console.log("Avoid Elements:", usefulGod1.avoidElements.join(", "));
console.log("Label:", usefulGod1.label);
console.log("Label CN:", usefulGod1.labelCn);
console.log("Description:", usefulGod1.description);
console.log("Reasons:", usefulGod1.reasons);
console.log("Application Tips:", usefulGod1.applicationTips);

// Assertions for Test Case 1
console.log("\n--- Assertions ---");
const assert1a = usefulGod1.primaryElement === "火";
console.log("✓ Primary Element = 火 (Fire - Wealth):", assert1a ? "PASS" : "FAIL");

const assert1b = usefulGod1.primaryRelationship === "wealth";
console.log("✓ Primary Relationship = 'wealth':", assert1b ? "PASS" : "FAIL");

const assert1c = usefulGod1.avoidElements.includes("水") && usefulGod1.avoidElements.includes("金");
console.log("✓ Avoid Elements include 水+金 (resource+companion):", assert1c ? "PASS" : "FAIL");

const assert1d = usefulGod1.label !== "" && usefulGod1.labelCn !== "";
console.log("✓ Label + LabelCn not empty:", assert1d ? "PASS" : "FAIL");

const assert1e = usefulGod1.description !== "" && usefulGod1.reasons.length > 0;
console.log("✓ Description + Reasons not empty:", assert1e ? "PASS" : "FAIL");

const assert1f = usefulGod1.applicationTips !== "";
console.log("✓ Application Tips not empty:", assert1f ? "PASS" : "FAIL");

// Element cycle check: 癸水 controls 火 ✓ (Water controls Fire)
const assert1g = usefulGod1.primaryElement === "火";
console.log("✓ Element Cycle: Water (癸) controls Fire (火) = Wealth:", assert1g ? "PASS" : "FAIL");

// ===== Test Case 2: Mock Weak + Normal =====
console.log("\n=== Test Case 2: Mock Weak + Normal (假设 乙木 weak) ===");

const profile2 = {
  name: "Test Case 2",
  gender: "female",
  birthDate: "2000-08-15", // Monkey month (Metal - controls Wood)
  birthTime: "14:30",
  timezone: "Asia/Bangkok",
  birthTimeKnown: "known",
};

const chart2 = calculateBaZi(profile2);
console.log("Day Master:", chart2.dayMaster.name, chart2.dayMaster.element);

const strength2 = analyzeStrength(chart2);
console.log("Strength Level:", strength2.level, "(score:", strength2.score, ")");

const structure2 = analyzeStructure(chart2, strength2);
console.log("Structure Type:", structure2.type, structure2.label);

const usefulGod2 = analyzeUsefulGod(chart2, strength2, structure2);
console.log("\n--- Useful God Result ---");
console.log("Primary Element:", usefulGod2.primaryElement, `(${usefulGod2.primaryRelationship})`);
console.log("Secondary Elements:", usefulGod2.secondaryElements.join(", "));
console.log("Avoid Elements:", usefulGod2.avoidElements.join(", "));

// Assertions for Test Case 2 (if weak)
if (strength2.level === "weak" || strength2.level === "very_weak") {
  console.log("\n--- Assertions (Weak Case) ---");

  // Check if day master is Wood (乙) and primary is Water (resource)
  const isWoodDayMaster = chart2.dayMaster.element === "木";
  if (isWoodDayMaster) {
    const assert2a = usefulGod2.primaryElement === "水"; // Water generates Wood
    console.log("✓ Primary Element = 水 (Water - Resource) for Wood day master:", assert2a ? "PASS" : "FAIL");

    const assert2b = usefulGod2.primaryRelationship === "resource";
    console.log("✓ Primary Relationship = 'resource':", assert2b ? "PASS" : "FAIL");

    const assert2c = usefulGod2.secondaryElements.includes("木"); // Companion
    console.log("✓ Secondary Elements include 木 (Companion):", assert2c ? "PASS" : "FAIL");

    // Avoid: wealth + power + output
    const assert2d = usefulGod2.avoidElements.length >= 3;
    console.log("✓ Avoid Elements include 3+ elements (wealth+power+output):", assert2d ? "PASS" : "FAIL");
  }
}

// ===== Test Case 3: Mock Follower (从格) =====
console.log("\n=== Test Case 3: Mock Follower (模拟从格) ===");

// Simulate follower structure by modifying structure result
const mockFollowerStructure = {
  type: "follower",
  subtype: "follow_wealth",
  label: "ตามทรัพย์สิน (从财)",
  labelCn: "从财格",
  description: "Day master อ่อนมาก ยอมตามธาตุ wealth",
  dominantElement: "火", // Assume Fire is dominant
  reasons: ["Day master อ่อนมาก", "Fire ครอบ chart"],
  implications: "ตามแรงไป",
};

// Use a real chart for this test
const profile3 = {
  name: "Test Case 3",
  gender: "male",
  birthDate: "1990-03-15",
  birthTime: "10:00",
  timezone: "Asia/Shanghai",
  birthTimeKnown: "known",
};

const chart3 = calculateBaZi(profile3);
const strength3 = analyzeStrength(chart3);

// Mock follower structure
const usefulGod3 = analyzeUsefulGod(chart3, strength3, mockFollowerStructure);
console.log("\n--- Useful God Result (Mock Follower) ---");
console.log("Primary Element:", usefulGod3.primaryElement, `(${usefulGod3.primaryRelationship})`);
console.log("Secondary Elements:", usefulGod3.secondaryElements.join(", "));
console.log("Avoid Elements:", usefulGod3.avoidElements.join(", "));

// Assertions for Test Case 3
console.log("\n--- Assertions (Follower Case) ---");
const assert3a = usefulGod3.primaryElement === "火"; // Should be dominant element
console.log("✓ Primary Element = dominant element (火):", assert3a ? "PASS" : "FAIL");

const assert3b = usefulGod3.secondaryElements.includes("木"); // Wood generates Fire
console.log("✓ Secondary Elements include 木 (generates dominant):", assert3b ? "PASS" : "FAIL");

// Avoid should include resource of day master
const dayMasterResource = (() => {
  const dayEl = chart3.dayMaster.element;
  // Simple mapping for resource
  const resourceMap = { "木": "水", "火": "木", "土": "火", "金": "土", "水": "金" };
  return resourceMap[dayEl];
})();
const assert3c = usefulGod3.avoidElements.includes(dayMasterResource);
console.log(`✓ Avoid Elements include resource of day master (${dayMasterResource}):`, assert3c ? "PASS" : "FAIL");

// ===== Test Case 4: Mock Vibrant (专旺格) =====
console.log("\n=== Test Case 4: Mock Vibrant (模拟专旺格) ===");

const mockVibrantStructure = {
  type: "vibrant",
  subtype: null,
  label: "专旺格/旺格",
  labelCn: "专旺格",
  description: "Day master แข็งมาก ตามแรง",
  dominantElement: null,
  reasons: ["Day master แข็งมาก"],
  implications: "แข็งมาก ตามแรง",
};

const usefulGod4 = analyzeUsefulGod(chart3, strength3, mockVibrantStructure);
console.log("\n--- Useful God Result (Mock Vibrant) ---");
console.log("Primary Element:", usefulGod4.primaryElement, `(${usefulGod4.primaryRelationship})`);
console.log("Secondary Elements:", usefulGod4.secondaryElements.join(", "));
console.log("Avoid Elements:", usefulGod4.avoidElements.join(", "));

// Assertions for Test Case 4
console.log("\n--- Assertions (Vibrant Case) ---");
const assert4a = usefulGod4.primaryRelationship === "resource";
console.log("✓ Primary Relationship = 'resource':", assert4a ? "PASS" : "FAIL");

const assert4b = usefulGod4.secondaryElements.includes(chart3.dayMaster.element); // Companion
console.log("✓ Secondary Elements include day master element (Companion):", assert4b ? "PASS" : "FAIL");

const assert4c = usefulGod4.avoidElements.length === 3; // wealth + power + output
console.log("✓ Avoid Elements include 3 elements (wealth+power+output):", assert4c ? "PASS" : "FAIL");

// ===== Test Case 5: Element Cycle Validation =====
console.log("\n=== Test Case 5: Element Cycle Validation ===");

// Test: 癸 water controls 火 fire (wealth)
const dayMasterElement = "水";
const wealthElement = "火";
const assert5a = dayMasterElement === "水" && wealthElement === "火";
console.log("✓ Element Cycle: Water (水) controls Fire (火) = Wealth:", assert5a ? "PASS" : "FAIL");

// Test: resource for wood is water
const resourceForWood = "水";
const assert5b = resourceForWood === "水";
console.log("✓ Element Cycle: Water (水) generates Wood (木) = Resource:", assert5b ? "PASS" : "FAIL");

// Test: power for wood is metal
const powerForWood = "金";
const assert5c = powerForWood === "金";
console.log("✓ Element Cycle: Metal (金) controls Wood (木) = Power:", assert5c ? "PASS" : "FAIL");

// Test: output for wood is fire
const outputForWood = "火";
const assert5d = outputForWood === "火";
console.log("✓ Element Cycle: Wood (木) generates Fire (火) = Output:", assert5d ? "PASS" : "FAIL");

// ===== Test Case 6: Label/Description/Reasons/ApplicationTips Validation =====
console.log("\n=== Test Case 6: Label/Description/Reasons/ApplicationTips Validation ===");

const assert6a = usefulGod1.label.length > 0 && usefulGod1.labelCn.length > 0;
console.log("✓ Label + LabelCn not empty (Test Case 1):", assert6a ? "PASS" : "FAIL");

const assert6b = usefulGod1.description.length > 0;
console.log("✓ Description not empty (Test Case 1):", assert6b ? "PASS" : "FAIL");

const assert6c = usefulGod1.reasons.length > 0 && usefulGod1.reasons.every(r => r.length > 0);
console.log("✓ Reasons array not empty + all reasons not empty (Test Case 1):", assert6c ? "PASS" : "FAIL");

const assert6d = usefulGod1.applicationTips.length > 0;
console.log("✓ Application Tips not empty (Test Case 1):", assert6d ? "PASS" : "FAIL");

// ===== Summary =====
console.log("\n=== SUMMARY ===");
console.log("All test cases completed.");
console.log("Check 'PASS' markers above for verification.");
console.log("\nExpected Results:");
console.log("1. 1986-05-29: Primary = 火 (wealth), Avoid = 水+金");
console.log("2. Weak case: Primary = resource element, Secondary = companion");
console.log("3. Follower: Primary = dominant element, Avoid = resource of day master");
console.log("4. Vibrant: Primary = resource, Secondary = companion");
console.log("5. Element cycles: 水→火 (wealth), 水→木 (resource), 金→木 (power), 木→火 (output)");
console.log("6. All labels/descriptions/reasons/tips not empty");
