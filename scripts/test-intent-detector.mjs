#!/usr/bin/env node
/**
 * Test script for Intent Detector — targetRole classification (六亲)
 *
 * ตรวจสอบการ classify role ของคำถาม relative + blacklist กัน false positive
 * ("พ่อค้า" ต้องไม่ถูก detect เป็น "พ่อ")
 *
 * Run: tsx scripts/test-intent-detector.mjs
 */

import { detectIntent } from "../src/lib/ai/intent-detector.js";

const currentYear = 2026;

let passed = 0;
let failed = 0;

function assertRole(label, message, expectedRole) {
  const result = detectIntent(message, currentYear);
  const actualRole = result.intent === "six_relative" ? result.extracted?.targetRole : null;
  const ok =
    expectedRole === null
      ? result.intent !== "six_relative"
      : result.intent === "six_relative" && actualRole === expectedRole;
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
    console.log(`      input:    "${message}"`);
    console.log(
      `      expected: ${expectedRole === null ? "(not six_relative)" : `six_relative/${expectedRole}`}`
    );
    console.log(`      actual:   ${result.intent}${actualRole ? `/${actualRole}` : ""}`);
  }
}

console.log("=".repeat(80));
console.log("Intent Detector — targetRole classification (六亲)");
console.log("=".repeat(80));

console.log("\n— Specific role —");
assertRole("แม่", "แม่เป็นคนแบบไหน", "mother");
assertRole("พ่อ", "พ่อของฉันเข้มแข็งไหม", "father");
assertRole("สามี", "สามีฉันเป็นยังไง", "spouse");
assertRole("ภรรยา", "ภรรยาจะคิดยังไง", "spouse");
assertRole("แฟน", "แฟนรักฉันไหม", "spouse");
assertRole("คู่ครอง", "คู่ครองเข้ากันไหม", "spouse");
assertRole("เนื้อคู่", "เนื้อคู่จะเจอเมื่อไหร่", "spouse");
assertRole("ลูกชาย", "ลูกชายเรียนเก่งไหม", "son");
assertRole("ลูกสาว", "ลูกสาวฉันเป็นยังไง", "daughter");
assertRole("ลูก generic", "ลูกจะเป็นยังไงในอนาคต", "child");
assertRole("พี่น้อง", "พี่น้องสนิทกันไหม", "sibling");

console.log("\n— Multi-person (any-relative) —");
assertRole("พ่อแม่", "พ่อแม่สบายดีไหม", "any-relative");
assertRole("ครอบครัว", "ครอบครัวเป็นยังไง", "any-relative");
assertRole("ญาติ", "ญาติพี่น้องเป็นยังไง", "any-relative");

console.log("\n— Blacklist (ต้องไม่ใช่ six_relative) —");
assertRole("พ่อค้า", "พ่อค้าขายของดี", null);
assertRole("แม่ค้า", "แม่ค้าตลาดสด", null);
assertRole("ลูกค้า", "ลูกค้ามาซื้อของเยอะ", null);
assertRole("ลูกชิ้น", "ลูกชิ้นอร่อยมาก", null);
assertRole("แม่น้ำ", "แม่น้ำเจ้าพระยา", null);
assertRole("ลูกบาศก์", "เล่นลูกบาศก์", null);

console.log("\n— Non-relative (fallback ไป natal/general) —");
assertRole("natal นิสัย", "นิสัยฉันเป็นยังไง", null);
assertRole("general", "วันนี้อากาศดีไหม", null);

console.log("\n" + "=".repeat(80));
console.log(`Result: ${passed} passed, ${failed} failed`);
console.log("=".repeat(80));

if (failed > 0) {
  process.exit(1);
}
