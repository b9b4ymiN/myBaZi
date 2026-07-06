#!/usr/bin/env node
/**
 * Test script for findRelativeProfile — relative resolution (N=1)
 *
 * ตรวจสอบการเลือก relative profile ตาม targetRole + priority + sameRoleCount
 *
 * Run: tsx scripts/test-find-relative.mjs
 */

import { findRelativeProfile } from "../src/lib/ai/relationship-context.js";

const self = {
  id: "self",
  name: "ฉัน",
  gender: "male",
  birthDate: "1990-01-01",
  birthTime: "12:00",
  birthTimeKnown: "known",
  timezone: "Asia/Bangkok",
  relationship: "self",
  createdAt: "2020-01-01T00:00:00.000Z",
  updatedAt: "2020-01-01T00:00:00.000Z",
};

function makeProfile(id, name, relationship, createdAtOffset = 0) {
  const base = new Date("2021-01-01T00:00:00.000Z").getTime();
  const d = new Date(base + createdAtOffset).toISOString();
  return {
    id,
    name,
    gender: "female",
    birthDate: "1991-01-01",
    birthTime: "10:00",
    birthTimeKnown: "known",
    timezone: "Asia/Bangkok",
    relationship,
    createdAt: d,
    updatedAt: d,
  };
}

let passed = 0;
let failed = 0;

function assertMatch(label, profiles, targetRole, expectedId, expectedRole, expectedCount) {
  const match = findRelativeProfile(profiles, self, targetRole);
  const ok =
    match &&
    match.profile.id === expectedId &&
    match.role === expectedRole &&
    match.sameRoleCount === expectedCount;
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
    console.log(`      expected: id=${expectedId}, role=${expectedRole}, count=${expectedCount}`);
    console.log(
      `      actual:   ${match ? `id=${match.profile.id}, role=${match.role}, count=${match.sameRoleCount}` : "null"}`
    );
  }
}

function assertNull(label, profiles, targetRole) {
  const match = findRelativeProfile(profiles, self, targetRole);
  const ok = match === null;
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
    console.log(`      expected: null, actual: id=${match.profile.id}`);
  }
}

console.log("=".repeat(80));
console.log("findRelativeProfile — relative resolution (N=1)");
console.log("=".repeat(80));

console.log("\n— Specific role match —");
assertMatch("spouse", [self, makeProfile("p1", "แฟน", "spouse")], "spouse", "p1", "spouse", 1);
assertMatch("mother", [self, makeProfile("p2", "แม่", "mother")], "mother", "p2", "mother", 1);
assertMatch("father", [self, makeProfile("p3", "พ่อ", "father")], "father", "p3", "father", 1);

console.log("\n— any-relative priority —");
assertMatch(
  "any-relative: mother (friend ไม่อยู่ใน priority)",
  [self, makeProfile("f", "เพื่อน", "friend"), makeProfile("m", "แม่", "mother")],
  "any-relative",
  "m",
  "mother",
  1
);
assertMatch(
  "any-relative: spouse over mother",
  [self, makeProfile("sp", "คู่ครอง", "spouse"), makeProfile("m", "แม่", "mother")],
  "any-relative",
  "sp",
  "spouse",
  1
);

console.log("\n— child (son priority over daughter) —");
assertMatch(
  "child: son over daughter",
  [self, makeProfile("d", "ลูกสาว", "daughter"), makeProfile("s", "ลูกชาย", "son")],
  "child",
  "s",
  "son",
  1
);

console.log("\n— Multiple in same role (earliest createdAt) —");
const motherEarly = makeProfile("m1", "แม่1", "mother", 0);
const motherLate = makeProfile("m2", "แม่2", "mother", 86400000); // +1 day
assertMatch(
  "2 mothers → earliest + count=2",
  [self, motherLate, motherEarly],
  "mother",
  "m1",
  "mother",
  2
);

console.log("\n— Exclude self —");
assertNull("only self in list", [self], "spouse");
assertMatch(
  "exclude profile relationship=self",
  [self, makeProfile("s2", "self2", "self"), makeProfile("m", "แม่", "mother")],
  "mother",
  "m",
  "mother",
  1
);

console.log("\n— No match → null —");
assertNull("no relatives", [self], "mother");
assertNull(
  "targetRole mother but only spouse exists",
  [self, makeProfile("sp", "คู่ครอง", "spouse")],
  "mother"
);

console.log("\n" + "=".repeat(80));
console.log(`Result: ${passed} passed, ${failed} failed`);
console.log("=".repeat(80));

if (failed > 0) process.exit(1);
