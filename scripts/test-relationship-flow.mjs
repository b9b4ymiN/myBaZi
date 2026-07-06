#!/usr/bin/env node
/**
 * Integration test — Layer 4 (Relationship Context) assembly
 *
 * Verify wiring ครบ end-to-end ของ relative resolution โดยไม่ต้อง call AI:
 * detectIntent → findRelativeProfile → buildRelationshipContext
 *
 * จำลองสิ่งที่ orchestrator Layer 4 ทำจริง (orchestrator.ts:124-146)
 *
 * Run: tsx scripts/test-relationship-flow.mjs
 */

import { detectIntent } from "../src/lib/ai/intent-detector.js";
import { findRelativeProfile, buildRelationshipContext } from "../src/lib/ai/relationship-context.js";

const currentYear = 2026;

// Mock profiles (ตัวเอง + คู่ครอง + แม่)
const self = {
  id: "self", name: "THP", gender: "male",
  birthDate: "1990-05-15", birthTime: "12:00", birthTimeKnown: "known",
  timezone: "Asia/Bangkok", relationship: "self",
  createdAt: "2020-01-01T00:00:00.000Z", updatedAt: "2020-01-01T00:00:00.000Z",
};
const spouse = {
  id: "sp", name: "มะลิ", gender: "female",
  birthDate: "1992-08-20", birthTime: "06:30", birthTimeKnown: "known",
  timezone: "Asia/Bangkok", relationship: "spouse",
  createdAt: "2020-02-01T00:00:00.000Z", updatedAt: "2020-02-01T00:00:00.000Z",
};
const mother = {
  id: "mom", name: "แม่", gender: "female",
  birthDate: "1965-03-10", birthTime: "04:00", birthTimeKnown: "known",
  timezone: "Asia/Bangkok", relationship: "mother",
  createdAt: "2020-03-01T00:00:00.000Z", updatedAt: "2020-03-01T00:00:00.000Z",
};

let passed = 0;
let failed = 0;

function check(label, cond, detail = "") {
  if (cond) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}${detail ? `\n      ${detail}` : ""}`);
  }
}

/**
 * จำลอง orchestrator Layer 4 assembly — คืน system message content (หรือ null)
 */
function assembleRelationshipLayer(userMessage, profiles, selfProfile) {
  const intent = detectIntent(userMessage, currentYear);
  if (intent.intent !== "six_relative") return { intent, message: null };
  if (profiles.length === 0) return { intent, message: null };

  const targetRole = intent.extracted?.targetRole ?? "any-relative";
  const match = findRelativeProfile(profiles, selfProfile, targetRole);
  if (match) {
    const ctx = buildRelationshipContext(selfProfile, match.profile, currentYear, {
      sameRoleCount: match.sameRoleCount,
    });
    return { intent, message: `## Relationship Context\n\n${ctx.text}`, match };
  }
  // (ใน orchestrator จริง → inject buildMissingRelativeNote; ที่นี่คืน sentinel เพื่อทดสอบ)
  return { intent, message: null, match: null, missingRole: targetRole };
}

console.log("=".repeat(80));
console.log("Integration — Layer 4 Relationship Context assembly");
console.log("=".repeat(80));

const profiles = [self, spouse, mother];

console.log("\n— Scenario 1: ถามคู่ครอง (มี spouse profile) —");
{
  const { intent, message, match } = assembleRelationshipLayer("คู่ครองเป็นคนแบบไหน", profiles, self);
  check("intent = six_relative", intent.intent === "six_relative", `got ${intent.intent}`);
  check("targetRole = spouse", intent.extracted?.targetRole === "spouse", `got ${intent.extracted?.targetRole}`);
  check("match = spouse profile", match?.profile.id === "sp", `got ${match?.profile.id}`);
  check("context injected (non-null)", message !== null);
  check("header = 'ความสัมพันธ์กับ คู่ครอง'", message?.includes("ความสัมพันธ์กับ คู่ครอง"), message?.split("\n")[2]);
}

console.log("\n— Scenario 2: ถามแม่ (มี mother profile) —");
{
  const { intent, message, match } = assembleRelationshipLayer("แม่ของฉันเป็นคนแบบไหน", profiles, self);
  check("targetRole = mother", intent.extracted?.targetRole === "mother");
  check("match = mother profile", match?.profile.id === "mom");
  check("header = 'ความสัมพันธ์กับ แม่'", message?.includes("ความสัมพันธ์กับ แม่"), message?.split("\n")[2]);
}

console.log("\n— Scenario 3: ถามคู่ครอง แต่ไม่มี spouse ในระบบ (เหลือแค่ self + mother) —");
{
  const { intent, match, missingRole } = assembleRelationshipLayer(
    "คู่ครองจะเป็นยังไง",
    [self, mother],
    self
  );
  check("intent = six_relative", intent.intent === "six_relative");
  check("targetRole = spouse", intent.extracted?.targetRole === "spouse");
  check("match = null (no spouse)", match === null);
  check("missingRole flagged = spouse", missingRole === "spouse", `got ${missingRole}`);
  // (orchestrator จริงจะ inject note แนะนำเพิ่ม profile)
}

console.log("\n— Scenario 4: ถามครอบครัว (any-relative → priority spouse) —");
{
  const { intent, match } = assembleRelationshipLayer("ครอบครัวเป็นยังไงบ้าง", profiles, self);
  check("targetRole = any-relative", intent.extracted?.targetRole === "any-relative");
  check("priority pick = spouse (สูงสุด)", match?.profile.id === "sp", `got ${match?.profile.id}`);
}

console.log("\n— Scenario 5: คำถามทั่วไป (ไม่ใช่ relative) → ไม่ inject Layer 4 —");
{
  const { intent, message } = assembleRelationshipLayer("นิสัยฉันเป็นยังไง", profiles, self);
  check("intent = natal (not six_relative)", intent.intent !== "six_relative", `got ${intent.intent}`);
  check("Layer 4 skipped (message=null)", message === null);
}

console.log("\n— Scenario 6: blacklist — 'พ่อค้า' ต้องไม่ตก Layer 4 เป็น father —");
{
  const { intent } = assembleRelationshipLayer("พ่อค้าขายของดีไหม", profiles, self);
  check("intent != six_relative", intent.intent !== "six_relative", `got ${intent.intent}`);
}

console.log("\n" + "=".repeat(80));
console.log(`Result: ${passed} passed, ${failed} failed`);
console.log("=".repeat(80));

if (failed > 0) process.exit(1);
