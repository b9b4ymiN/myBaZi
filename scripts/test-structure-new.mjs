/**
 * Simple test for Structure Analysis
 */

import { calculateBaZi } from "../src/lib/bazi/calculate.js";
import { analyzeStrength } from "../src/lib/bazi/strength.js";
import { analyzeStructure } from "../src/lib/bazi/structure.js";

console.log("Testing Structure Analysis...");

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

try {
  const chart = calculateBaZi(profile);
  console.log("Chart calculated");

  const strength = analyzeStrength(chart);
  console.log("Strength analyzed");

  const structure = analyzeStructure(chart, strength);
  console.log("Structure analyzed");

  console.log("Structure Type:", structure.type);
  console.log("Label:", structure.label);
  console.log("SUCCESS!");
} catch (error) {
  console.error("FAILED:", error);
  process.exit(1);
}
