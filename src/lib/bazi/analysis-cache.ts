/**
 * analysis-cache.ts - ใหม่ๆ session cache สำหรับ BaZi analysis
 *
 * ใช้สำหรับ aggregation ข้าม profiles หลายๆ คนโดยไม่ต้อง recompute
 * - ใช้ profile.id เป็น key
 * - invalidate เมื่อ birth data เปลี่ยน (hash mismatch) หรือ currentYear เปลี่ยน
 * - LRU eviction เมื่อเกิน CACHE_CAPACITY (32 entries)
 * - v1: non-persistent, module-level Map ตายเมื่อ reload
 *
 * ⚠️ หมายเหตุ Date.now():
 * - cache เป็น runtime module (ไม่ใช่ engine-pure code)
 * - Date.now() ใช้เฉพาะสำหรับ LRU ordering เท่านั้น
 * - ไม่มีผลต่อความแม่นของการคำนวณ BaZi
 */

import type { Profile } from "@/types/profile";
import type { BaZiAnalysis } from "./use-bazi-analysis";

/**
 * ฟิลด์ที่มีผลต่อการคำนวณ BaZi (8 ฟิลด์)
 * - การเปลี่ยนแปลงฟิลด์เหล่านี้ → hash เปลี่ยน → invalidate cache
 * - ฟิลด์อื่นๆ (name, note, etc.) → ไม่มีผล → hash เดิม
 */
const BIRTH_INPUT_FIELDS = [
  "gender",
  "birthDate",
  "birthTime",
  "birthTimeKnown",
  "timezone",
  "birthLongitude",
  "useTrueSolarTime",
  "birthLocationKey",
] as const;

/**
 * สร้าง deterministic hash จาก birth-input fields ทั้ง 8
 *
 * @param profile - ข้อมูลผู้ใช้
 * @returns string hash ที่ stable (เรียง key ตายตัว)
 */
export function hashProfile(profile: Profile): string {
  // สร้าง object เฉพาะ 8 ฟิลด์ที่เป็น birth input ใน key order ที่ fix ไว้
  const birthInput: Record<string, unknown> = {};

  for (const field of BIRTH_INPUT_FIELDS) {
    // Cast through unknown เพื่อ avoid TypeScript overlap error
    birthInput[field] = (profile as unknown as Record<string, unknown>)[field];
  }

  // JSON.stringify กับ key order ที่ fix ไว้ → deterministic hash
  // ไม่ต้องใช้ crypto เพราะ string เดิม = hash เดียวกัน (เพียงพอสำหรับ cache key)
  return JSON.stringify(birthInput);
}

/**
 * Cache entry พร้อม timestamp สำหรับ LRU
 */
export interface CacheEntry {
  hash: string;
  computedYear: number;
  analysis: BaZiAnalysis;
  /** last access timestamp for LRU eviction (Date.now()) */
  accessedAt: number;
}

/**
 * จำนวนสูงสุดก่อน LRU eviction
 * - ในความเป็นจริง N=2-10 profiles (ครอบครัว/คนรู้จัก)
 * - 32 = generous headroom สำหรับ test/demo ที่มี profiles เยอะๆ
 */
export const CACHE_CAPACITY = 32;

/**
 * Module-level cache (Map ตามเมื่อ reload)
 */
const cache = new Map<string, CacheEntry>();

/**
 * ดึง cached analysis หรือ compute ใหม่ถ้าจำเป็น
 *
 * Logic:
 * 1. lookup ตาม profile.id
 * 2. ถ้าเจอ → verify hash + year match
 * 3. ถ้า match → bump accessedAt แล้ว return
 * 4. ถ้าไม่ match (หรือไม่มี entry) → compute → store → LRU evict ถ้าเกิน capacity → return
 *
 * @param profile - ข้อมูลผู้ใช้
 * @param currentYear - ปีปัจจุบัน (luck cursors depend on year)
 * @param compute - function ที่ compute BaZiAnalysis (decouples cache from engine)
 * @returns BaZiAnalysis - ผลวิเคราะห์ (เป็น cached หรือ compute ใหม่)
 */
export function getAnalysis(
  profile: Profile,
  currentYear: number,
  compute: (profile: Profile, currentYear: number) => BaZiAnalysis
): BaZiAnalysis {
  const profileId = profile.id;
  const currentHash = hashProfile(profile);
  const now = Date.now(); // ✅ ใช้ได้: runtime module, LRU ordering เท่านั้น

  const existing = cache.get(profileId);

  // Warm hit: entry exists + hash match + year match → return cached
  if (existing) {
    if (existing.hash === currentHash && existing.computedYear === currentYear) {
      // bump accessedAt
      existing.accessedAt = now;
      return existing.analysis;
    }
    // Miss: entry exists แต่ hash/year mismatch → recompute
  }

  // Cold miss or invalid → compute new
  const analysis = compute(profile, currentYear);

  // Store new entry
  cache.set(profileId, {
    hash: currentHash,
    computedYear: currentYear,
    analysis,
    accessedAt: now,
  });

  // LRU eviction ถ้าเกิน capacity
  if (cache.size > CACHE_CAPACITY) {
    let lruId: string | null = null;
    let lruTime = Infinity;

    for (const [id, entry] of cache.entries()) {
      if (entry.accessedAt < lruTime) {
        lruTime = entry.accessedAt;
        lruId = id;
      }
    }

    if (lruId) {
      cache.delete(lruId);
    }
  }

  return analysis;
}

/**
 * Invalidate cache ของ profile หนึ่งๆ (เช่น หลังจาก edit)
 *
 * @param profileId - id ของ profile ที่จะ invalidate
 */
export function invalidateProfile(profileId: string): void {
  cache.delete(profileId);
}

/**
 * Invalidate ทุก entries (เช่น หลังจาก engine update หรือ test cleanup)
 */
export function invalidateAll(): void {
  cache.clear();
}

/**
 * Read-only peek สำหรับ debugging/tests
 * - ไม่ bump accessedAt
 * - ไม่ modify cache
 *
 * @returns Array of [id, entry] tuples
 */
export function peekAll(): ReadonlyArray<readonly [string, CacheEntry]> {
  return Array.from(cache.entries());
}

/**
 * จำนวน entries ปัจจุบัน (สำหรับ tests)
 *
 * @returns cache.size
 */
export function cacheSize(): number {
  return cache.size;
}
