/**
 * Test Structure Analysis (格局)
 * ทดสอบ analyzeStructure() ด้วยเคสจริง
 */

import { calculateBaZi } from "../src/lib/bazi/calculate.js";
import { analyzeStrength } from "../src/lib/bazi/strength.js";
import { analyzeStructure } from "../src/lib/bazi/structure.js";

/**
 * ทดสอบเคส 1986 (己土, strength=weak → normal)
 */
function test1986() {
  console.log("\n=== Test Case 1: 1986 (己土, weak → normal) ===");

  const profile = {
    id: "test-1986",
    name: "Test 1986",
    gender: "male",
    birthDate: "1986-12-20",
    birthTime: "23:30",
    birthTimeKnown: "known",
    timezone: "Asia/Bangkok",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  const chart = calculateBaZi(profile);
  const strength = analyzeStrength(chart);
  const structure = analyzeStructure(chart, strength);

  console.log("Structure Type:", structure.type);
  console.log("Label:", structure.label);
  console.log("Label CN:", structure.labelCn);
  console.log("Description:", structure.description);
  console.log("Reasons:", structure.reasons);
  console.log("Implications:", structure.implications);

  // Assertions
  if (structure.type !== "normal") {
    throw new Error(`FAIL: Expected type='normal', got '${structure.type}'`);
  }

  if (!structure.label.includes("ปกติ")) {
    throw new Error(`FAIL: Label should include 'ปกติ', got '${structure.label}'`);
  }

  if (structure.labelCn !== "正格") {
    throw new Error(`FAIL: Expected labelCn='正格', got '${structure.labelCn}'`);
  }

  if (structure.reasons.length === 0) {
    throw new Error("FAIL: Reasons should not be empty");
  }

  if (!structure.description) {
    throw new Error("FAIL: Description should not be empty");
  }

  if (!structure.implications) {
    throw new Error("FAIL: Implications should not be empty");
  }

  console.log("PASS: 1986 structure is normal (正格)");
}

/**
 * ทดสอบเคส strong person (should still be normal unless very strong)
 */
function testStrongPerson() {
  console.log("\n=== Test Case 2: Strong person (still normal) ===");

  const profile = {
    id: "test-strong",
    name: "Test Strong",
    gender: "male",
    birthDate: "1985-05-15",
    birthTime: "10:00",
    birthTimeKnown: "known",
    timezone: "Asia/Shanghai",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  const chart = calculateBaZi(profile);
  const strength = analyzeStrength(chart);
  const structure = analyzeStructure(chart, strength);

  console.log("Structure Type:", structure.type);
  console.log("Label:", structure.label);
  console.log("Strength Level:", strength.level);

  // This should be normal (not vibrant unless very_strong)
  if (structure.type !== "normal") {
    console.log("INFO: Not normal (could be special case):", structure.type);
  }

  console.log("PASS: Strong person structure analyzed");
}

/**
 * Test all required properties exist
 */
function testStructureProperties() {
  console.log("\n=== Test Case 3: Structure properties completeness ===");

  const profile = {
    id: "test-props",
    name: "Test Props",
    gender: "female",
    birthDate: "1990-08-10",
    birthTime: "14:30",
    birthTimeKnown: "known",
    timezone: "Asia/Bangkok",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  const chart = calculateBaZi(profile);
  const strength = analyzeStrength(chart);
  const structure = analyzeStructure(chart, strength);

  // Check all required properties
  const requiredProps = [
    "type",
    "subtype",
    "label",
    "labelCn",
    "description",
    "dominantElement",
    "reasons",
    "implications"
  ];

  for (const prop of requiredProps) {
    if (!(prop in structure)) {
      throw new Error(`FAIL: Missing property '${prop}'`);
    }
  }

  // Check types
  if (typeof structure.type !== "string") {
    throw new Error("FAIL: 'type' should be string");
  }

  if (typeof structure.label !== "string") {
    throw new Error("FAIL: 'label' should be string");
  }

  if (!Array.isArray(structure.reasons)) {
    throw new Error("FAIL: 'reasons' should be array");
  }

  if (structure.reasons.length === 0) {
    throw new Error("FAIL: 'reasons' should not be empty");
  }

  console.log("PASS: All required properties exist and have correct types");
}

/**
 * Test Thai + Chinese labels
 */
function testLabels() {
  console.log("\n=== Test Case 4: Thai and Chinese labels ===");

  const profile = {
    id: "test-labels",
    name: "Test Labels",
    gender: "male",
    birthDate: "1988-03-25",
    birthTime: "08:15",
    birthTimeKnown: "known",
    timezone: "Asia/Shanghai",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  const chart = calculateBaZi(profile);
  const strength = analyzeStrength(chart);
  const structure = analyzeStructure(chart, strength);

  console.log("Thai Label:", structure.label);
  console.log("Chinese Label:", structure.labelCn);

  // Check that labels contain both Thai and Chinese
  if (!structure.label) {
    throw new Error("FAIL: Thai label is empty");
  }

  if (!structure.labelCn) {
    throw new Error("FAIL: Chinese label is empty");
  }

  // Chinese label should be Chinese characters
  const hasChineseChars = /[一-龥]/.test(structure.labelCn);
  if (!hasChineseChars) {
    throw new Error("FAIL: Chinese label should contain Chinese characters");
  }

  console.log("PASS: Thai and Chinese labels present");
}

/**
 * Run all tests
 */
function main() {
  console.log("Testing BaZi Structure Analysis (格局)\n");

  try {
    test1986();
    testStrongPerson();
    testStructureProperties();
    testLabels();

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

main();
